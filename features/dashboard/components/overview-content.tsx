"use client";

import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import {
  GitBranch,
  GitPullRequest,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Zap,
  FolderSync,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { statusBadge } from "@/features/dashboard/lib/status-style";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import type { DashboardOverview } from "@/features/dashboard/server/overview";
import { getDisplayName, getInitials } from "@/features/auth/components/user-menu";

/* ─── Status Helpers ─── */

const PR_STATUS_MAP: Record<
  string,
  { label: string; tone: "success" | "info" | "warning" | "neutral" | "danger"; icon: React.ReactNode }
> = {
  reviewed: {
    label: "Reviewed",
    tone: "success",
    icon: <CheckCircle2 className="size-3" />,
  },
  processing: {
    label: "Processing",
    tone: "info",
    icon: <Loader2 className="size-3 animate-spin" />,
  },
  pending: {
    label: "Pending",
    tone: "neutral",
    icon: <Clock className="size-3" />,
  },
  rate_limited: {
    label: "Rate Limited",
    tone: "warning",
    icon: <AlertCircle className="size-3" />,
  },
};

const SYNC_STATUS_MAP: Record<
  string,
  { tone: "success" | "info" | "warning" | "neutral" | "danger" }
> = {
  synced: { tone: "success" },
  syncing: { tone: "info" },
  pending: { tone: "neutral" },
  failed: { tone: "danger" },
};

function getPrStatus(status: string) {
  return PR_STATUS_MAP[status] ?? PR_STATUS_MAP.pending;
}

function getSyncTone(status: string) {
  return (SYNC_STATUS_MAP[status] ?? SYNC_STATUS_MAP.pending).tone;
}

/* ─── Component ─── */

type OverviewContentProps = {
  data: DashboardOverview;
};

export function OverviewContent({ data }: OverviewContentProps) {
  const { userInfo, installation, subscription, usage, recentPullRequests, repoStats } = data;
  const displayName = getDisplayName(userInfo);
  const initials = getInitials(userInfo);

  const usagePercent =
    usage.limit !== null && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* ── Welcome ── */}
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {userInfo.image ? (
            <AvatarImage src={userInfo.image} alt={displayName} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">Welcome back, {displayName}</h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s an overview of your GateKeeper account.
          </p>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Reviews This Month */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/15">
              <Activity className="size-5 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Reviews This Month</p>
              <p className="text-2xl font-bold tabular-nums">
                {usage.used}
                {usage.limit !== null && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}/ {usage.limit}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Repos Synced */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/15">
              <FolderSync className="size-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Repos Indexed</p>
              <p className="text-2xl font-bold tabular-nums">
                {repoStats.syncedRepos}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {repoStats.totalRepos}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-600/15">
              <CreditCard className="size-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold capitalize">{subscription.plan}</p>
                <span
                  className={statusBadge(
                    subscription.status === "active" ? "success" : "warning"
                  )}
                >
                  {subscription.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Status */}
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                installation.connected
                  ? "bg-emerald-600/15"
                  : "bg-red-600/15"
              }`}
            >
              <GithubLogo
                className={`size-5 ${
                  installation.connected ? "text-emerald-500" : "text-red-500"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">GitHub App</p>
              <p className="text-lg font-bold">
                {installation.connected ? "Connected" : "Not Connected"}
              </p>
              {installation.accountLogin && (
                <p className="truncate text-xs text-muted-foreground">
                  @{installation.accountLogin}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Usage Progress (Free plan only) ── */}
      {usagePercent !== null && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Monthly Review Usage</p>
              <p className="text-xs text-muted-foreground">
                {usage.used} of {usage.limit} reviews used
              </p>
            </div>
            <Progress
              value={usagePercent}
              className="h-2"
            />
            {usagePercent >= 80 && (
              <p className="mt-2 text-xs text-amber-500">
                You&apos;re running low on reviews.{" "}
                <Link
                  href={DASHBOARD_ROUTES.settings}
                  className="underline underline-offset-2 hover:text-amber-400"
                >
                  Upgrade to Pro
                </Link>{" "}
                for unlimited reviews.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Main Grid: Activity + Sidebar ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Pull Requests — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Pull Requests</CardTitle>
                <CardDescription>Latest PRs reviewed by GateKeeper</CardDescription>
              </div>
              <Link href={DASHBOARD_ROUTES.pullRequest}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                  <ExternalLink className="ml-1 size-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPullRequests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <GitPullRequest className="size-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No pull requests yet
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Pull requests will appear here once GateKeeper starts reviewing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {recentPullRequests.map((pr) => {
                  const prStatus = getPrStatus(pr.status);
                  return (
                    <div
                      key={pr.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <GitPullRequest className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {pr.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pr.repoFullName} #{pr.prNumber}
                          {pr.authorLogin && ` · ${pr.authorLogin}`}
                        </p>
                      </div>
                      <span className={statusBadge(prStatus.tone, "gap-1")}>
                        {prStatus.icon}
                        {prStatus.label}
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {formatDistanceToNow(new Date(pr.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Subscription Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge variant="secondary" className="capitalize">
                  {subscription.plan}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={statusBadge(
                    subscription.status === "active" ? "success" : "warning"
                  )}
                >
                  {subscription.status}
                </span>
              </div>
              {subscription.renewsAt && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Renews</span>
                    <span className="text-sm">
                      {format(new Date(subscription.renewsAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usage</span>
                <span className="text-sm">
                  {usage.limit !== null
                    ? `${usage.used}/${usage.limit} reviews`
                    : `${usage.used} reviews (unlimited)`}
                </span>
              </div>
            </CardContent>
            {(subscription.plan === "free" || subscription.status === "canceled") && (
              <CardFooter>
                <Link href={DASHBOARD_ROUTES.settings} className="w-full">
                  <Button
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
                    size="sm"
                  >
                    <Zap className="mr-1.5 size-3.5" />
                    {subscription.status === "canceled"
                      ? "Upgrade to Pro Again"
                      : "Upgrade to Pro"}
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>

          {/* Repo Sync Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Repository Index</CardTitle>
                <Link href={DASHBOARD_ROUTES.repos}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    All Repos
                    <ArrowRight className="ml-1 size-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {repoStats.totalRepos === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <FolderSync className="size-6 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    No repositories indexed yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary counts */}
                  <div className="flex gap-3 text-center text-xs">
                    <div className="flex-1 rounded-md bg-emerald-500/10 p-2">
                      <p className="text-lg font-bold text-emerald-500">
                        {repoStats.syncedRepos}
                      </p>
                      <p className="text-muted-foreground">Synced</p>
                    </div>
                    <div className="flex-1 rounded-md bg-blue-500/10 p-2">
                      <p className="text-lg font-bold text-blue-500">
                        {repoStats.pendingRepos}
                      </p>
                      <p className="text-muted-foreground">Pending</p>
                    </div>
                    {repoStats.failedRepos > 0 && (
                      <div className="flex-1 rounded-md bg-red-500/10 p-2">
                        <p className="text-lg font-bold text-red-500">
                          {repoStats.failedRepos}
                        </p>
                        <p className="text-muted-foreground">Failed</p>
                      </div>
                    )}
                  </div>

                  {/* Recent syncs list */}
                  {repoStats.recentSyncs.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-1.5">
                        {repoStats.recentSyncs.map((sync) => (
                          <div
                            key={sync.id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex min-w-0 items-center gap-1.5">
                              <GitBranch className="size-3 shrink-0 text-muted-foreground" />
                              <span className="truncate">{sync.repoFullName}</span>
                            </div>
                            <span className={statusBadge(getSyncTone(sync.status))}>
                              {sync.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  {userInfo.image ? (
                    <AvatarImage src={userInfo.image} alt={displayName} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {userInfo.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Member since</span>
                <span>{format(new Date(userInfo.memberSince), "MMM d, yyyy")}</span>
              </div>
              {installation.connected && installation.installedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GitHub connected</span>
                  <span>
                    {format(new Date(installation.installedAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── GitHub Not Connected Banner ── */}
      {!installation.connected && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <GithubLogo className="size-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Connect your GitHub account</p>
              <p className="text-xs text-muted-foreground">
                Install the GateKeeper GitHub App to start receiving AI code reviews on
                your pull requests.
              </p>
            </div>
            <Link href={DASHBOARD_ROUTES.github}>
              <Button
                size="sm"
                className="bg-amber-600 text-white hover:bg-amber-500"
              >
                Install App
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
