import { getInstallationStatus, getUserInstallationId } from "@/features/github/server/installation";
import { getUserSubscription } from "@/features/billing/server/subscription";
import { getUsageSummary } from "@/features/billing/server/usage";
import { prisma } from "@/lib/db";

import type { GithubInstallationStatus, UserSubscription } from "@/features/dashboard/lib/types";
import type { UsageSummary } from "@/features/billing/server/usage";

/* ─── Types ─── */

export type RecentPullRequest = {
  id: string;
  repoFullName: string;
  prNumber: number;
  title: string;
  authorLogin: string | null;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
};

export type RepoSyncSummary = {
  totalRepos: number;
  syncedRepos: number;
  pendingRepos: number;
  failedRepos: number;
  recentSyncs: {
    id: string;
    repoFullName: string;
    branch: string;
    status: string;
    syncedAt: string | null;
  }[];
};

export type UserInfo = {
  name: string;
  email: string;
  image: string | null;
  memberSince: string;
};

export type DashboardOverview = {
  userInfo: UserInfo;
  installation: GithubInstallationStatus;
  subscription: UserSubscription;
  usage: UsageSummary;
  recentPullRequests: RecentPullRequest[];
  repoStats: RepoSyncSummary;
};

/* ─── Main aggregation function ─── */

export async function getDashboardOverview(
  userId: string
): Promise<DashboardOverview> {
  // Fetch independent data sources in parallel
  const [user, installation, subscription, usage, installationId] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
      getInstallationStatus(userId),
      getUserSubscription(userId),
      getUsageSummary(userId),
      getUserInstallationId(userId),
    ]);

  // Fetch PR and repo data (depends on installationId)
  let recentPullRequests: RecentPullRequest[] = [];
  let repoStats: RepoSyncSummary = {
    totalRepos: 0,
    syncedRepos: 0,
    pendingRepos: 0,
    failedRepos: 0,
    recentSyncs: [],
  };

  if (installationId) {
    const [prs, syncData, syncCounts] = await Promise.all([
      prisma.pullRequest.findMany({
        where: { installationId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          repoFullName: true,
          prNumber: true,
          title: true,
          authorLogin: true,
          status: true,
          reviewedAt: true,
          createdAt: true,
        },
      }),
      prisma.repoSync.findMany({
        where: { installationId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          repoFullName: true,
          branch: true,
          status: true,
          syncedAt: true,
        },
      }),
      prisma.repoSync.groupBy({
        by: ["status"],
        where: { installationId },
        _count: true,
      }),
    ]);

    recentPullRequests = prs.map((pr) => ({
      id: pr.id,
      repoFullName: pr.repoFullName,
      prNumber: pr.prNumber,
      title: pr.title,
      authorLogin: pr.authorLogin,
      status: pr.status,
      reviewedAt: pr.reviewedAt?.toISOString() ?? null,
      createdAt: pr.createdAt.toISOString(),
    }));

    const statusCounts: Record<string, number> = {};
    for (const group of syncCounts) {
      statusCounts[group.status] = group._count;
    }

    const totalRepos = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    repoStats = {
      totalRepos,
      syncedRepos: statusCounts["synced"] ?? 0,
      pendingRepos: (statusCounts["pending"] ?? 0) + (statusCounts["syncing"] ?? 0),
      failedRepos: statusCounts["failed"] ?? 0,
      recentSyncs: syncData.map((s) => ({
        id: s.id,
        repoFullName: s.repoFullName,
        branch: s.branch,
        status: s.status,
        syncedAt: s.syncedAt?.toISOString() ?? null,
      })),
    };
  }

  const userInfo: UserInfo = {
    name: user?.name ?? "User",
    email: user?.email ?? "",
    image: user?.image ?? null,
    memberSince: user?.createdAt?.toISOString() ?? new Date().toISOString(),
  };

  return {
    userInfo,
    installation,
    subscription,
    usage,
    recentPullRequests,
    repoStats,
  };
}
