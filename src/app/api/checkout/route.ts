import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, string> = {
  single: process.env.STRIPE_PRICE_SINGLE!,
  pack: process.env.STRIPE_PRICE_PACK!,
  unlimited: process.env.STRIPE_PRICE_UNLIMITED!,
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const priceId = PRICE_MAP[plan];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan === "unlimited" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/?paid=true`,
      cancel_url: `${request.nextUrl.origin}/?paid=false`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
