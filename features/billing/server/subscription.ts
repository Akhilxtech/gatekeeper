

import type { UserSubscription } from "@/features/dashboard/lib/types";
import { getRazorpay } from "@/features/billing/lib/razorpay";
import { prisma } from "@/lib/db";

type StoredSubscription = {
  plan: string;
  razorpaySubscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionRenewsAt: Date | null;
};

export type RazorpaySubscriptionSnapshot = {
  id: string;
  status:
    | "created"
    | "authenticated"
    | "active"
    | "pending"
    | "halted"
    | "cancelled"
    | "completed"
    | "expired";
  current_end?: number | null;
};

function toUserSubscription(
  user: StoredSubscription | null
): UserSubscription {
  if (!user) {
    return { plan: "free", status: "active", renewsAt: null };
  }

  const renewsAt = user.subscriptionRenewsAt?.toISOString() ?? null;

  if (user.subscriptionStatus === "pending") {
    return { plan: "free", status: "pending", renewsAt };
  }

  if (user.subscriptionStatus === "canceled") {
    const stillActive =
      user.plan === "pro" &&
      user.subscriptionRenewsAt !== null &&
      user.subscriptionRenewsAt > new Date();

    if (stillActive) {
      return { plan: "pro", status: "active", renewsAt };
    }

    return { plan: "free", status: "canceled", renewsAt };
  }

  if (user.plan === "pro" && user.subscriptionStatus === "active") {
    return { plan: "pro", status: "active", renewsAt };
  }

  if (user.plan !== "pro") {
    return { plan: "free", status: "active", renewsAt };
  }

  return { plan: "free", status: "canceled", renewsAt };
}

function getRazorpaySubscriptionUpdate(
  subscription: RazorpaySubscriptionSnapshot
) {
  const subscriptionRenewsAt = subscription.current_end
    ? new Date(subscription.current_end * 1000)
    : null;

  switch (subscription.status) {
    case "active":
      return {
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionRenewsAt,
      };
    case "cancelled":
      return {
        plan: "pro",
        subscriptionStatus: "canceled",
        subscriptionRenewsAt,
      };
    case "completed":
    case "expired":
    case "halted":
      return {
        plan: "free",
        subscriptionStatus: "canceled",
        subscriptionRenewsAt: null,
      };
    default:
      return {
        plan: "free",
        subscriptionStatus: "pending",
        subscriptionRenewsAt,
      };
  }
}

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });

  return toUserSubscription(user);
}

export async function updateUserSubscriptionFromRazorpay(
  userId: string,
  subscription: RazorpaySubscriptionSnapshot
): Promise<UserSubscription> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      razorpaySubscriptionId: subscription.id,
      ...getRazorpaySubscriptionUpdate(subscription),
    },
    select: {
      plan: true,
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });

  return toUserSubscription(user);
}

/**
 * Reconciles a stored subscription with Razorpay. This covers the short delay
 * between Checkout succeeding and the subscription webhook arriving.
 */
export async function syncUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });

  if (!user?.razorpaySubscriptionId || user.subscriptionStatus !== "pending") {
    return toUserSubscription(user);
  }

  try {
    const razorpaySubscription = await getRazorpay().subscriptions.fetch(
      user.razorpaySubscriptionId
    );

    return updateUserSubscriptionFromRazorpay(userId, razorpaySubscription);
  } catch (error) {
    console.error("Failed to sync Razorpay subscription", error);
    return toUserSubscription(user);
  }
}

export async function createProSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const subscription = toUserSubscription(user);

  if (subscription.plan === "pro" && subscription.status === "active") {
    throw new Error("You already have an active Pro subscription.");
  }

  if (user.subscriptionStatus === "pending" && user.razorpaySubscriptionId) {
    return { subscriptionId: user.razorpaySubscriptionId };
  }

  // RAZORPAY_PLAN_ID is canonical; keep the existing name as a fallback for
  // deployments that still use it.
  const planId = process.env.RAZORPAY_PLAN_ID ?? process.env.RAZORPAY_PLANID;
  if (!planId) {
    throw new Error("Razorpay plan is not configured.");
  }

  const razorpay = getRazorpay();
  const razorpaySubscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12,
    customer_notify: 1,
    notes: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "free",
      razorpaySubscriptionId: razorpaySubscription.id,
      subscriptionStatus: "pending",
      subscriptionRenewsAt: null,
    },
  });

  return { subscriptionId: razorpaySubscription.id };
}

export async function cancelProSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { razorpaySubscriptionId: true },
  });

  if (!user?.razorpaySubscriptionId) {
    throw new Error("No active subscription found.");
  }

  const razorpay = getRazorpay();
  await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, 1);

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "canceled" },
  });
}
