import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { generateAIResponse, parseAIResponse } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

type FileSeverity = "critical" | "high" | "medium" | "low";

interface ReviewBug {
  filename: string;
  line: number;
  severity: FileSeverity;
  message: string;
  suggestion: string;
}

interface ReviewResult {
  summary: string;
  bugs: ReviewBug[];
  praise: string;
}

type PullFile = Awaited<ReturnType<Octokit["pulls"]["listFiles"]>>["data"][number];

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;

  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function analyzeWithAI(
  diff: string,
  files: PullFile[]
): Promise<ReviewResult> {
  const prompt = `You are an expert code reviewer analyzing a GitHub pull request diff.

Each file section starts with ### filename and then shows a unified diff.
Lines starting with + are additions. Lines starting with - are removals.
The line numbers correspond to the NEW file's line numbers.

Respond ONLY with a JSON object (no markdown, no preamble) in this exact shape:
{
  "summary": "2-3 sentence overall assessment",
  "bugs": [
    {
      "filename": "exact/path/to/file.ts",
      "line": 42,
      "severity": "critical|high|medium|low",
      "message": "Description of the bug",
      "suggestion": "How to fix it"
    }
  ],
  "praise": "One thing done well"
}

Severity guide:
- critical: crashes, data loss, security vulnerabilities
- high: likely bugs, edge cases that will hit production
- medium: code smells, missing error handling
- low: style, naming, minor improvements

Here is the PR diff:

${diff}

Changed files:
${files.map((f) => `- ${f.filename}`).join("\n")}`;

  const raw = await generateAIResponse(prompt, {
    temperature: 0.3,
    maxTokens: 1500,
  });

  return parseAIResponse<ReviewResult>(raw, "PR review");
}

async function getInstallationToken(installationId: number): Promise<string> {
  if (!process.env.GITHUB_PRIVATE_KEY) {
    throw new Error("GITHUB_PRIVATE_KEY is not set");
  }

  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });

  const { token } = await auth({ type: "installation", installationId });
  return token;
}

async function createCheckRun(
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string
): Promise<number> {
  const { data } = await octokit.checks.create({
    owner,
    repo,
    name: "CodeHawk AI Review",
    head_sha: headSha,
    status: "in_progress",
    started_at: new Date().toISOString(),
    output: {
      title: "Reviewing your code...",
      summary:
        "CodeHawk is analyzing your changes. This usually takes 15-30 seconds.",
    },
  });
  return data.id;
}

async function completeCheckRun(
  octokit: Octokit,
  owner: string,
  repo: string,
  checkRunId: number,
  review: ReviewResult
): Promise<void> {
  const bugs = review.bugs ?? [];
  const hasCritical = bugs.some((b) => b.severity === "critical");
  const hasHigh = bugs.some((b) => b.severity === "high");

  const severityEmoji: Record<FileSeverity, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🔵",
  };

  const bugRows =
    bugs.length > 0
      ? bugs
          .map(
            (b) =>
              `| ${severityEmoji[b.severity]} ${b.severity} | \`${b.filename}:${b.line}\` | ${b.message} |`
          )
          .join("\n")
      : null;

  const summary = `
## CodeHawk Review

${review.summary}

${
  bugRows
    ? `### Issues Found

| Severity | Location | Issue |
|----------|----------|-------|
${bugRows}`
    : "### ✅ No issues found"
}

---
> 🌟 **Highlight:** ${review.praise}
>
> *Always verify AI findings manually*
`.trim();

  await octokit.checks.update({
    owner,
    repo,
    check_run_id: checkRunId,
    status: "completed",
    conclusion: hasCritical
      ? "failure"
      : hasHigh
        ? "action_required"
        : "success",
    completed_at: new Date().toISOString(),
    output: {
      title: hasCritical
        ? `🔴 ${bugs.length} issue${bugs.length > 1 ? "s" : ""} found — action required`
        : bugs.length > 0
          ? `🟡 ${bugs.length} suggestion${bugs.length > 1 ? "s" : ""}`
          : "✅ Looks good!",
      summary,
    },
  });
}

async function postReview(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number,
  commit_id: string,
  review: ReviewResult,
  files: PullFile[]
): Promise<void> {
  const bugs = review.bugs ?? [];

  const validLines = new Set<string>();
  for (const file of files) {
    if (!file.patch) continue;
    let currentLine = 0;
    for (const line of file.patch.split("\n")) {
      const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        currentLine = parseInt(match[1], 10) - 1;
        continue;
      }
      if (!line.startsWith("-")) {
        currentLine++;
        validLines.add(`${file.filename}:${currentLine}`);
      }
    }
  }

  const comments = bugs
    .filter((bug) => validLines.has(`${bug.filename}:${bug.line}`))
    .map((bug) => ({
      path: bug.filename,
      line: bug.line,
      side: "RIGHT" as const,
      body: `**[${bug.severity.toUpperCase()}]** ${bug.message}\n\n<details>\n<summary>💡 Suggestion</summary>\n\n${bug.suggestion}\n\n</details>`,
    }));

  console.log(
    `📝 Bugs: ${bugs.length} total, ${comments.length} with valid line numbers`
  );

  const counts: Record<FileSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  bugs.forEach((b) => counts[b.severity]++);

  const emoji = counts.critical > 0 ? "🚨" : "✅";

  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    commit_id,
    event: counts.critical > 0 ? "REQUEST_CHANGES" : "COMMENT",
    body: `## ${emoji} CodeHawk AI Review\n\n${review.summary}\n\n**Issues:** 🔴 ${counts.critical} critical · 🟠 ${counts.high} high · 🟡 ${counts.medium} medium · 🔵 ${counts.low} low\n\n> 🌟 ${review.praise}`,
    comments,
  });
}

async function reviewPR(payload: {
  repository: {
    id: number;
    owner: { login: string };
    name: string;
    private: boolean;
  };
  pull_request: {
    number: number;
    title: string;
    html_url: string;
    head: { sha: string };
  };
  installation: { id: number };
}): Promise<void> {
  const { repository, pull_request, installation } = payload;

  const octokit = new Octokit({
    auth: await getInstallationToken(installation.id),
  });

  const owner = repository.owner.login;
  const repo = repository.name;
  const prNumber = pull_request.number;
  const headSha = pull_request.head.sha;

  // ── 1. Resolve installation from DB ──────────────────────────
  const dbInstallation = await prisma.installation.findUnique({
    where: { id: installation.id },
  });

  if (!dbInstallation) {
    console.warn(
      `⚠️ Installation ${installation.id} not found in DB — review will run but won't be persisted`
    );
  }

  // ── 2. Upsert repository ──────────────────────────────────────
  let dbRepo = null;
  if (dbInstallation) {
    dbRepo = await prisma.repository.upsert({
      where: { id: repository.id },
      update: {
        fullName: `${owner}/${repo}`,
        private: repository.private,
      },
      create: {
        id: repository.id,
        installationId: installation.id,
        fullName: `${owner}/${repo}`,
        private: repository.private,
      },
    });
  }

  // ── 3. Create review record (in_progress) ────────────────────
  let dbReview = null;
  if (dbInstallation && dbRepo) {
    dbReview = await prisma.review.create({
      data: {
        repositoryId: dbRepo.id,
        userId: dbInstallation.userId,
        prNumber,
        prTitle: pull_request.title,
        prUrl: pull_request.html_url,
        headSha,
        status: "in_progress",
      },
    });
  }

  const checkRunId = await createCheckRun(octokit, owner, repo, headSha);

  try {
    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });
    const files = [...data];

    const diffText = files
      .filter((f) => f.patch)
      .map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
      .join("\n\n");

    const review = await analyzeWithAI(diffText, files);

    // ── 4. Persist completed review + bugs ────────────────────
    if (dbReview) {
      const bugs = review.bugs ?? [];
      await prisma.review.update({
        where: { id: dbReview.id },
        data: {
          status: "completed",
          summary: review.summary,
          praise: review.praise,
          totalBugs: bugs.length,
          criticalCount: bugs.filter((b) => b.severity === "critical").length,
          highCount: bugs.filter((b) => b.severity === "high").length,
          mediumCount: bugs.filter((b) => b.severity === "medium").length,
          lowCount: bugs.filter((b) => b.severity === "low").length,
          completedAt: new Date(),
          bugs: {
            create: bugs.map((b) => ({
              filename: b.filename,
              line: b.line,
              severity: b.severity,
              message: b.message,
              suggestion: b.suggestion,
            })),
          },
        },
      });
    }

    await completeCheckRun(octokit, owner, repo, checkRunId, review);
    await postReview(octokit, owner, repo, prNumber, headSha, review, files);
  } catch (err) {
    // ── 5. Mark review as failed ──────────────────────────────
    if (dbReview) {
      await prisma.review.update({
        where: { id: dbReview.id },
        data: { status: "failed" },
      });
    }

    await octokit.checks.update({
      owner,
      repo,
      check_run_id: checkRunId,
      status: "completed",
      conclusion: "failure",
      completed_at: new Date().toISOString(),
      output: {
        title: "Review failed",
        summary: `CodeHawk encountered an error: ${(err as Error).message}`,
      },
    });

    throw err;
  }
}

async function handleInstallation(payload: {
  action: string;
  installation: {
    id: number;
    account: { id: number; login: string; type: string };
  };
}): Promise<void> {
  const { action, installation } = payload;

  if (action === "deleted") {
    await prisma.installation.deleteMany({
      where: { id: installation.id },
    });
    console.log(`🗑️ Installation ${installation.id} removed from DB`);
    return;
  }

  if (action === "created") {
    const user = await prisma.user.findUnique({
      where: { githubId: String(installation.account.id) },
    });

    if (!user) {
      console.warn(
        `⚠️ No user found for GitHub account ${installation.account.id} — installation not persisted`
      );
      return;
    }

    await prisma.installation.upsert({
      where: { id: installation.id },
      update: {
        accountLogin: installation.account.login,
        accountType: installation.account.type,
      },
      create: {
        id: installation.id,
        userId: user.id,
        accountLogin: installation.account.login,
        accountType: installation.account.type,
      },
    });

    console.log(
      `✅ Installation ${installation.id} persisted for user ${user.username}`
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256") ?? "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  const payload = JSON.parse(body);

  if (event === "ping") {
    return NextResponse.json({ ok: true, message: "pong" });
  }

  if (event === "installation" || event === "installation_repositories") {
    handleInstallation(payload).catch(console.error);
    return NextResponse.json({ ok: true });
  }

  if (event !== "pull_request") {
    return NextResponse.json({ ok: true, message: "Not a pull request event" });
  }

  if (!["opened", "synchronize"].includes(payload.action)) {
    return NextResponse.json({ ok: true, message: "Action not relevant" });
  }

  reviewPR(payload).catch(console.error);

  return NextResponse.json({ ok: true, message: "Review in progress" });
}