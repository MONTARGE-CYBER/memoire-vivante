import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

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
console.log("OUTPUT =", output);
console.dir(output, { depth: 10 });

console.log("OUTPUT REPLICATE =", JSON.stringify(output, null, 2));

   const restoredImageUrl = (output as any).url();

console.log("IMAGE URL =", restoredImageUrl);

return NextResponse.json({
  success: true,
  imageUrl: restoredImageUrl,
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}