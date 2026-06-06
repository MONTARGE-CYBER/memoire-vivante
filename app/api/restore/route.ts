import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    const input = {
      input_image: imageUrl,
    };

    const output = await replicate.run(
      "flux-kontext-apps/restore-image",
      { input }
    );

    const restoredImageUrl = (output as any).url();

    return NextResponse.json({
      success: true,
      imageUrl: restoredImageUrl,
    });
  } catch (error) {
    console.error("Erreur Replicate :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la restauration",
      },
      { status: 500 }
    );
  }
}