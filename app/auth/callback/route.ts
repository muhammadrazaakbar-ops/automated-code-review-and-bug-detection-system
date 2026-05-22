// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  const githubMeta = data.user.user_metadata;

  // Upsert user in DB
  await prisma.user.upsert({
    where: { githubId: String(githubMeta.provider_id ?? data.user.id) },
    update: {
      username: githubMeta.user_name ?? githubMeta.name ?? "unknown",
      avatarUrl: githubMeta.avatar_url ?? null,
      email: data.user.email ?? null,
    },
    create: {
      githubId: String(githubMeta.provider_id ?? data.user.id),
      username: githubMeta.user_name ?? githubMeta.name ?? "unknown",
      avatarUrl: githubMeta.avatar_url ?? null,
      email: data.user.email ?? null,
    },
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}