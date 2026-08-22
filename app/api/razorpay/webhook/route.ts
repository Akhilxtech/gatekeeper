import { createHmac, timingSafeEqual } from "crypto";

import { prisma } from "@/lib/db";

type RazorpaySubscriptionPayload = {
  id: string;
  status?: string;
  current_end?: number;
  notes?: { userId?: string };
};

type RazorpayPaymentPayload = {
  id: string;
  notes?: { userId?: string };
};

type RazorpayWebhookBody = {
  event: string;
  payload: {
    subscription?: {
      entity: RazorpaySubscriptionPayload;
    };
    payment?: {
      entity: RazorpayPaymentPayload;
    };
  };
};

/**
 * All subscription lifecycle events we handle.
 *
 * IMPORTANT: `subscription.authenticated` fires first when a customer
 * completes checkout (before the charge is captured). In test mode this
 * is often the ONLY event that fires immediately. Without handling it
 * the plan would never activate.
 */
const HANDLED_EVENTS = new Set([
  "subscription.authenticated",
  "subscription.activated",
  "subscription.charged",
  "subscription.cancelled",
  "subscription.halted",
  "subscription.completed",
  "subscription.pending",
]);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  console.log("[Razorpay Webhook] Received event");

  if (!secret || !signature) {
    console.error("[Razorpay Webhook] Missing secret or signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");

  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    console.error("[Razorpay Webhook] Signature mismatch");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: RazorpayWebhookBody;
  try {
    event = JSON.parse(body) as RazorpayWebhookBody;
  } catch {
    console.error("[Razorpay Webhook] Invalid JSON payload");
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  console.log("[Razorpay Webhook] Event:", event.event);

  if (!HANDLED_EVENTS.has(event.event)) {
    console.log("[Razorpay Webhook] Ignoring unhandled event:", event.event);
    return Response.json({ received: true });
  }

  const subscription = event.payload.subscription?.entity;
  if (!subscription) {
    console.error("[Razorpay Webhook] Missing subscription entity in payload");
    return Response.json({ error: "Missing subscription" }, { status: 400 });
  }

  console.log(
    "[Razorpay Webhook] Subscription ID:",
    subscription.id,
    "| Status:",
    subscription.status,
    "| Notes:",
    JSON.stringify(subscription.notes)
  );

  const existingUser = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
    select: { id: true },
  });

  const userId = existingUser?.id ?? subscription.notes?.userId ?? null;
  if (!userId) {
    console.error(
      "[Razorpay Webhook] No user found for subscription",
      subscription.id,
      "event:",
      event.event
    );
    return Response.json({ received: true });
  }

  console.log("[Razorpay Webhook] Matched user:", userId);

  const renewsAt = subscription.current_end
    ? new Date(subscription.current_end * 1000)
    : null;

  // ── subscription.authenticated ──────────────────────────────────────
  // Fires when the customer completes checkout and payment is authorized.
  // In test mode this is often the first (and sometimes only) event.
  // We activate the plan here so the user sees Pro immediately.
  if (event.event === "subscription.authenticated") {
    console.log("[Razorpay Webhook] Activating Pro for user (authenticated):", userId);
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "pro",
        razorpaySubscriptionId: subscription.id,
        subscriptionStatus: "active",
        ...(renewsAt ? { subscriptionRenewsAt: renewsAt } : {}),
      },
    });
  }

  // ── subscription.activated ──────────────────────────────────────────
  // Fires when the first charge is captured and subscription becomes active.
  // This is the definitive activation event — always set plan to pro.
  if (event.event === "subscription.activated") {
    console.log("[Razorpay Webhook] Activating Pro for user (activated):", userId);
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "pro",
        razorpaySubscriptionId: subscription.id,
        subscriptionStatus: "active",
        subscriptionRenewsAt: renewsAt,
      },
    });
  }

  // ── subscription.charged ────────────────────────────────────────────
  // Fires on each successful recurring charge. Update renewal date and
  // ensure the plan stays active (handles edge case where a previously
  // halted subscription resumes).
  if (event.event === "subscription.charged") {
    console.log("[Razorpay Webhook] Charge received for user:", userId);
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionRenewsAt: renewsAt,
      },
    });
  }

  // ── subscription.pending ────────────────────────────────────────────
  // Fires when a charge attempt is pending (e.g. UPI mandate).
  // Don't change the plan — just log it.
  if (event.event === "subscription.pending") {
    console.log("[Razorpay Webhook] Charge pending for user:", userId);
  }

  // ── subscription.cancelled ──────────────────────────────────────────
  if (event.event === "subscription.cancelled") {
    console.log("[Razorpay Webhook] Subscription cancelled for user:", userId);
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "canceled" },
    });
  }

  // ── subscription.halted ─────────────────────────────────────────────
  if (event.event === "subscription.halted") {
    console.log("[Razorpay Webhook] Subscription halted for user:", userId);
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "halted" },
    });
  }

  // ── subscription.completed ──────────────────────────────────────────
  if (event.event === "subscription.completed") {
    console.log("[Razorpay Webhook] Subscription completed for user:", userId);
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "free",
        subscriptionStatus: "canceled",
        subscriptionRenewsAt: null,
      },
    });
  }

  console.log("[Razorpay Webhook] Successfully processed event:", event.event);
  return Response.json({ received: true });
}