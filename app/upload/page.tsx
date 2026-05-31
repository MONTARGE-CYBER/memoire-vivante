"use client";

import { useState } from "react";

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);
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

            <button className="mt-6 px-8 py-4 bg-black text-white rounded-xl">
              Restaurer avec l'IA
            </button>
          </div>
        )}
      </div>
    </main>
  );
}