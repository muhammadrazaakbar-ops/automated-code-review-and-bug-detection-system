import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StatsGrid, { StatsGridSkeleton } from "@/components/dashboard/StatsGrid";
import RecentReviews, {
  RecentReviewsSkeleton,
} from "@/components/dashboard/RecentReviews";
import RepositoriesList, {
  RepositoriesListSkeleton,
} from "@/components/dashboard/RepositoriesList";

export const metadata: Metadata = {
  title: "Dashboard — CodeHawk",
};

interface DashboardPageProps {
  searchParams?: { repoId?: string };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const repoId = searchParams?.repoId
    ? Number(searchParams.repoId)
    : undefined;

  return (
    <div className="space-y-10 pt-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Overview</h2>
        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsGrid userId={user.id} />
        </Suspense>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Reviews</h2>
          {repoId && (
            <span className="text-sm text-muted">
              Filtered by repository
            </span>
          )}
        </div>
        <Suspense fallback={<RecentReviewsSkeleton />}>
          <RecentReviews userId={user.id} limit={10} repositoryId={repoId} />
        </Suspense>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Repositories</h2>
        <Suspense fallback={<RepositoriesListSkeleton />}>
          <RepositoriesList userId={user.id} selectedRepoId={repoId} />
        </Suspense>
      </section>
    </div>
  );
}