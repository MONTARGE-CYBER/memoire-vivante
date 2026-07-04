import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function creditUserFromCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits ?? 0);
  const packId = session.metadata?.packId ?? "unknown";

  if (!userId || !Number.isInteger(credits) || credits <= 0) {
    throw new Error("Invalid checkout metadata");
  }

  const { error } = await supabaseAdmin.rpc("add_user_credits", {
    p_amount: credits,
    p_description: `stripe:${session.id}`,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  console.info(
    `Credited ${credits} credits to ${userId} from pack ${packId}`
  );
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("STRIPE WEBHOOK SIGNATURE ERROR:", error);

    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await creditUserFromCheckout(event.data.object);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
