import Link from "next/link";
import { Folder, Check, ExternalLink, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewSheet, { type ReviewSheetData } from "@/components/dashboard/ReviewSheet";
import { getRecentReviews, type ReviewWithRelations } from "@/app/dashboard/actions";

interface RecentReviewsProps {
  userId: string;
  limit: number;
  repositoryId?: number;
}

interface Bug{
    id: number;
    filename: string;
    line: number;
    severity: string;
    message: string;
    suggestion: string;
}

function statusBadge(status: string) {
  switch (status) {
    case "in_progress":
      return (
        <Badge className="bg-sky-500/20 text-sky-300">
          <span className="mr-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-sky-400" />
          Reviewing...
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-danger/20 text-danger">
          <AlertTriangle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "completed":
    default:
      return (
        <Badge className="bg-success/20 text-success">
          <Check className="h-3 w-3" />
          Done
        </Badge>
      );
  }
}

export default async function RecentReviews({
  userId,
  limit,
  repositoryId,
}: RecentReviewsProps) {
  const reviews: ReviewWithRelations[] = await getRecentReviews(
    userId,
    limit,
    repositoryId,
  );

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-muted backdrop-blur-sm">
        <p className="text-sm">No reviews yet — open a PR in a connected repository.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">Repository</th>
              <th className="px-4 py-3">Pull Request</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Issues Found</th>
              <th className="px-4 py-3">Reviewed At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => {
              const issues = [
                { label: "critical", count: review.criticalCount, color: "bg-danger" },
                { label: "high", count: review.highCount, color: "bg-orange" },
                { label: "medium", count: review.mediumCount, color: "bg-warning" },
                { label: "low", count: review.lowCount, color: "bg-brand" },
              ];

              const reviewData: ReviewSheetData = {
                id: review.id,
                repositoryFullName: review.repository.fullName,
                prNumber: review.prNumber,
                prTitle: review.prTitle,
                prUrl: review.prUrl,
                status: review.status,
                summary: review.summary,
                praise: review.praise,
                bugs: review.bugs.map((bug:Bug) => ({
                  id: bug.id,
                  filename: bug.filename,
                  line: bug.line,
                  severity: bug.severity,
                  message: bug.message,
                  suggestion: bug.suggestion,
                })),
              };

              return (
                <tr
                  key={review.id}
                  className="border-b border-white/5 odd:bg-white/2 hover:bg-surface-raised"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-muted">
                      <Folder className="h-4 w-4" />
                      <span className="text-foreground">
                        {review.repository.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={review.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-foreground hover:text-brand"
                    >
                      <span className="max-w-60 truncate">
                        {review.prTitle.length > 40
                          ? `${review.prTitle.slice(0, 40)}...`
                          : review.prTitle}
                      </span>
                      <Badge variant="outline">#{review.prNumber}</Badge>
                      <ExternalLink className="h-3 w-3 text-muted" />
                    </Link>
                  </td>
                  <td className="px-4 py-4">{statusBadge(review.status)}</td>
                  <td className="px-4 py-4">
                    {review.totalBugs === 0 ? (
                      <span className="flex items-center gap-2 text-success">
                        <Check className="h-4 w-4" /> Clean
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        {issues
                          .filter((issue) => issue.count > 0)
                          .map((issue) => (
                            <span
                              key={issue.label}
                              className="flex items-center gap-1"
                            >
                              <span className={`h-2 w-2 rounded-full ${issue.color}`} />
                              {issue.count}
                            </span>
                          ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-muted">
                    {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ReviewSheet review={reviewData} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RecentReviewsSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`review-skeleton-${index}`} className="flex gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
