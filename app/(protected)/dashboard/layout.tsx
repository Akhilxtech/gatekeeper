
import { requireAuth } from "@/features/auth/actions";
import { getUserSubscription } from "@/features/billing/server/subscription";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const subscription = await getUserSubscription(session.user.id);

  return (
    <DashboardShell user={session.user} plan={subscription.plan}>
      {children}
    </DashboardShell>
  );
}