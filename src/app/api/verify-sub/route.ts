import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string };

    if (!email?.trim()) {
      return NextResponse.json({ active: false });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email: email.trim(), limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ active: false });
    }

    // Check for active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    return NextResponse.json({
      active: subscriptions.data.length > 0,
      email: email.trim(),
    });
  } catch (error: unknown) {
    console.error("Subscription check error:", error);
    return NextResponse.json({ active: false });
  }
}
