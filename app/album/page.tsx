"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type Restoration = {
  id: number;
  original_url: string;
  restored_url: string;
  user_id: string | null;
};

const albumFormats = [
  {
    id: "square",
    label: "Carré",
    detail: "20 x 20 cm",
    previewClass: "aspect-square",
  },
  {
    id: "portrait",
    label: "Portrait",
    detail: "A4 vertical",
    previewClass: "aspect-[4/5]",
  },
  {
    id: "landscape",
    label: "Paysage",
    detail: "A4 horizontal",
    previewClass: "aspect-[4/3]",
  },
];

const albumThemes = [
  {
    id: "heritage",
    label: "Héritage",
    previewClass: "bg-[#f8f1ff]",
    textClass: "text-purple-700",
    borderClass: "border-purple-200",
  },
  {
    id: "classic",
    label: "Classique",
    previewClass: "bg-[#f7f7f2]",
    textClass: "text-stone-700",
    borderClass: "border-stone-200",
  },
  {
    id: "gift",
    label: "Cadeau",
    previewClass: "bg-[#fff0f4]",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
  },
];

export default function AlbumPage() {
  const router = useRouter();
  const [items, setItems] = useState<Restoration[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [format, setFormat] = useState("square");
  const [theme, setTheme] = useState("heritage");
  const [title, setTitle] = useState("Notre album souvenir");
  const [dedication, setDedication] = useState(
    "Une sélection de photos restaurées pour transmettre nos plus beaux souvenirs."
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRestorations() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("restorations")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) {
        console.error(error);
      }

      setItems(data || []);
      setSelectedIds((data || []).slice(0, 6).map((item) => item.id));
      setLoading(false);
    }

    loadRestorations();
  }, [router]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );
  const selectedTheme =
    albumThemes.find((albumTheme) => albumTheme.id === theme) ?? albumThemes[0];
  const selectedFormat =
    albumFormats.find((albumFormat) => albumFormat.id === format) ??
    albumFormats[0];
  const estimatedPages = Math.max(4, Math.ceil(selectedItems.length / 2) + 2);

  function toggleSelection(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <SiteNav />

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-4xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Album souvenir
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6">
            Préparez votre album personnalisé
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Sélectionnez vos photos restaurées, donnez un titre à l’album et
            prévisualisez une première maquette avant la génération PDF.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <h2 className="text-2xl font-black mb-5">
                Informations de l’album
              </h2>

              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">
                    Titre
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">
                    Dédicace
                  </span>
                  <textarea
                    value={dedication}
                    onChange={(event) => setDedication(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <h2 className="text-2xl font-black mb-5">
                Mise en page
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-3">
                    Format
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {albumFormats.map((albumFormat) => {
                      const selected = format === albumFormat.id;

                      return (
                        <button
                          key={albumFormat.id}
                          type="button"
                          onClick={() => setFormat(albumFormat.id)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            selected
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-100 bg-white text-gray-600"
                          }`}
                        >
                          <span className="block font-black">
                            {albumFormat.label}
                          </span>
                          <span className="block text-sm font-semibold">
                            {albumFormat.detail}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-600 mb-3">
                    Ambiance
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {albumThemes.map((albumTheme) => {
                      const selected = theme === albumTheme.id;

                      return (
                        <button
                          key={albumTheme.id}
                          type="button"
                          onClick={() => setTheme(albumTheme.id)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            selected
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <span
                            className={`mb-3 block h-8 w-8 rounded-full border ${albumTheme.previewClass} ${albumTheme.borderClass}`}
                          />
                          <span className="font-black text-gray-700">
                            {albumTheme.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <div className="mb-5">
                <h2 className="text-2xl font-black">
                  Exemples d’album
                </h2>
                <p className="text-gray-600">
                  Visualisez rapidement le rendu selon le format et l’ambiance.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {albumThemes.flatMap((albumTheme) =>
                  albumFormats.map((albumFormat) => {
                    const selectedExample =
                      theme === albumTheme.id && format === albumFormat.id;

                    return (
                      <button
                        key={`${albumTheme.id}-${albumFormat.id}`}
                        type="button"
                        onClick={() => {
                          setTheme(albumTheme.id);
                          setFormat(albumFormat.id);
                        }}
                        className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
                          selectedExample
                            ? "border-purple-500 bg-purple-50 shadow-lg"
                            : "border-gray-100 bg-white shadow-sm"
                        }`}
                      >
                        <div className={`mx-auto mb-4 w-full max-w-[150px] rounded-xl ${albumTheme.previewClass} p-2`}>
                          <div className={`${albumFormat.previewClass} rounded-lg bg-white p-2 shadow-sm`}>
                            <div className={`mb-2 h-2 w-16 rounded-full ${albumTheme.previewClass}`} />
                            <div className="grid grid-cols-2 gap-1.5">
                              <span className="col-span-2 h-12 rounded-md bg-gray-200" />
                              <span className="h-8 rounded-md bg-gray-100" />
                              <span className="h-8 rounded-md bg-gray-200" />
                              <span className="h-8 rounded-md bg-gray-200" />
                              <span className="h-8 rounded-md bg-gray-100" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-gray-800">
                              {albumFormat.label}
                            </p>
                            <p className={`text-sm font-bold ${albumTheme.textClass}`}>
                              {albumTheme.label}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              selectedExample
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {selectedExample ? "Actif" : "Voir"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-black">
                    Choisir les photos
                  </h2>
                  <p className="text-gray-600">
                    {selectedItems.length} photo(s) sélectionnée(s)
                  </p>
                </div>

                <Link
                  href="/upload"
                  className="rounded-2xl bg-purple-100 px-5 py-3 text-center font-bold text-purple-700"
                >
                  Ajouter une photo
                </Link>
              </div>

              {loading ? (
                <p className="text-gray-600">Chargement des photos...</p>
              ) : items.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 border border-gray-100">
                  <p className="text-gray-600 mb-5">
                    Vous n’avez pas encore de photo restaurée à ajouter à un
                    album.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-block rounded-2xl bg-black px-6 py-4 font-bold text-white"
                  >
                    Restaurer une première photo
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const selected = selectedIds.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleSelection(item.id)}
                        className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 ${
                          selected
                            ? "border-purple-500 bg-purple-50 shadow-lg"
                            : "border-gray-100 bg-white shadow-sm"
                        }`}
                      >
                        <img
                          src={item.restored_url}
                          alt={`Photo restaurée ${item.id}`}
                          className="h-44 w-full object-cover"
                        />
                        <div className="flex items-center justify-between p-4">
                          <p className="font-black">
                            Photo #{item.id}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              selected
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {selected ? "Sélectionnée" : "Ajouter"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/60">
              <div className={`rounded-[1.5rem] ${selectedTheme.previewClass} p-4 sm:p-6`}>
                <div className={`${selectedFormat.previewClass} overflow-hidden rounded-[1.25rem] bg-white p-5 sm:p-7 shadow-inner`}>
                  <div className={`border-b ${selectedTheme.borderClass} pb-5 mb-5`}>
                    <p className={`text-sm font-black ${selectedTheme.textClass} mb-3`}>
                      Aperçu de couverture
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                      {title || "Votre album souvenir"}
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                      {dedication}
                    </p>
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className={`flex min-h-[260px] items-center justify-center rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} text-center text-gray-500`}>
                      Sélectionnez des photos pour prévisualiser l’album.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {selectedItems.slice(0, 6).map((item, index) => (
                        <div
                          key={item.id}
                          className={
                            index === 0
                              ? "col-span-2 overflow-hidden rounded-2xl bg-white shadow-sm"
                              : "overflow-hidden rounded-2xl bg-white shadow-sm"
                          }
                        >
                          <img
                            src={item.restored_url}
                            alt={`Aperçu album ${item.id}`}
                            className={
                              index === 0
                                ? "h-44 sm:h-56 w-full object-cover"
                                : "h-28 sm:h-32 w-full object-cover"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs font-bold text-gray-500">Photos</p>
                    <p className="text-xl font-black">{selectedItems.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs font-bold text-gray-500">Pages</p>
                    <p className="text-xl font-black">{estimatedPages}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs font-bold text-gray-500">Format</p>
                    <p className="text-xl font-black">
                      {selectedFormat.label}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  <button
                    disabled
                    className="rounded-2xl bg-black px-6 py-4 font-bold text-white opacity-50"
                  >
                    Générer le PDF bientôt
                  </button>
                  <p className="text-center text-sm font-semibold text-gray-500">
                    La génération PDF et l’impression seront branchées dans une
                    prochaine étape.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
