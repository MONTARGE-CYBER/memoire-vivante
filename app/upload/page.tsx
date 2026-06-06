"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
const [file, setFile] = useState<File | null>(null);
const [restoredImage, setRestoredImage] = useState<string | null>(null);

const uploadToSupabase = async () => {
  if (!file) return;

  try {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("photos")
      .upload(fileName, file);

    if (error) {
      console.error(error);
      alert("Erreur upload");
      return;
    }

    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    alert("Photo envoyée. Lancement de la restauration IA...");

    const response = await fetch("/api/restore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
      }),
    });

    const result = await response.json();

   console.log("Résultat Replicate :", result);

setRestoredImage(result.imageUrl);
setRestoredImage(result.imageUrl);

const insertResult = await supabase
  .from("restorations")
  .insert({
    original_url: imageUrl,
    restored_url: result.imageUrl,
  });

console.log("INSERT RESULT =", insertResult);
console.log("INSERT ERROR =", insertResult.error);
console.log("INSERT RESULT =", insertResult);
  
console.log("INSERT DATA =", data);
console.log("INSERT ERROR =", error);

alert("Traitement terminé !");

alert("Traitement terminé !");

  } catch (err) {
    console.error(err);
    alert("Erreur lors du traitement IA");
  }
};
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

if (!selectedFile) return;

setFile(selectedFile);

const url = URL.createObjectURL(selectedFile);
setPreview(url);
  };

  return (
    <main className="min-h-screen bg-stone-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          Restaurer une photo
        </h1>

        <p className="text-gray-600 mb-10">
          Déposez votre photo ancienne pour la restaurer et la coloriser.
        </p>

        <label className="block border-2 border-dashed rounded-3xl p-20 text-center bg-white cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          <p className="text-xl font-medium">
            Cliquez pour sélectionner une photo
          </p>

          <p className="text-gray-500 mt-2">
            JPG, PNG ou TIFF
          </p>
        </label>
{restoredImage && (
  <div className="mt-10 bg-white rounded-3xl p-6 shadow-sm">
    <h2 className="text-2xl font-bold mb-4">
      Photo restaurée
    </h2>

    <img
      src={restoredImage}
      alt="restored"
      className="rounded-2xl max-h-[600px] mx-auto"
    />
  </div>
)}
        {preview && (
          <div className="mt-10 bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">
              Aperçu
            </h2>

            <img
              src={preview}
              alt="preview"
              className="rounded-2xl max-h-[600px] mx-auto"
            />

            <button
  onClick={uploadToSupabase}
  className="mt-6 px-8 py-4 bg-black text-white rounded-xl"
>
  Envoyer la photo
</button>
          </div>
        )}
      </div>
    </main>
  );
}