import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getStoragePath(url: string) {
  const marker = "/storage/v1/object/public/photos/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.substring(index + marker.length));
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Vous devez être connecté pour supprimer cette photo." }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Vous devez être connecté pour supprimer cette photo." }, { status: 401 });
    }

    const { id } = await req.json();

    if (typeof id !== "number") {
      return NextResponse.json({ error: "Photo invalide." }, { status: 400 });
    }

    const { data: restoration, error } = await supabaseAdmin
      .from("restorations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !restoration) {
      return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
    }

    if (restoration.user_id !== user.id) {
      return NextResponse.json({ error: "Cette photo n’appartient pas à votre compte." }, { status: 403 });
    }

    const filesToDelete = [
      getStoragePath(restoration.original_url),
      getStoragePath(restoration.restored_url),
    ].filter(Boolean) as string[];

    if (filesToDelete.length > 0) {
      await supabaseAdmin.storage.from("photos").remove(filesToDelete);
    }

    await supabaseAdmin
      .from("restorations")
      .delete()
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de supprimer cette photo pour le moment." }, { status: 500 });
  }
}
