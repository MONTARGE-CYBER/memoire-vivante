import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length);
}

function getUnlockErrorMessage(message?: string) {
  if (!message) return "Impossible de débloquer cette photo.";

  if (message.includes("insufficient_credits")) {
    return "Crédits insuffisants. Achetez un pack pour débloquer cette photo sans filigrane.";
  }

  if (message.includes("restoration_not_found")) {
    return "Photo introuvable pour ce compte.";
  }

  return "Impossible de débloquer cette photo.";
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

    const { id } = await req.json();

    if (typeof id !== "number") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "unlock_restoration_with_credit",
      {
        p_restoration_id: id,
        p_user_id: user.id,
      }
    );

    if (error) {
      const message = getUnlockErrorMessage(error.message);
      const status = error.message.includes("insufficient_credits") ? 402 : 400;

      return NextResponse.json({ error: message }, { status });
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      creditsRemaining: result?.credits_remaining ?? 0,
      restorationId: result?.restoration_id ?? id,
      unlockedAt: result?.unlocked_at ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("UNLOCK RESTORATION ERROR:", error);

    return NextResponse.json(
      { error: "Impossible de débloquer cette photo." },
      { status: 500 }
    );
  }
}
