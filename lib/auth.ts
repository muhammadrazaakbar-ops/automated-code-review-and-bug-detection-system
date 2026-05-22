import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function getGithubIdentityId(session: { user: { identities?: { id: string; provider?: string }[]; user_metadata?: Record<string, unknown>; id: string } }) {
  const identity = session.user.identities?.find(
    (item) => item.provider === "github",
  );
  const providerId = session.user.user_metadata?.provider_id;
  const fallback = session.user.id;
  return (identity?.id ?? providerId ?? fallback).toString();
}

export const getSupabaseSession = cache(async () => {
  const supabase = createClient();
  const response = (await supabase).auth.getSession()
  const session = (await response).data.session
  return session
});

export const getCurrentUser = cache(async () => {
  const session = await getSupabaseSession();
  if (!session) return null;

  const githubId = getGithubIdentityId({
    user: {
      identities: session.user.identities,
      user_metadata: session.user.user_metadata,
      id: session.user.id,
    },
  });

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: session.user.id }, { githubId }],
    },
  });

  return user;
});
