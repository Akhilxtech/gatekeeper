import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { OverviewContent } from "@/features/dashboard/components/overview-content";
import { getDashboardOverview } from "@/features/dashboard/server/overview";

export default async function DashboardPage() {
  const session = await requireAuth();
  const overview = await getDashboardOverview(session.user.id);

  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Your GateKeeper dashboard at a glance"
      />
      <OverviewContent data={overview} />
    </>
  );
}