import Replicate, { type FileOutput } from "replicate";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const supabase = createClient(
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
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (typeof imageUrl !== "string" || imageUrl.length === 0) {
      return NextResponse.json(
        { success: false, error: "Image URL invalide" },
        { status: 400 }
      );
    }

    const output = await replicate.run(
      "flux-kontext-apps/restore-image",
      {
        input: {
          input_image: imageUrl,
        },
      }
    ) as FileOutput;

    const replicateUrl = output.url();

    // Télécharger l’image depuis Replicate
    const imageResponse = await fetch(replicateUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Nom fichier
    const fileName = `${user.id}/restored/restored-${uuidv4()}.png`;

    // Upload dans Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      console.error(uploadError);

      return NextResponse.json({
        success: false,
        error: uploadError.message,
      });
    }

    // URL publique permanente
    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    const { data: restoration, error: insertError } = await supabase
      .from("restorations")
      .insert({
        original_url: imageUrl,
        restored_url: data.publicUrl,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(insertError);

      return NextResponse.json({
        success: false,
        error: insertError.message,
      });
    }

    return NextResponse.json({
      success: true,
      restorationId: restoration.id,
      imageUrl: data.publicUrl,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      error: "Erreur restauration",
    });
  }
}
