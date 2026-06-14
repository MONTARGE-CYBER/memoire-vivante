"use client";

import { useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { downloadRestoration } from "@/lib/downloadRestoration";
import { supabase } from "@/lib/supabase";

const guidance = [
  "Choisissez une photo nette, même abîmée ou jaunie.",
  "Évitez les captures d’écran trop petites si possible.",
  "La restauration peut prendre quelques instants.",
];

const howItWorks = [
  {
    title: "Importez une photo ancienne",
    text: "Choisissez une photo de famille à restaurer ou commencez avec un exemple gratuit. Une image nette et bien numérisée donnera toujours un meilleur résultat.",
  },
  {
    title: "L’IA améliore votre image",
    text: "La photo est analysée, nettoyée et restaurée pour améliorer les détails, atténuer les marques du temps et préparer un rendu plus propre.",
  },
  {
    title: "Préparez votre album souvenir",
    text: "Consultez l’aperçu gratuit filigrané, puis débloquez plus tard la version HD sans filigrane, prête à imprimer ou à offrir.",
  },
];

const demoSamples = [
  {
    title: "Portrait ancien",
    before:
      "https://replicate.delivery/mgxm/b033ff07-1d2e-4768-a137-6c16b5ed4bed/d_1.png",
    after:
      "https://replicate.delivery/xezq/VjZzUS8uxOobNpyJzFebvWiuUa3Bzs60RQOexLVQIOuewckpA/tmpio8e0bce.png",
  },
  {
    title: "Souvenir familial",
    before:
      "https://replicate.delivery/mgxm/b033ff07-1d2e-4768-a137-6c16b5ed4bed/d_1.png",
    after:
      "https://replicate.delivery/xezq/VjZzUS8uxOobNpyJzFebvWiuUa3Bzs60RQOexLVQIOuewckpA/tmpio8e0bce.png",
  },
];

function WatermarkedImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/5">
      <img
        src={src}
        alt={alt}
        className="w-full max-h-[560px] object-contain"
      />

      <div className="pointer-events-none absolute inset-0 flex -rotate-12 items-center justify-center">
        <span className="rounded-2xl border border-white/50 bg-black/25 px-8 py-4 text-2xl sm:text-4xl font-black uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
          Mémoire Vivante
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-gray-700 shadow-sm">
        Aperçu gratuit filigrané
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [restorationId, setRestorationId] = useState<number | null>(null);
  const [demoTitle, setDemoTitle] = useState<string | null>(null);
  const [isWatermarkedPreview, setIsWatermarkedPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setRestoredImage(null);
    setRestorationId(null);
    setDemoTitle(null);
    setIsWatermarkedPreview(false);

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  const selectDemoSample = (sample: (typeof demoSamples)[number]) => {
    setPreview(sample.before);
    setRestoredImage(sample.after);
    setFile(null);
    setRestorationId(null);
    setDemoTitle(sample.title);
    setIsWatermarkedPreview(true);
  };

  const uploadToSupabase = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Veuillez vous connecter avant de restaurer une photo.");
        setLoading(false);
        return;
      }

      const fileName = `${session.user.id}/original/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        alert("Erreur lors de l'upload de la photo.");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
      const imageUrl = data.publicUrl;

      const response = await fetch("/api/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          imageUrl,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error(result);
        alert("Erreur lors de la restauration IA.");
        setLoading(false);
        return;
      }

      setRestoredImage(result.imageUrl);
      setRestorationId(result.restorationId);
      setIsWatermarkedPreview(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <SiteNav />

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start">
          <aside className="lg:sticky lg:top-28">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
              Restauration IA
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
              Ajoutez une photo à votre album souvenir
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Testez gratuitement avec un exemple ou importez une photo de
              famille. Le rendu gratuit est filigrané ; la version HD sans
              filigrane sera débloquée avec les packs.
            </p>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <h2 className="text-xl font-bold mb-5">
                Conseils pour un meilleur résultat
              </h2>

              <div className="space-y-4">
                {guidance.map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
                      {index + 1}
                    </span>
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <h2 className="text-xl font-bold mb-2">
                Comment utiliser la restauration de photos ?
              </h2>

              <p className="text-gray-600 mb-6">
                L’outil est pensé pour rester simple : vous choisissez une image,
                l’IA la restaure, puis vous préparez votre album souvenir.
              </p>

              <div className="space-y-5">
                {howItWorks.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-black text-white">
                      {index + 1}
                    </span>

                    <div>
                      <h3 className="font-black mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-sm border border-white/60">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm font-bold text-purple-700 mb-1">
                    Essai gratuit
                  </p>
                  <h2 className="text-2xl font-black">
                    Tester avec une photo proposée
                  </h2>
                </div>

                <span className="rounded-2xl bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700">
                  Sans compte
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {demoSamples.map((sample) => (
                  <button
                    key={sample.title}
                    onClick={() => selectDemoSample(sample)}
                    className="overflow-hidden rounded-2xl bg-white text-left shadow-sm border border-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <img
                      src={sample.before}
                      alt={sample.title}
                      className="h-36 w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="font-black">{sample.title}</p>
                      <p className="text-sm text-gray-500">
                        Voir un rendu restauré filigrané
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <label className="block border-2 border-dashed border-purple-200 rounded-[2rem] p-8 sm:p-12 text-center bg-white/80 backdrop-blur-xl cursor-pointer shadow-sm transition hover:border-purple-400 hover:shadow-xl">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                +
              </div>

              <p className="text-2xl font-black">
                Ou télécharger votre propre photo
              </p>

              <p className="text-gray-500 mt-3">
                JPG, PNG ou TIFF - aperçu gratuit avec filigrane
              </p>
            </label>

            {preview && (
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-sm border border-white/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div>
                    <p className="text-sm font-bold text-purple-700 mb-1">
                      {demoTitle ? "Exemple sélectionné" : "Photo sélectionnée"}
                    </p>
                    <h2 className="text-2xl font-black">
                      {demoTitle ?? file?.name ?? "Photo originale"}
                    </h2>
                  </div>

                  <span className="rounded-2xl bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700">
                    Original
                  </span>
                </div>

                <img
                  src={preview}
                  alt="Photo originale sélectionnée"
                  className="w-full max-h-[560px] rounded-2xl object-contain bg-black/5"
                />

                <button
                  onClick={uploadToSupabase}
                  disabled={loading || !file}
                  className="mt-6 w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-lg shadow-lg disabled:opacity-60"
                >
                  {loading ? "Restauration en cours..." : "Restaurer et ajouter à mon album"}
                </button>

                {!file && demoTitle && (
                  <p className="mt-4 text-center text-sm font-semibold text-gray-500">
                    Cet exemple est déjà restauré pour vous montrer le rendu gratuit.
                  </p>
                )}

                {loading && (
                  <p className="mt-4 text-center text-sm font-semibold text-gray-500">
                    Votre photo est envoyée, restaurée puis enregistrée dans la galerie.
                  </p>
                )}
              </div>
            )}

            {restoredImage && (
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-sm border border-white/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div>
                    <p className="text-sm font-bold text-green-700 mb-1">
                      Restauration terminée
                    </p>
                    <h2 className="text-2xl font-black">
                      Photo prête pour votre album
                    </h2>
                  </div>

                  <span className="rounded-2xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                    Restaurée
                  </span>
                </div>

                {isWatermarkedPreview ? (
                  <WatermarkedImage
                    src={restoredImage}
                    alt="Photo restaurée avec filigrane"
                  />
                ) : (
                  <img
                    src={restoredImage}
                    alt="Photo restaurée"
                    className="w-full max-h-[560px] rounded-2xl object-contain bg-black/5"
                  />
                )}

                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  <Link
                    href="/gallery"
                    className="text-center px-5 py-4 rounded-2xl bg-black text-white font-bold"
                  >
                    Voir dans la galerie
                  </Link>

                  <button
                    onClick={() => {
                      if (restorationId) {
                        downloadRestoration(restorationId);
                      }
                    }}
                    disabled={!restorationId || isWatermarkedPreview}
                    className="text-center px-5 py-4 rounded-2xl bg-purple-100 text-purple-700 font-bold disabled:opacity-60"
                  >
                    HD sans filigrane bientôt
                  </button>
                </div>

                {isWatermarkedPreview && (
                  <p className="mt-4 text-center text-sm font-semibold text-gray-500">
                    La version gratuite reste filigranée. Les packs Stripe
                    permettront de débloquer le téléchargement HD sans filigrane.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
