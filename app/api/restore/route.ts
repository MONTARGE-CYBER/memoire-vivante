import Replicate from "replicate";
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

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    const output = await replicate.run(
      "flux-kontext-apps/restore-image",
      {
        input: {
          input_image: imageUrl,
        },
      }
    );

    const replicateUrl = (output as any).url();

    // Télécharger l’image depuis Replicate
    const imageResponse = await fetch(replicateUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Nom fichier
    const fileName = `restored-${uuidv4()}.png`;

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

    return NextResponse.json({
      success: true,
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