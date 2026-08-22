"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { statusButtonClass } from "@/features/dashboard/lib/status-style";
import { startProSubscription } from "@/lib/billing";

type RazorpayCheckout = new (options: Record<string, unknown>) => {
    open: () => void;
};

declare global {
    interface Window {
        Razorpay?: RazorpayCheckout
    }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/** Maximum number of times to poll for webhook to update the DB. */
const MAX_POLL_ATTEMPTS = 15;
/** Interval between polls in milliseconds. */
const POLL_INTERVAL_MS = 2000;

/**
 * Polls the subscription status API until the webhook has updated the
 * plan to "pro" in the DB, or we hit the max attempts.
 *
 * @returns `true` if the subscription was confirmed as active.
 */
async function waitForWebhookActivation(): Promise<boolean> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        try {
            const res = await fetch("/api/billing/subscription-status");
            if (res.ok) {
                const data = await res.json();
                if (data.plan === "pro" && data.status === "active") {
                    return true;
                }
            }
        } catch {
            // Network error — continue polling
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return false;
}

export function UpgradeButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(false);


    async function handleUpgrade() {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) {
          toast.error("Razorpay is not configured yet.");
          return;
        }
    
        if (!window.Razorpay) {
          toast.error("Checkout is still loading, please try again in a moment.");
          return;
        }
    
        setLoading(true);
    
        try {
          const { subscriptionId } = await startProSubscription();
    
          const checkout = new window.Razorpay({
            key,
            subscription_id: subscriptionId,
            name: "Gatekeeper",
            description: "Pro plan — unlimited AI reviews",
            handler: async () => {
              // Payment succeeded — now wait for the Razorpay webhook
              // to update the DB with plan: "pro"
              setActivating(true);
              toast.success("Payment successful! Activating your Pro plan…");

              const activated = await waitForWebhookActivation();

              if (activated) {
                toast.success("🎉 Pro plan is now active!");
              } else {
                toast.info(
                  "Payment received! Your Pro plan will activate shortly — please refresh the page in a moment."
                );
              }

              setActivating(false);
              router.refresh();
            },
          });
    
          checkout.open();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not start checkout.";
          toast.error(message);
        } finally {
          setLoading(false);
        }
      }

    const buttonText = activating
        ? "Activating Pro…"
        : loading
            ? "Opening checkout…"
            : "Upgrade to Pro";

    return (
        <>
            <Script src={RAZORPAY_SCRIPT_URL} strategy="lazyOnload"></Script>
            <Button
                onClick={handleUpgrade}
                disabled={loading || activating}
                className={cn(statusButtonClass.success)}
            >
                {buttonText}
            </Button>
        </>
    )
}