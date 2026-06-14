"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import WatermarkedImage from "@/components/WatermarkedImage";
import { supabase } from "@/lib/supabase";

type Restoration = {
  id: number;
  original_url: string;
  restored_url: string;
  user_id: string | null;
};

type AlbumPageConfig = {
  id: string;
  note: string;
  photoIds: number[];
  photosPerPage: number;
};

const albumTypes = [
  {
    id: "souvenir",
    label: "Album souvenir",
    detail: "Un livre photo familial, prêt à adapter pour CEWE, Photobox ou équivalent.",
  },
  {
    id: "calendar",
    label: "Album calendrier",
    detail: "Une base pour organiser les photos par mois, à finaliser plus tard.",
  },
  {
    id: "genealogy",
    label: "Album généalogique",
    detail: "Une base pour raconter les générations, les lieux et les liens familiaux.",
  },
];

const albumFormats = [
  { id: "square", label: "Carré", detail: "20 x 20 cm", previewClass: "aspect-square" },
  { id: "portrait", label: "Portrait", detail: "A4 vertical", previewClass: "aspect-[4/5]" },
  { id: "landscape", label: "Paysage", detail: "A4 horizontal", previewClass: "aspect-[4/3]" },
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

const pageStyleOptions = [
  { id: "classic", label: "Classique", detail: "Marges propres" },
  { id: "print", label: "Tirage photo", detail: "Bord blanc" },
  { id: "immersive", label: "Immersif", detail: "Photos larges" },
];

const photosPerPageOptions = [1, 2, 3, 4];

const placeholderFrames = [
  "bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300",
  "bg-gradient-to-br from-stone-200 via-white to-stone-300",
  "bg-gradient-to-br from-zinc-300 via-zinc-100 to-white",
  "bg-gradient-to-br from-neutral-200 via-white to-neutral-300",
];

const vintageCoverClass =
  "bg-[#efe2cf] [background-image:linear-gradient(135deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0)_42%),linear-gradient(0deg,rgba(120,82,42,0.08)_1px,transparent_1px)] [background-size:100%_100%,18px_18px]";

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function createInitialPages(items: Restoration[]): AlbumPageConfig[] {
  const chunks = chunkArray(items.slice(0, 12), 4);
  const usefulChunks = chunks.length > 0 ? chunks : [[]];

  return usefulChunks.map((chunk, index) => ({
    id: `page-${index + 1}`,
    note: "",
    photoIds: chunk.map((item) => item.id),
    photosPerPage: Math.max(1, Math.min(4, chunk.length || 4)),
  }));
}

function getPhotoById(items: Restoration[], id: number) {
  return items.find((item) => item.id === id) ?? null;
}

function getPageGridClass(photosPerPage: number) {
  return photosPerPage === 1 ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2";
}

function getPageImageClass(photosPerPage: number, index: number) {
  if (photosPerPage === 1) return "h-56 w-full rounded-xl object-cover";
  if (photosPerPage === 2) return "h-44 w-full rounded-xl object-cover";
  if (photosPerPage === 3 && index === 0) return "col-span-2 h-36 w-full rounded-xl object-cover";
  if (photosPerPage === 3) return "h-28 w-full rounded-xl object-cover";
  return "h-24 w-full rounded-xl object-cover";
}

function getPhotoStyleClass(pageStyle: string) {
  if (pageStyle === "print") return "border-[6px] border-white bg-white shadow-md";
  if (pageStyle === "immersive") return "shadow-sm";
  return "border border-stone-100 shadow-sm";
}

function getInteriorPageClass(pageStyle: string) {
  if (pageStyle === "immersive") return "relative min-h-[260px] rounded-2xl bg-[#fffdf8] p-2 shadow-inner";
  if (pageStyle === "print") return "relative min-h-[260px] rounded-2xl bg-[#fffaf1] p-4 shadow-inner";
  return "relative min-h-[260px] rounded-2xl bg-[#fffdf8] p-3 shadow-inner";
}

export default function AlbumPage() {
  const router = useRouter();
  const [items, setItems] = useState<Restoration[]>([]);
  const [pages, setPages] = useState<AlbumPageConfig[]>([
    { id: "page-1", note: "", photoIds: [], photosPerPage: 4 },
  ]);
  const [albumType, setAlbumType] = useState("souvenir");
  const [coverPhotoId, setCoverPhotoId] = useState<number | null>(null);
  const [format, setFormat] = useState("square");
  const [theme, setTheme] = useState("heritage");
  const [pageStyle, setPageStyle] = useState("print");
  const [showPrintGuides, setShowPrintGuides] = useState(true);
  const [title, setTitle] = useState("Notre album souvenir");
  const [coverText, setCoverText] = useState(
    "Un album de famille créé à partir de photos restaurées, à offrir et à transmettre."
  );
  const [dedication, setDedication] = useState(
    "Une sélection de photos restaurées pour transmettre nos plus beaux souvenirs."
  );
  const [introText, setIntroText] = useState(
    "Quelques images restaurées pour raconter une histoire de famille, retrouver des visages et transmettre ces souvenirs aux prochaines générations."
  );
  const [closingText, setClosingText] = useState(
    "Un album à feuilleter, à offrir et à conserver comme une trace vivante de notre histoire."
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

      const restoredItems = data || [];
      setItems(restoredItems);
      setCoverPhotoId(restoredItems[0]?.id ?? null);
      setPages(createInitialPages(restoredItems));
      setLoading(false);
    }

    loadRestorations();
  }, [router]);

  const selectedTheme =
    albumThemes.find((albumTheme) => albumTheme.id === theme) ?? albumThemes[0];
  const selectedFormat =
    albumFormats.find((albumFormat) => albumFormat.id === format) ?? albumFormats[0];
  const selectedAlbumType =
    albumTypes.find((type) => type.id === albumType) ?? albumTypes[0];
  const coverPhoto = coverPhotoId ? getPhotoById(items, coverPhotoId) : null;
  const totalSelectedPhotos = pages.reduce(
    (total, page) => total + page.photoIds.length,
    0
  );
  const spreads = useMemo(() => {
    const firstSpread = [{ kind: "verso" as const }, { kind: "page" as const, page: pages[0], index: 0 }];
    const rest = pages.slice(1).map((page, index) => ({
      kind: "page" as const,
      page,
      index: index + 1,
    }));

    return [firstSpread, ...chunkArray(rest, 2)];
  }, [pages]);

  function updatePage(pageIndex: number, nextPage: Partial<AlbumPageConfig>) {
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex ? { ...page, ...nextPage } : page
      )
    );
  }

  function togglePhotoOnPage(pageIndex: number, photoId: number) {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page;

        const alreadySelected = page.photoIds.includes(photoId);
        const nextPhotoIds = alreadySelected
          ? page.photoIds.filter((id) => id !== photoId)
          : page.photoIds.length >= page.photosPerPage
            ? [...page.photoIds.slice(1), photoId]
            : [...page.photoIds, photoId];

        return { ...page, photoIds: nextPhotoIds };
      })
    );
  }

  function updatePhotosPerPage(pageIndex: number, photosPerPage: number) {
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex
          ? { ...page, photosPerPage, photoIds: page.photoIds.slice(0, photosPerPage) }
          : page
      )
    );
  }

  function addPage() {
    setPages((current) => [
      ...current,
      {
        id: `page-${Date.now()}`,
        note: "",
        photoIds: [],
        photosPerPage: 4,
      },
    ]);
  }

  function removePage(pageIndex: number) {
    setPages((current) =>
      current.length === 1 ? current : current.filter((_, index) => index !== pageIndex)
    );
  }

  function renderPagePreview(page: AlbumPageConfig, pageIndex: number) {
    const pagePhotos = page.photoIds
      .map((photoId) => getPhotoById(items, photoId))
      .filter(Boolean) as Restoration[];

    return (
      <div className={getInteriorPageClass(pageStyle)}>
        {showPrintGuides && (
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-amber-700/25" />
        )}
        <div className="mb-2 flex items-center justify-between text-xs font-black text-gray-400">
          <span>Page {pageIndex + 1}</span>
          <span>{page.photoIds.length}/{page.photosPerPage} photo(s)</span>
        </div>

        <div className={getPageGridClass(page.photosPerPage)}>
          {pagePhotos.map((photo, photoIndex) => (
            <WatermarkedImage
              key={`${page.id}-${photo.id}`}
              src={photo.restored_url}
              alt={`Page ${pageIndex + 1} photo ${photo.id}`}
              className={`${getPageImageClass(page.photosPerPage, photoIndex)} ${getPhotoStyleClass(pageStyle)}`}
              imageClassName="h-full w-full object-cover"
            />
          ))}

          {pagePhotos.length === 0 &&
            placeholderFrames.slice(0, page.photosPerPage).map((frameClass, frameIndex) => (
              <span
                key={`${page.id}-placeholder-${frameIndex}`}
                className={`${getPageImageClass(page.photosPerPage, frameIndex)} ${frameClass}`}
              />
            ))}

          {pagePhotos.length > 0 &&
            Array.from({ length: page.photosPerPage - pagePhotos.length }).map((_, emptyIndex) => (
              <span
                key={`${page.id}-empty-${emptyIndex}`}
                className={`${getPageImageClass(page.photosPerPage, pagePhotos.length + emptyIndex)} border-2 border-dashed ${selectedTheme.borderClass}`}
              />
            ))}
        </div>

        {(page.note || pagePhotos.length === 0) && (
          <p className="mt-3 rounded-xl bg-[#f7f3ed] px-3 py-2 text-xs font-semibold leading-relaxed text-gray-500">
            {page.note || "Emplacement prévu pour une date, un lieu ou une anecdote familiale."}
          </p>
        )}
      </div>
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
            Créez votre album étape par étape
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Choisissez le type d’album, préparez la couverture, puis composez les
            pages intérieures une par une.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <p className="text-sm font-black text-purple-700 mb-2">Étape 1</p>
              <h2 className="text-2xl font-black mb-5">Choisir le type d’album</h2>

              <div className="grid gap-3">
                {albumTypes.map((type) => {
                  const selected = albumType === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setAlbumType(type.id)}
                      className={`rounded-2xl border px-5 py-4 text-left transition ${
                        selected
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-100 bg-white text-gray-600"
                      }`}
                    >
                      <span className="block font-black">{type.label}</span>
                      <span className="block text-sm font-semibold">{type.detail}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                {albumFormats.map((albumFormat) => (
                  <button
                    key={albumFormat.id}
                    type="button"
                    onClick={() => setFormat(albumFormat.id)}
                    className={`rounded-2xl border px-4 py-4 text-left ${
                      format === albumFormat.id
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-100 bg-white text-gray-600"
                    }`}
                  >
                    <span className="block font-black">{albumFormat.label}</span>
                    <span className="block text-sm font-semibold">{albumFormat.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <p className="text-sm font-black text-purple-700 mb-2">Étape 2</p>
              <h2 className="text-2xl font-black mb-5">Composer la couverture</h2>

              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">Titre</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">
                    Texte de couverture
                  </span>
                  <textarea
                    value={coverText}
                    onChange={(event) => setCoverText(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">Dédicace</span>
                  <textarea
                    value={dedication}
                    onChange={(event) => setDedication(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm font-bold text-gray-600">Photo de couverture</p>
                  <Link href="/upload" className="text-sm font-black text-purple-700">
                    Ajouter une photo
                  </Link>
                </div>

                {loading ? (
                  <p className="text-gray-600">Chargement des photos...</p>
                ) : items.length === 0 ? (
                  <div className={`rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} p-5 text-sm font-semibold text-gray-500`}>
                    Ajoutez une photo restaurée pour l’utiliser en couverture.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {items.slice(0, 9).map((item) => {
                      const selected = coverPhotoId === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCoverPhotoId(item.id)}
                          className={`overflow-hidden rounded-2xl border text-left transition ${
                            selected
                              ? "border-purple-500 bg-purple-50 shadow-lg"
                              : "border-gray-100 bg-white shadow-sm"
                          }`}
                        >
                          <div className="relative h-28 overflow-hidden bg-black/5">
                            <img
                              src={item.restored_url}
                              alt={`Photo de couverture ${item.id}`}
                              className="h-full w-full object-cover"
                            />
                            <span className="pointer-events-none absolute inset-x-2 top-1/2 -rotate-12 rounded-full bg-black/25 px-2 py-1 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                              Mémoire Vivante
                            </span>
                          </div>
                          <div className="p-3">
                            <span className={`text-xs font-black ${selected ? "text-purple-700" : "text-gray-500"}`}>
                              {selected ? "Couverture" : "Choisir"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <p className="text-sm font-black text-purple-700 mb-2">Étape 3</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-black">Composer les pages intérieures</h2>
                  <p className="text-gray-600">
                    La page 1 apparaît à droite. À gauche, c’est le verso de la couverture.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPage}
                  className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
                >
                  Ajouter une page
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {albumThemes.map((albumTheme) => (
                  <button
                    key={albumTheme.id}
                    type="button"
                    onClick={() => setTheme(albumTheme.id)}
                    className={`rounded-2xl border px-4 py-4 text-left ${
                      theme === albumTheme.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <span
                      className={`mb-3 block h-8 w-8 rounded-full border ${albumTheme.previewClass} ${albumTheme.borderClass}`}
                    />
                    <span className="font-black text-gray-700">{albumTheme.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {pageStyleOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPageStyle(option.id)}
                    className={`rounded-2xl border px-4 py-4 text-left ${
                      pageStyle === option.id
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-100 bg-white text-gray-600"
                    }`}
                  >
                    <span className="block font-black">{option.label}</span>
                    <span className="block text-sm font-semibold">{option.detail}</span>
                  </button>
                ))}
              </div>

              <label className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4">
                <span>
                  <span className="block font-black text-gray-700">Repères d’impression</span>
                  <span className="block text-sm font-semibold text-gray-500">
                    Affiche une zone sûre pour éviter les textes trop proches des bords.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={showPrintGuides}
                  onChange={(event) => setShowPrintGuides(event.target.checked)}
                  className="h-5 w-5 accent-purple-600"
                />
              </label>

              <div className="space-y-6">
                {pages.map((page, pageIndex) => (
                  <div key={page.id} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-purple-700">Page {pageIndex + 1}</p>
                        <h3 className="text-xl font-black">
                          {pageIndex === 0
                            ? "Première page intérieure, à droite"
                            : "Page intérieure"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePage(pageIndex)}
                        disabled={pages.length === 1}
                        className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="mb-5">
                      <p className="text-sm font-bold text-gray-600 mb-3">Nombre de photos</p>
                      <div className="grid grid-cols-4 gap-3">
                        {photosPerPageOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updatePhotosPerPage(pageIndex, option)}
                            className={`rounded-2xl border px-4 py-3 text-center ${
                              page.photosPerPage === option
                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                : "border-gray-100 bg-white text-gray-600"
                            }`}
                          >
                            <span className="block text-xl font-black">{option}</span>
                            <span className="block text-xs font-bold">photo{option > 1 ? "s" : ""}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="mb-5 block">
                      <span className="block text-sm font-bold text-gray-600 mb-2">
                        Texte ou anecdote de la page
                      </span>
                      <textarea
                        value={page.note}
                        onChange={(event) => updatePage(pageIndex, { note: event.target.value })}
                        placeholder="Ex. Été 1968, vacances en famille à Biarritz."
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                      />
                    </label>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-gray-600">
                          Sélectionner les photos de cette page
                        </p>
                        <span className="text-sm font-black text-gray-400">
                          {page.photoIds.length}/{page.photosPerPage}
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <div className={`rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} p-5 text-sm font-semibold text-gray-500`}>
                          Aucune photo restaurée disponible.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {items.map((item) => {
                            const selected = page.photoIds.includes(item.id);

                            return (
                              <button
                                key={`${page.id}-${item.id}`}
                                type="button"
                                onClick={() => togglePhotoOnPage(pageIndex, item.id)}
                                className={`overflow-hidden rounded-2xl border text-left ${
                                  selected
                                    ? "border-purple-500 bg-purple-50 shadow-lg"
                                    : "border-gray-100 bg-white shadow-sm"
                                }`}
                              >
                                <div className="relative h-28 overflow-hidden bg-black/5">
                                  <img
                                    src={item.restored_url}
                                    alt={`Photo ${item.id}`}
                                    className="h-full w-full object-cover"
                                  />
                                  <span className="pointer-events-none absolute inset-x-2 top-1/2 -rotate-12 rounded-full bg-black/25 px-2 py-1 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                                    Mémoire Vivante
                                  </span>
                                </div>
                                <div className="p-3">
                                  <span className={`text-xs font-black ${selected ? "text-purple-700" : "text-gray-500"}`}>
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
                ))}
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <h2 className="text-2xl font-black mb-5">Textes de début et de fin</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">Introduction</span>
                  <textarea
                    value={introText}
                    onChange={(event) => setIntroText(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-gray-600 mb-2">Texte de fin</span>
                  <textarea
                    value={closingText}
                    onChange={(event) => setClosingText(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-white/60 bg-[#efe8dd] p-5 sm:p-7 shadow-2xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[#7d6245]">Aperçu réaliste</p>
                  <p className="text-xs font-bold text-[#9a8065]">
                    {selectedAlbumType.label} · couverture + pages
                  </p>
                </div>
                <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black text-[#7d6245]">
                  {totalSelectedPhotos} photo(s)
                </span>
              </div>

              <div className={`rounded-[1.5rem] ${selectedTheme.previewClass} p-4 sm:p-6 shadow-inner`}>
                <div className="relative mx-auto max-w-[560px]">
                  <div className="absolute -bottom-4 left-8 right-8 h-10 rounded-full bg-black/20 blur-2xl" />
                  <div className="absolute inset-y-5 -left-2 w-4 rounded-l-2xl bg-[#3b2b1d]/20" />
                  <div className={`${selectedFormat.previewClass} relative min-h-[560px] overflow-hidden rounded-[1.25rem] border border-[#d2bfa8] ${vintageCoverClass} p-5 sm:min-h-[620px] sm:p-7 shadow-[0_28px_70px_rgba(75,52,28,0.35)]`}>
                    <div className="absolute inset-y-0 left-0 w-4 bg-black/10" />
                    <div className="absolute inset-x-8 top-4 h-px bg-white/45" />
                    {showPrintGuides && (
                      <div className="pointer-events-none absolute inset-6 z-20 rounded-[1rem] border border-dashed border-amber-700/35">
                        <span className="absolute -top-3 left-4 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">
                          Zone sûre
                        </span>
                      </div>
                    )}
                    <div className="relative z-10 flex min-h-[520px] flex-col items-center justify-center text-center sm:min-h-[570px]">
                      <p className={`text-xs font-black uppercase tracking-[0.22em] ${selectedTheme.textClass}`}>
                        Couverture
                      </p>
                      <h2 className="mt-4 max-w-md text-2xl sm:text-3xl font-black leading-tight text-[#2f241a]">
                        {title || "Votre album souvenir"}
                      </h2>
                      <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-[#6f5b45]">
                        {coverText}
                      </p>

                      <div className="my-5 w-full max-w-[320px] sm:my-6">
                        {coverPhoto ? (
                          <div className="rotate-[-1deg] rounded-[1.25rem] bg-white p-3 shadow-xl">
                            <WatermarkedImage
                              src={coverPhoto.restored_url}
                              alt="Photo principale de couverture"
                              className="h-40 sm:h-52"
                              imageClassName="h-full w-full rounded-2xl object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`h-40 rounded-[1.25rem] border-2 border-dashed ${selectedTheme.borderClass} bg-white/55 p-3 shadow-inner sm:h-52`}>
                            <div className={`h-full rounded-2xl ${placeholderFrames[0]}`} />
                          </div>
                        )}
                      </div>

                      <p className="max-w-md text-sm font-semibold leading-relaxed text-[#6f5b45]">
                        {dedication}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs font-bold text-gray-500">Type</p>
                    <p className="text-lg font-black">{selectedAlbumType.label}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs font-bold text-gray-500">Pages</p>
                    <p className="text-xl font-black">{pages.length + 2}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-xs font-bold text-gray-500">Format</p>
                    <p className="text-xl font-black">{selectedFormat.label}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.25rem] bg-white/75 p-4 shadow-inner">
                  <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                    <p className={`mb-2 text-xs font-black ${selectedTheme.textClass}`}>
                      Verso de couverture
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {introText}
                    </p>
                  </div>

                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black">Doubles-pages</p>
                      <p className="text-sm font-semibold text-gray-500">
                        Page 1 à droite, puis pages suivantes.
                      </p>
                    </div>
                  </div>

                  <div className="max-h-[560px] space-y-5 overflow-y-auto pr-1">
                    {spreads.map((spread, spreadIndex) => (
                      <div
                        key={`spread-${spreadIndex}`}
                        className="relative rounded-[1.25rem] bg-[#d8c8b7] p-3 shadow-[0_18px_35px_rgba(75,52,28,0.16)]"
                      >
                        <div className="absolute inset-y-4 left-1/2 z-10 w-px bg-gradient-to-b from-transparent via-black/20 to-transparent" />
                        <div className="grid grid-cols-2 gap-3">
                          {spread.map((slot, slotIndex) => {
                            if (slot.kind === "verso") {
                              return (
                                <div
                                  key={`verso-${spreadIndex}-${slotIndex}`}
                                  className="min-h-[260px] rounded-2xl bg-[#fffdf8] p-4 shadow-inner"
                                >
                                  <p className="mb-3 text-xs font-black text-gray-400">
                                    Verso couverture
                                  </p>
                                  <div className="flex h-[210px] items-center justify-center rounded-xl border-2 border-dashed border-stone-200 px-4 text-center text-xs font-semibold leading-relaxed text-stone-400">
                                    {introText}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={slot.page.id}>
                                {renderPagePreview(slot.page, slot.index)}
                              </div>
                            );
                          })}

                          {spread.length === 1 && (
                            <div className="min-h-[260px] rounded-2xl bg-[#fffdf8] p-3 shadow-inner">
                              <div className="mb-2 flex items-center justify-between text-xs font-black text-gray-300">
                                <span>Page suivante</span>
                                <span>libre</span>
                              </div>
                              <div className="flex h-[210px] items-center justify-center rounded-xl border-2 border-dashed border-stone-200 px-4 text-center text-xs font-semibold leading-relaxed text-stone-400">
                                Espace disponible pour une photo ou une anecdote.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                    <p className={`mb-2 text-xs font-black ${selectedTheme.textClass}`}>
                      Texte de fin
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {closingText}
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
                    La génération PDF et l’impression seront branchées dans une prochaine étape.
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
