
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { UserMenuUser } from "@/features/auth/components/user-menu";
import { SubscriptionStatusSync } from "@/features/billing/components/subscription-status-sync";
import type { UserSubscription } from "@/features/dashboard/lib/types";

type DashboardShellProps = {
  children: React.ReactNode;
  user: UserMenuUser;
  plan?: string;
  subscriptionStatus: UserSubscription["status"];
};

export function DashboardShell({
  children,
  user,
  plan,
  subscriptionStatus,
}: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SubscriptionStatusSync status={subscriptionStatus} />
      <SidebarProvider>
        <DashboardSidebar user={user} plan={plan} />
        <SidebarInset className="min-h-svh">{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
