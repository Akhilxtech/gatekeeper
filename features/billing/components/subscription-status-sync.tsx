"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { UserSubscription } from "@/features/dashboard/lib/types";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 15;

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Polls the authenticated reconciliation endpoint only while a payment is
 * awaiting activation. Once Razorpay reports the subscription as active, a
 * router refresh updates every dashboard surface from the same server state.
 */
export function SubscriptionStatusSync({
  status,
}: {
  status: UserSubscription["status"];
}) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "pending") {
      return;
    }

    let cancelled = false;

    async function pollSubscription() {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        try {
          const response = await fetch("/api/billing/subscription-status", {
            cache: "no-store",
          });

          if (response.ok) {
            const subscription = (await response.json()) as UserSubscription;

            if (
              subscription.status !== "pending" &&
              !cancelled
            ) {
              router.refresh();
              return;
            }
          }
        } catch {
          // A later retry or the Razorpay webhook can still reconcile the plan.
        }

        if (attempt < MAX_POLL_ATTEMPTS - 1) {
          await delay(POLL_INTERVAL_MS);
        }
      }
    }

    void pollSubscription();

    return () => {
      cancelled = true;
    };
  }, [router, status]);

  return null;
}
