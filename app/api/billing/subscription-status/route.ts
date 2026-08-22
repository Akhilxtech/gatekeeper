import { getServerSession } from "@/features/auth/actions";
import { getUserSubscription } from "@/features/billing/server/subscription";

/**
 * GET /api/billing/subscription-status
 *
 * Returns the current subscription state for the authenticated user.
 * Used by the client to poll for status changes after a Razorpay payment,
 * since the webhook that activates the plan arrives asynchronously.
 */
export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getUserSubscription(session.user.id);

  return Response.json(subscription);
}
