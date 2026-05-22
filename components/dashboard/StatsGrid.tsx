import { Bug, GitPullRequest, ShieldCheck, Zap } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "../../app/dashboard/actions";

interface StatsGridProps {
  userId: string;
}

export default async function StatsGrid({ userId }: StatsGridProps) {
  const stats = await getDashboardStats(userId);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Pull Requests Reviewed
            </p>
            <p className="mt-2 text-3xl font-semibold">
              <CountUp value={stats.totalReviews} />
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
            <GitPullRequest className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 text-sm text-success">
          +{stats.weeklyReviews.toLocaleString()} this week
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Issues Detected
            </p>
            <p className="mt-2 text-3xl font-semibold">
              <CountUp value={stats.totalBugs} />
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 text-danger">
            <Bug className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-danger" />
            {stats.criticalCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange" />
            {stats.highCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {stats.mediumCount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Repositories Active
            </p>
            <p className="mt-2 text-3xl font-semibold">
              <CountUp value={stats.repoCount} />
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">Coverage across all installations</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Average Review Speed
            </p>
            <p className="mt-2 text-3xl font-semibold">~18s</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
            <Zap className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">Fast feedback keeps teams moving</p>
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`stat-skeleton-${index}`}
          className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-6 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
