import Link from "next/link";
import { FolderGit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getRepositories } from "@/app/dashboard/actions";

interface RepositoriesListProps {
  userId: string;
  selectedRepoId?: number;
}

export default async function RepositoriesList({
  userId,
  selectedRepoId,
}: RepositoriesListProps) {
  const repos = await getRepositories(userId);

  if (repos.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-muted backdrop-blur-sm">
        <p className="text-sm">No repositories connected yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {repos.map((repo) => {
        const total =
          repo.criticalCount + repo.highCount + repo.mediumCount + repo.lowCount;
        const lastReviewed = repo.lastReviewedAt
          ? formatDistanceToNow(repo.lastReviewedAt, { addSuffix: true })
          : "Never";
        const isSelected = selectedRepoId === repo.id;

        return (
          <div
            key={repo.id}
            className={`rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm ${
              isSelected ? "ring-1 ring-brand/40" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-brand" />
                <h3 className="text-base font-semibold">{repo.fullName}</h3>
              </div>
              <Badge variant="outline">
                {repo.private ? "Private" : "Public"}
              </Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>{repo.reviewCount.toLocaleString()} reviews</span>
              <span>Last reviewed {lastReviewed}</span>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                {total === 0 ? (
                  <div className="h-full w-full bg-success/40" />
                ) : (
                  <div className="flex h-full w-full">
                    {repo.criticalCount > 0 && (
                      <div
                        className="h-full bg-danger"
                        style={{ width: `${(repo.criticalCount / total) * 100}%` }}
                      />
                    )}
                    {repo.highCount > 0 && (
                      <div
                        className="h-full bg-orange"
                        style={{ width: `${(repo.highCount / total) * 100}%` }}
                      />
                    )}
                    {repo.mediumCount > 0 && (
                      <div
                        className="h-full bg-warning"
                        style={{ width: `${(repo.mediumCount / total) * 100}%` }}
                      />
                    )}
                    {repo.lowCount > 0 && (
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${(repo.lowCount / total) * 100}%` }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`?repoId=${repo.id}`}>View Reviews</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function RepositoriesListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`repo-skeleton-${index}`}
          className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-4 w-32" />
          <Skeleton className="mt-6 h-2 w-full" />
          <Skeleton className="mt-6 h-8 w-24" />
        </div>
      ))}
    </div>
  );
}
