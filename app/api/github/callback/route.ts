// app/api/github/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function getPublicOrigin(request: NextRequest): string {
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

async function getAppOctokit(): Promise<Octokit> {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  });

  const { token } = await auth({ type: "app" });
  return new Octokit({ auth: token });
}

function resolveAccount(
  account: { login?: string; type?: string; name?: string | null } | null | undefined
): { accountLogin: string; accountType: string } {
  if (!account) return { accountLogin: "unknown", accountType: "User" };

  const accountLogin =
    "login" in account && account.login ? account.login : "unknown";
  const accountType =
    "type" in account && account.type ? account.type : "User";

  return { accountLogin, accountType };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");
  const origin = getPublicOrigin(request);

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, origin));

  if (!installationId) {
    return redirectTo("/?error=missing_installation");
  }

  const numericInstallationId = Number(installationId);

  const user = await getCurrentUser();
  if (!user) {
    return redirectTo(
      `/api/auth/signin?callbackUrl=/api/github/callback?installation_id=${installationId}&setup_action=${setupAction}`
    );
  }

  if (setupAction === "install") {
    try {
      const octokit = await getAppOctokit();
      const { data: installation } = await octokit.apps.getInstallation({
        installation_id: numericInstallationId,
      });

      const { accountLogin, accountType } = resolveAccount(
        installation.account
      );

      await prisma.installation.upsert({
        where: { id: numericInstallationId },
        update: { accountLogin, accountType },
        create: {
          id: numericInstallationId,
          userId: user.id,
          accountLogin,
          accountType,
        },
      });

      console.log(
        `✅ Installation ${installationId} saved for user ${user.username}`
      );

      return redirectTo("/dashboard?installed=true");
    } catch (err) {
      console.error("❌ Failed to save installation:", err);
      return redirectTo("/?error=installation_failed");
    }
  }

  if (setupAction === "update") {
    try {
      const octokit = await getAppOctokit();
      const { data: installation } = await octokit.apps.getInstallation({
        installation_id: numericInstallationId,
      });

      const { accountLogin, accountType } = resolveAccount(
        installation.account
      );

      await prisma.installation.update({
        where: { id: numericInstallationId },
        data: { accountLogin, accountType },
      });

      console.log(`🔄 Installation ${installationId} updated`);
    } catch (err) {
      console.error("❌ Failed to update installation:", err);
    }

    return redirectTo("/dashboard?updated=true");
  }

  return redirectTo("/?error=invalid_setup_action");
}