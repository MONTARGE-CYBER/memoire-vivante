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

    const { data: restoration, error } = await supabaseAdmin
      .from("restorations")
      .select("id, restored_url, user_id")
      .eq("id", id)
      .single();

    if (error || !restoration) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (restoration.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const response = await fetch(restoration.restored_url);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to fetch file",
          status: response.status,
          statusText: response.statusText,
        },
        { status: 500 }
      );
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Content-Disposition":
          'attachment; filename="memoire-vivante-hd.png"',
      },
    });
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
