"use server";

import { getServerSession } from "@/features/auth/actions";
import { cancelProSubscription, createProSubscription } from "@/features/billing/server/subscription";
import { redirect } from "next/navigation";

type StartProSubscriptionResult =
  | { subscriptionId: string }
  | { error: string };

export async function startProSubscription(): Promise<StartProSubscriptionResult> {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  try {
    return await createProSubscription(session.user.id);
  } catch (error) {
    console.error("Failed to start Pro subscription", error);
    return { error: "Unable to start checkout right now. Please try again." };
  }
}

export async function cancelSubscription() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  await cancelProSubscription(session.user.id);
}
