import Razorpay from "razorpay";

let razorpay: Razorpay | null = null;

export function getRazorpay() {
  if (!razorpay) {
    // Keep the old names as fallbacks so existing deployments keep working,
    // while the canonical server-side names remain clear.
    const keyId =
      process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ?? process.env.RAZORPAY_API_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("Razorpay server credentials are not configured.");
    }

    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpay;
}
