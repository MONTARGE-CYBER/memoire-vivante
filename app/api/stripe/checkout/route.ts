import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getCreditPack } from "@/lib/creditPacks";

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

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length);
}

function getBaseUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const origin = req.headers.get("origin");

  if (origin) return origin;

  return "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packId } = await req.json();
    const pack = typeof packId === "string" ? getCreditPack(packId) : null;

    if (!pack) {
      return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(req);
    const session = await getStripe().checkout.sessions.create({
      cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Mémoire Vivante - ${pack.name}`,
              description: `${pack.credits} crédits photo`,
            },
            unit_amount: pack.priceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        credits: String(pack.credits),
        packId: pack.id,
        userId: user.id,
      },
      mode: "payment",
      success_url: `${baseUrl}/dashboard?checkout=success`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Impossible de créer le paiement." },
      { status: 500 }
    );
  }
}
