"use server";

import { subDays } from "date-fns";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: { repository: true; bugs: true };
}>;

export interface RepositorySummary {
  id: number;
  fullName: string;
  private: boolean;
  reviewCount: number;
  lastReviewedAt: Date | null;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

async function assertUser(userId: string) {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getHasUnread(userId: string): Promise<boolean> {
  await assertUser(userId);

  const oneDayAgo = subDays(new Date(), 1);
  const count = await prisma.review.count({
    where: {
      userId,
      status: "completed",
      completedAt: { gte: oneDayAgo },
    },
  });
  return count > 0;
}
export async function getDashboardStats(userId: string): Promise<{
  totalReviews: number;
  totalBugs: number;
  repoCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  weeklyReviews: number;
}> {
  await assertUser(userId);

  const weekStart = subDays(new Date(), 7);

  const [reviewAggregate, totalReviews, weeklyReviews, repoCount] =
    await Promise.all([
      prisma.review.aggregate({
        where: { userId },
        _sum: {
          totalBugs: true,
          criticalCount: true,
          highCount: true,
          mediumCount: true,
          lowCount: true,
        },
      }),
      prisma.review.count({ where: { userId } }),
      prisma.review.count({
        where: { userId, createdAt: { gte: weekStart } },
      }),
      prisma.repository.count({
        where: { installation: { userId } },
      }),
    ]);

  return {
    totalReviews,
    totalBugs: reviewAggregate._sum.totalBugs ?? 0,
    repoCount,
    criticalCount: reviewAggregate._sum.criticalCount ?? 0,
    highCount: reviewAggregate._sum.highCount ?? 0,
    mediumCount: reviewAggregate._sum.mediumCount ?? 0,
    lowCount: reviewAggregate._sum.lowCount ?? 0,
    weeklyReviews,
  };
}

export async function getRecentReviews(
  userId: string,
  limit: number,
  repositoryId?: number,
): Promise<ReviewWithRelations[]> {
  await assertUser(userId);

  return prisma.review.findMany({
    where: {
      userId,
      ...(repositoryId !== undefined && { repositoryId }),
    },
    include: {
      repository: true,
      bugs: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRepositories(
  userId: string,
): Promise<RepositorySummary[]> {
  await assertUser(userId);

  const repositories = await prisma.repository.findMany({
    where: { installation: { userId } },
    include: {
      reviews: {
        select: {
          totalBugs: true,
          criticalCount: true,
          highCount: true,
          mediumCount: true,
          lowCount: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return repositories.map((repo) => {
    const reviewCount = repo.reviews.length;

    const lastReviewedAt = repo.reviews.reduce<Date | null>(
      (latest, review) => {
        if (!latest) return review.createdAt;
        return review.createdAt > latest ? review.createdAt : latest;
      },
      null,
    );

    const totals = repo.reviews.reduce(
      (acc, review) => {
        acc.criticalCount += review.criticalCount;
        acc.highCount += review.highCount;
        acc.mediumCount += review.mediumCount;
        acc.lowCount += review.lowCount;
        return acc;
      },
      { criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0 },
    );

    return {
      id: repo.id,
      fullName: repo.fullName,
      private: repo.private,
      reviewCount,
      lastReviewedAt,
      ...totals,
    };
  });
}

export async function getReviewDetail(
  reviewId: string,
): Promise<ReviewWithRelations | null> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: user.id,
    },
    include: {
      repository: true,
      bugs: true,
    },
  });
}