"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import WatermarkedImage from "@/components/WatermarkedImage";
import { supabase } from "@/lib/supabase";

type Restoration = {
  id: number;
  original_url: string;
  restored_url: string;
  user_id: string | null;
  unlocked_at: string | null;
};

type AlbumPageConfig = {
  id: string;
  layout: AlbumPageLayout;
  note: string;
  photoIds: Array<number | null>;
  photoFits: Record<number, CalendarPhotoFit>;
  photosPerPage: number;
};

type AlbumPageLayout = "auto" | "full" | "story" | "mosaic" | "memory";

type CalendarPhotoFit = "cover" | "contain" | "top";

type CalendarMonthConfig = {
  caption: string;
  photoFit: CalendarPhotoFit;
  importantDates: string;
  photoId: number | null;
};

type AlbumSaveConfig = {
  albumType: string;
  calendarMonths: CalendarMonthConfig[];
  calendarPosterCaption: string;
  calendarPosterDates: string;
  calendarPosterPhotoFits: Record<number, CalendarPhotoFit>;
  calendarPosterPhotoIds: number[];
  calendarProduct: string;
  calendarTheme: string;
  calendarYear: number;
  closingText: string;
  coverPhotoFit: CalendarPhotoFit;
  coverPhotoId: number | null;
  coverBackground: string;
  coverText: string;
  dedication: string;
  format: string;
  introText: string;
  pages: AlbumPageConfig[];
  pageStyle: string;
  showPrintGuides: boolean;
  theme: string;
  title: string;
  version: number;
};

const albumTypes = [
  {
    id: "souvenir",
    label: "Album souvenir",
    detail: "Un livre photo familial, prêt à adapter pour CEWE, Photobox ou équivalent.",
  },
  {
    id: "calendar",
    label: "Calendrier familial",
    detail: "Créez un calendrier familial à partir de vos photos restaurées.",
  },
];

const albumFormats = [
  { id: "square", label: "Carré 21 x 21", detail: "Format classique CEWE / Photobox", previewClass: "aspect-square" },
  { id: "square-xl", label: "Carré XL 30 x 30", detail: "Grand format carré premium", previewClass: "aspect-square" },
];

const albumThemes = [
  {
    id: "heritage",
    label: "Héritage",
    detail: "Ivoire, dorure légère, intemporel",
    previewClass: "bg-[#f7f1e6]",
    textClass: "text-[#6b4c24]",
    borderClass: "border-[#dcc9a8]",
    coverClass:
      "bg-[#f8f5ef] [background-image:linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0)_45%),linear-gradient(0deg,rgba(121,86,42,0.06)_1px,transparent_1px)] [background-size:100%_100%,18px_18px]",
    coverBorderClass: "border-[#d8c5a5]",
    coverTitleClass: "text-[#2f241a]",
    coverTextClass: "text-[#6f5b45]",
    pageClass: "bg-[#fffaf1]",
    spreadClass: "bg-[#d8c8b7]",
    noteClass: "bg-[#f4eadb] text-[#705d48]",
    photoFrameClass: "border-[6px] border-white bg-white shadow-md",
  },
  {
    id: "atelier",
    label: "Atelier",
    detail: "Carnet de voyage, papier chaud",
    previewClass: "bg-[#f3eadc]",
    textClass: "text-[#8a5a34]",
    borderClass: "border-[#dfc5a5]",
    coverClass:
      "bg-[#f2e4d0] [background-image:linear-gradient(135deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0)_42%),linear-gradient(0deg,rgba(112,76,42,0.08)_1px,transparent_1px)] [background-size:100%_100%,20px_20px]",
    coverBorderClass: "border-[#cfb18c]",
    coverTitleClass: "text-[#382719]",
    coverTextClass: "text-[#795a3e]",
    pageClass: "bg-[#fff7ea]",
    spreadClass: "bg-[#d4b996]",
    noteClass: "bg-[#f2e4d0] text-[#755238]",
    photoFrameClass: "border-[6px] border-[#fffaf2] bg-[#fffaf2] shadow-md",
  },
  {
    id: "contemporary",
    label: "Contemporain",
    detail: "Blanc, minimaliste, photos larges",
    previewClass: "bg-[#f4f5f8]",
    textClass: "text-[#4f46e5]",
    borderClass: "border-[#d9ddf2]",
    coverClass:
      "bg-white [background-image:linear-gradient(135deg,rgba(79,70,229,0.07)_0%,rgba(236,72,153,0.05)_35%,rgba(255,255,255,0)_70%)]",
    coverBorderClass: "border-[#e4e7f4]",
    coverTitleClass: "text-[#111827]",
    coverTextClass: "text-[#4b5563]",
    pageClass: "bg-white",
    spreadClass: "bg-[#e8ebf2]",
    noteClass: "bg-[#f6f7fb] text-[#4b5563]",
    photoFrameClass: "border border-[#edf0f7] bg-white shadow-sm",
  },
];

function normalizeAlbumThemeId(themeId: string) {
  if (themeId === "classic" || themeId === "vintage") return "atelier";
  if (themeId === "gift" || themeId === "prune") return "contemporary";
  if (themeId === "ivoire") return "heritage";
  return themeId;
}

const pageStyleOptions = [
  { id: "classic", label: "Classique", detail: "Marges propres" },
  { id: "print", label: "Tirage photo", detail: "Bord blanc" },
  { id: "immersive", label: "Immersif", detail: "Photos larges" },
];

const photosPerPageOptions = [1, 2, 3, 4];

const pageLayoutOptions: { id: AlbumPageLayout; label: string; detail: string }[] = [
  { id: "auto", label: "Auto", detail: "Recommandé" },
  { id: "full", label: "Pleine page", detail: "1 photo" },
  { id: "story", label: "Récit", detail: "2 photos" },
  { id: "mosaic", label: "Mosaïque", detail: "2 à 4 photos" },
  { id: "memory", label: "Souvenir", detail: "3 photos" },
];

const calendarPhotoFitOptions: { id: CalendarPhotoFit; label: string; detail: string }[] = [
  { id: "cover", label: "Remplir", detail: "Plein cadre" },
  { id: "contain", label: "Photo entière", detail: "Sans coupe" },
  { id: "top", label: "Centré haut", detail: "Utile portraits" },
];

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

const calendarThemes = [
  {
    id: "family",
    label: "Classique familial",
    detail: "Ivoire, bleu nuit, doré discret",
    pageClass: "bg-[#fffaf2]",
    accentClass: "text-[#213047]",
    borderClass: "border-[#e8d8bf]",
  },
  {
    id: "vintage",
    label: "Vintage mémoire",
    detail: "Papier ancien et cadre souvenir",
    pageClass: "bg-[#f4eadb]",
    accentClass: "text-[#7b5133]",
    borderClass: "border-[#d9c2a2]",
  },
  {
    id: "premium",
    label: "Moderne premium",
    detail: "Blanc, violet doux, minimaliste",
    pageClass: "bg-white",
    accentClass: "text-purple-700",
    borderClass: "border-purple-100",
  },
];

const calendarProductOptions = [
  {
    id: "monthly",
    label: "Calendrier 12 pages",
    detail: "Une page par mois avec photo, légende et dates importantes.",
  },
  {
    id: "posterPortrait",
    label: "Affiche portrait 30 x 45",
    detail: "Une page annuelle verticale avec 3 photos.",
  },
  {
    id: "posterLandscape",
    label: "Affiche paysage 45 x 30",
    detail: "Une page annuelle horizontale avec 3 photos.",
  },
];

const placeholderFrames = [
  "bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300",
  "bg-gradient-to-br from-stone-200 via-white to-stone-300",
  "bg-gradient-to-br from-zinc-300 via-zinc-100 to-white",
  "bg-gradient-to-br from-neutral-200 via-white to-neutral-300",
];

function getDefaultCalendarYear() {
  return new Date().getFullYear() + 1;
}

function createInitialCalendarMonths(items: Restoration[]): CalendarMonthConfig[] {
  return monthNames.map((_, index) => ({
    caption: index === 0 ? "Premier souvenir de l’année" : "",
    photoFit: "cover",
    importantDates: "",
    photoId: items[index % Math.max(items.length, 1)]?.id ?? null,
  }));
}

function getCalendarPhotoFitClass(photoFit: CalendarPhotoFit) {
  if (photoFit === "contain") return "h-full w-full object-contain";
  if (photoFit === "top") return "h-full w-full object-cover object-top";
  return "h-full w-full object-cover";
}

function getPhotoFitObjectClass(photoFit: CalendarPhotoFit) {
  if (photoFit === "contain") return "object-contain";
  if (photoFit === "top") return "object-cover object-top";
  return "object-cover";
}

function getCalendarDays(year: number, monthIndex: number) {
  const firstDate = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mondayBasedStart = (firstDate.getDay() + 6) % 7;

  return [
    ...Array.from({ length: mondayBasedStart }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function createInitialPages(items: Restoration[]): AlbumPageConfig[] {
  const chunks = chunkArray(items, 4);
  const usefulChunks = chunks.length > 0 ? chunks : [[]];

  return usefulChunks.map((chunk, index) => ({
    id: `page-${index + 1}`,
    layout: "auto",
    note: "",
    photoIds: [
      ...chunk.map((item) => item.id),
      ...Array.from({ length: Math.max(0, 4 - chunk.length) }, () => null),
    ],
    photoFits: Object.fromEntries(chunk.map((item) => [item.id, "cover"])),
    photosPerPage: Math.max(1, Math.min(4, chunk.length || 4)),
  }));
}

function getPhotoById(items: Restoration[], id: number) {
  return items.find((item) => item.id === id) ?? null;
}

function getPickerItems(
  items: Restoration[],
  selectedPhotoIds: Array<number | null | undefined>
) {
  const selectedIds = selectedPhotoIds.filter(
    (photoId): photoId is number => typeof photoId === "number"
  );
  const selectedItems = selectedIds
    .map((photoId) => getPhotoById(items, photoId))
    .filter(Boolean) as Restoration[];
  const selectedSet = new Set(selectedIds);
  const otherItems = items.filter((item) => !selectedSet.has(item.id));

  return [...selectedItems, ...otherItems];
}

function normalizePagePhotoIds(page: AlbumPageConfig) {
  const photoIds = Array.isArray(page.photoIds) ? page.photoIds : [];

  return [
    ...photoIds.slice(0, page.photosPerPage),
    ...Array.from(
      { length: Math.max(0, page.photosPerPage - photoIds.length) },
      () => null
    ),
  ];
}

function getSelectedPagePhotoIds(page: AlbumPageConfig) {
  return normalizePagePhotoIds(page).filter(
    (photoId): photoId is number => typeof photoId === "number"
  );
}

function getEffectivePageLayout(page: AlbumPageConfig): Exclude<AlbumPageLayout, "auto"> {
  if (page.layout !== "auto") return page.layout;
  if (page.photosPerPage === 1) return "full";
  if (page.photosPerPage === 2) return "story";
  if (page.photosPerPage === 3) return "memory";
  return "mosaic";
}

function getLayoutMaxPhotos(layout: AlbumPageLayout) {
  if (layout === "full") return 1;
  if (layout === "story") return 2;
  if (layout === "memory") return 3;
  return 4;
}

function isPageLayoutAvailable(layout: AlbumPageLayout, photosPerPage: number) {
  if (layout === "auto") return true;
  if (layout === "full") return photosPerPage === 1;
  if (layout === "story") return photosPerPage === 2;
  if (layout === "memory") return photosPerPage === 3;
  return photosPerPage >= 2 && photosPerPage <= 4;
}

function getAutoLayoutLabel(photosPerPage: number) {
  if (photosPerPage === 1) return "Pleine page";
  if (photosPerPage === 2) return "Récit";
  if (photosPerPage === 3) return "Souvenir";
  return "Mosaïque";
}

function getPageGridClass(page: AlbumPageConfig) {
  const layout = getEffectivePageLayout(page);

  if (layout === "full") return "grid grid-cols-1 gap-3";
  if (layout === "story") return "grid grid-cols-2 gap-3";
  if (layout === "memory") return "grid grid-cols-2 gap-3";
  return page.photosPerPage === 1 ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3";
}

function getPageImageClass(page: AlbumPageConfig, index: number) {
  const layout = getEffectivePageLayout(page);

  if (layout === "full") return "aspect-square w-full rounded-xl";
  if (layout === "story") return "col-span-2 aspect-[16/9] w-full rounded-xl";
  if (layout === "memory" && index === 0) return "col-span-2 aspect-[16/10] w-full rounded-xl";
  if (layout === "mosaic" && page.photosPerPage === 3 && index === 0) {
    return "col-span-2 aspect-[2/1] w-full rounded-xl";
  }
  if (page.photosPerPage === 2 && layout === "mosaic") return "aspect-[2/1] w-full rounded-xl";
  return "aspect-square w-full rounded-xl";
}

function getPhotoStyleClass(
  pageStyle: string,
  albumTheme: (typeof albumThemes)[number]
) {
  if (pageStyle === "immersive") return "shadow-sm";
  return albumTheme.photoFrameClass;
}

function getInteriorPageClass(
  pageStyle: string,
  albumTheme: (typeof albumThemes)[number]
) {
  if (pageStyle === "immersive") {
    return `relative min-h-[430px] rounded-2xl ${albumTheme.pageClass} p-2 shadow-inner`;
  }
  if (pageStyle === "print") {
    return `relative min-h-[430px] rounded-2xl ${albumTheme.pageClass} p-4 shadow-inner`;
  }
  return `relative min-h-[430px] rounded-2xl ${albumTheme.pageClass} p-3 shadow-inner`;
}

function getAlbumPdfPreviewClass() {
  return "mx-auto w-[640px] max-w-none shrink-0";
}

function getAlbumImageExportPreviewClass() {
  return "mx-auto h-[800px] w-[800px] max-w-none shrink-0";
}

function getAlbumImageExportPageClass() {
  return "mx-auto w-[800px] max-w-none shrink-0";
}

function getAlbumPdfPageClass() {
  return "pdf-page-album-square";
}

function slugifyFilePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AlbumPage() {
  const router = useRouter();
  const imageExportRef = useRef<HTMLDivElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedAlbumId, setSavedAlbumId] = useState<string | null>(null);
  const [savingAlbum, setSavingAlbum] = useState(false);
  const [exportingImages, setExportingImages] = useState(false);
  const [renderingImageExport, setRenderingImageExport] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [items, setItems] = useState<Restoration[]>([]);
  const [pages, setPages] = useState<AlbumPageConfig[]>([
    {
      id: "page-1",
      layout: "auto",
      note: "",
      photoIds: [null, null, null, null],
      photoFits: {},
      photosPerPage: 4,
    },
  ]);
  const [activePageSlots, setActivePageSlots] = useState<Record<string, number>>({});
  const [albumType, setAlbumType] = useState("souvenir");
  const [coverPhotoId, setCoverPhotoId] = useState<number | null>(null);
  const [coverPhotoFit, setCoverPhotoFit] = useState<CalendarPhotoFit>("cover");
  const [format, setFormat] = useState("square");
  const [theme, setTheme] = useState("heritage");
  const [calendarProduct, setCalendarProduct] = useState("monthly");
  const [calendarTheme, setCalendarTheme] = useState("family");
  const [calendarYear, setCalendarYear] = useState(getDefaultCalendarYear);
  const [calendarMonths, setCalendarMonths] = useState<CalendarMonthConfig[]>(
    createInitialCalendarMonths([])
  );
  const [calendarPosterPhotoIds, setCalendarPosterPhotoIds] = useState<number[]>([]);
  const [calendarPosterPhotoFits, setCalendarPosterPhotoFits] = useState<
    Record<number, CalendarPhotoFit>
  >({});
  const [calendarPosterCaption, setCalendarPosterCaption] = useState(
    "Une année de souvenirs restaurés à partager en famille."
  );
  const [calendarPosterDates, setCalendarPosterDates] = useState(
    "Anniversaires, mariages, fêtes de famille et moments à ne pas oublier."
  );
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

  const selectedTheme =
    albumThemes.find((albumTheme) => albumTheme.id === normalizeAlbumThemeId(theme)) ??
    albumThemes[0];
  const selectedFormat =
    albumFormats.find((albumFormat) => albumFormat.id === format) ?? albumFormats[0];
  const selectedAlbumType =
    albumTypes.find((type) => type.id === albumType) ?? albumTypes[0];
  const selectedCalendarTheme =
    calendarThemes.find((calendarThemeItem) => calendarThemeItem.id === calendarTheme) ??
    calendarThemes[0];
  const selectedCalendarProduct =
    calendarProductOptions.find((product) => product.id === calendarProduct) ??
    calendarProductOptions[0];
  const coverPhoto = coverPhotoId ? getPhotoById(items, coverPhotoId) : null;
  const calendarPosterPhotos = calendarPosterPhotoIds
    .map((photoId) => getPhotoById(items, photoId))
    .filter(Boolean) as Restoration[];
  const totalSelectedPhotos = pages.reduce(
    (total, page) => total + getSelectedPagePhotoIds(page).length,
    0
  );
  const emptyPagesCount = pages.filter(
    (page) => getSelectedPagePhotoIds(page).length === 0
  ).length;
  const configuredCalendarMonths = calendarMonths.filter(
    (month) => month.photoId || month.caption.trim() || month.importantDates.trim()
  ).length;
  const selectedCalendarMonthPhotoCount = calendarMonths.filter(
    (month) => month.photoId
  ).length;
  const calendarPosterSelectedCount = Math.min(calendarPosterPhotoIds.length, 3);
  const completedSteps =
    albumType === "calendar"
      ? [
          Boolean(albumType && calendarProduct),
          Boolean(title.trim() && calendarYear),
          calendarProduct === "monthly"
            ? selectedCalendarMonthPhotoCount === 12
            : calendarPosterSelectedCount === 3,
        ]
      : [
          Boolean(albumType && format),
          Boolean(title.trim() && coverText.trim() && coverPhoto),
          pages.some((page) => getSelectedPagePhotoIds(page).length > 0),
        ];
  const completedStepsCount = completedSteps.filter(Boolean).length;
  const progressLabels =
    albumType === "calendar" ? ["Type", "Réglages", "Photos"] : ["Type", "Couverture", "Pages"];
  const previewPhotoCount =
    albumType === "calendar"
      ? calendarProduct === "monthly"
        ? selectedCalendarMonthPhotoCount
        : calendarPosterSelectedCount
      : totalSelectedPhotos;
  const selectedProjectPhotoIds = Array.from(
    new Set(
      albumType === "calendar"
        ? calendarProduct === "monthly"
          ? calendarMonths
              .map((month) => month.photoId)
              .filter((photoId): photoId is number => Boolean(photoId))
          : calendarPosterPhotoIds.slice(0, 3)
        : [
            ...(coverPhotoId ? [coverPhotoId] : []),
            ...pages.flatMap((page) => getSelectedPagePhotoIds(page)),
          ]
    )
  );
  const unlockedProjectPhotoCount = selectedProjectPhotoIds.filter((photoId) => {
    const photo = getPhotoById(items, photoId);
    return Boolean(photo?.unlocked_at);
  }).length;
  const hasLockedProjectPhotos =
    selectedProjectPhotoIds.length > unlockedProjectPhotoCount;
  const missingProjectPhotoCount =
    albumType === "calendar"
      ? calendarProduct === "monthly"
        ? Math.max(0, 12 - selectedCalendarMonthPhotoCount)
        : Math.max(0, 3 - calendarPosterSelectedCount)
      : Math.max(0, (coverPhoto ? 0 : 1) + (totalSelectedPhotos > 0 ? 0 : 1));
  const exportBlockReason =
    missingProjectPhotoCount > 0
      ? albumType === "calendar"
        ? calendarProduct === "monthly"
          ? `Ajoutez encore ${missingProjectPhotoCount} photo(s) pour compléter les 12 mois.`
          : `Choisissez encore ${missingProjectPhotoCount} photo(s) pour compléter ce calendrier.`
        : coverPhoto
          ? "Ajoutez au moins une photo intérieure avant l’export."
          : "Choisissez une photo de couverture avant l’export."
      : hasLockedProjectPhotos
        ? "Débloquez toutes les photos sélectionnées avant l’export final."
        : "";
  const canExportProject = !exportBlockReason;
  const projectFormatLabel =
    albumType === "calendar" ? selectedCalendarProduct.label : selectedFormat.label;
  const projectPhotoTarget =
    albumType === "calendar"
      ? calendarProduct === "monthly"
        ? "12 photos conseillées"
        : "3 photos obligatoires"
      : "24 pages de base chez CEWE / Photobox";
  const projectNextAdvice =
    completedStepsCount < 3
      ? "Complétez les étapes avant l’export."
      : hasLockedProjectPhotos
        ? "Débloquez les photos finales avant impression."
        : "Prêt pour sauvegarde et export.";
  const spreads = useMemo(() => {
    const firstSpread = [{ kind: "verso" as const }, { kind: "page" as const, page: pages[0], index: 0 }];
    const rest = pages.slice(1).map((page, index) => ({
      kind: "page" as const,
      page,
      index: index + 1,
    }));

    return [firstSpread, ...chunkArray(rest, 2)];
  }, [pages]);
  const photoUsage = useMemo(() => {
    const usage = new Map<number, { pageIndex: number; slotIndex: number }>();

    pages.forEach((page, pageIndex) => {
      normalizePagePhotoIds(page).forEach((photoId, slotIndex) => {
        if (typeof photoId === "number" && !usage.has(photoId)) {
          usage.set(photoId, { pageIndex, slotIndex });
        }
      });
    });

    return usage;
  }, [pages]);

  function getActiveSlotIndex(page: AlbumPageConfig) {
    const savedSlotIndex = activePageSlots[page.id];

    if (
      typeof savedSlotIndex === "number" &&
      savedSlotIndex >= 0 &&
      savedSlotIndex < page.photosPerPage
    ) {
      return savedSlotIndex;
    }

    const emptySlotIndex = normalizePagePhotoIds(page).findIndex(
      (photoId) => photoId === null
    );

    return emptySlotIndex >= 0 ? emptySlotIndex : 0;
  }

  function scrollToAlbumSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function renderAlbumJumpNav(activeId: string) {
    if (albumType === "calendar") return null;

    const navItems = [
      { id: "album-cover-editor", label: "Couverture" },
      ...pages.map((page, index) => ({
        id: `album-page-editor-${page.id}`,
        label: `Page ${index + 1}`,
      })),
    ];

    return (
      <div className="mb-5 rounded-2xl border border-purple-100 bg-purple-50/80 p-3">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-purple-700">
          Aller à
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToAlbumSection(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                activeId === item.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-purple-700 hover:bg-purple-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function getAlbumSaveConfig(): AlbumSaveConfig {
    return {
      albumType,
      calendarMonths,
      calendarPosterCaption,
      calendarPosterDates,
      calendarPosterPhotoFits,
      calendarPosterPhotoIds,
      calendarProduct,
      calendarTheme,
      calendarYear,
      closingText,
      coverBackground: selectedTheme.id,
      coverPhotoFit,
      coverPhotoId,
      coverText,
      dedication,
      format,
      introText,
      pages,
      pageStyle,
      showPrintGuides,
      theme: selectedTheme.id,
      title,
      version: 1,
    };
  }

  function applySavedAlbumConfig(config: Partial<AlbumSaveConfig>) {
    if (typeof config.albumType === "string") setAlbumType(config.albumType);
    if (typeof config.coverPhotoId === "number" || config.coverPhotoId === null) {
      setCoverPhotoId(config.coverPhotoId);
    }
    if (config.coverPhotoFit) setCoverPhotoFit(config.coverPhotoFit);
    if (typeof config.coverBackground === "string" && typeof config.theme !== "string") {
      setTheme(config.coverBackground);
    }
    if (typeof config.format === "string") {
      setFormat(albumFormats.some((albumFormat) => albumFormat.id === config.format) ? config.format : "square");
    }
    if (typeof config.theme === "string") setTheme(config.theme);
    if (typeof config.calendarProduct === "string") setCalendarProduct(config.calendarProduct);
    if (typeof config.calendarTheme === "string") setCalendarTheme(config.calendarTheme);
    if (typeof config.calendarYear === "number") setCalendarYear(config.calendarYear);
    if (Array.isArray(config.calendarMonths)) setCalendarMonths(config.calendarMonths);
    if (Array.isArray(config.calendarPosterPhotoIds)) {
      setCalendarPosterPhotoIds(config.calendarPosterPhotoIds);
    }
    if (config.calendarPosterPhotoFits) {
      setCalendarPosterPhotoFits(config.calendarPosterPhotoFits);
    }
    if (typeof config.calendarPosterCaption === "string") {
      setCalendarPosterCaption(config.calendarPosterCaption);
    }
    if (typeof config.calendarPosterDates === "string") {
      setCalendarPosterDates(config.calendarPosterDates);
    }
    if (typeof config.pageStyle === "string") setPageStyle(config.pageStyle);
    if (typeof config.showPrintGuides === "boolean") {
      setShowPrintGuides(config.showPrintGuides);
    }
    if (typeof config.title === "string") setTitle(config.title);
    if (typeof config.coverText === "string") setCoverText(config.coverText);
    if (typeof config.dedication === "string") setDedication(config.dedication);
    if (typeof config.introText === "string") setIntroText(config.introText);
    if (typeof config.closingText === "string") setClosingText(config.closingText);
    if (Array.isArray(config.pages) && config.pages.length > 0) {
      setPages(
        config.pages.map((page) => {
          const photosPerPage = Math.max(
            1,
            Math.min(4, page.photosPerPage ?? 4)
          );
          const nextPage = {
            ...page,
            layout: page.layout ?? "auto",
            photoFits: page.photoFits ?? {},
            photosPerPage,
          };

          return {
            ...nextPage,
            photoIds: normalizePagePhotoIds(nextPage),
          };
        })
      );
    }
  }

  async function saveCurrentAlbum() {
    if (!userId) {
      setSaveError("Vous devez être connecté pour sauvegarder l’album.");
      return;
    }

    setSavingAlbum(true);
    setSaveError("");
    setSaveMessage("");

    const payload = {
      album_type: albumType,
      config: getAlbumSaveConfig(),
      title: title.trim() || "Album souvenir",
      updated_at: new Date().toISOString(),
      user_id: userId,
    };

    const request = savedAlbumId
      ? supabase
          .from("albums")
          .update(payload)
          .eq("id", savedAlbumId)
          .eq("user_id", userId)
          .select("id")
          .single()
      : supabase.from("albums").insert(payload).select("id").single();

    const { data, error } = await request;

    if (error) {
      console.error(error);
      setSaveError(
        "Impossible de sauvegarder cet album pour le moment. Réessayez dans quelques instants."
      );
    } else {
      setSavedAlbumId(data.id);
      setSaveMessage("Album sauvegardé.");
    }

    setSavingAlbum(false);
  }

  function printCurrentAlbum() {
    if (!canExportProject) {
      setSaveError(exportBlockReason);
      return;
    }

    const printStyleId = "album-print-page-size";
    const existingPrintStyle = document.getElementById(printStyleId);
    const printStyle = existingPrintStyle ?? document.createElement("style");
    const pageOrientation =
      albumType === "calendar" && calendarProduct === "posterLandscape"
        ? "landscape"
        : "portrait";
    const pageSize =
      albumType !== "calendar"
        ? "200mm 200mm"
        : `A4 ${pageOrientation}`;

    printStyle.id = printStyleId;
    printStyle.textContent = `@media print { @page { size: ${pageSize}; margin: 8mm; } }`;

    if (!existingPrintStyle) {
      document.head.appendChild(printStyle);
    }

    window.print();
  }

  async function exportImagePack() {
    if (exportingImages) return;

    if (!canExportProject) {
      setSaveError(exportBlockReason);
      return;
    }

    setExportingImages(true);
    setRenderingImageExport(true);
    setSaveError("");
    setSaveMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!imageExportRef.current) return;

      const exportNodes = Array.from(
        imageExportRef.current.querySelectorAll<HTMLElement>("[data-export-name]")
      );

      if (exportNodes.length === 0) return;

      const zip = new JSZip();

      for (const node of exportNodes) {
        const fileName = node.dataset.exportName || "page.png";
        const dataUrl = await toPng(node, {
          backgroundColor: "#ffffff",
          cacheBust: true,
          pixelRatio: 3,
        });
        const base64Content = dataUrl.split(",")[1];

        zip.file(fileName, base64Content, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      const productName =
        albumType === "calendar"
          ? `calendrier-${calendarYear}-${selectedCalendarProduct.label}`
          : `album-${selectedFormat.label}-${title || "souvenir"}`;

      downloadLink.href = zipUrl;
      downloadLink.download = `${slugifyFilePart(productName)}-png.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(zipUrl);
      setSaveMessage("Pack PNG généré.");
    } catch (error) {
      console.error(error);
      setSaveError(
        "Impossible de générer le pack PNG. Vérifiez que les images sont bien chargées, puis réessayez."
      );
    } finally {
      setExportingImages(false);
      setRenderingImageExport(false);
    }
  }

  useEffect(() => {
    async function loadRestorations() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=${encodeURIComponent("/album")}`);
        return;
      }

      setUserId(user.id);

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
      setCalendarMonths(createInitialCalendarMonths(restoredItems));
      setCalendarPosterPhotoIds(restoredItems.slice(0, 3).map((item) => item.id));

      const { data: savedAlbum, error: albumError } = await supabase
        .from("albums")
        .select("id, config, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (albumError) {
        console.warn(albumError);
        setSaveError(
          "Impossible de recharger votre album sauvegardé pour le moment."
        );
      } else if (savedAlbum) {
        setSavedAlbumId(savedAlbum.id);
        applySavedAlbumConfig(savedAlbum.config as Partial<AlbumSaveConfig>);
        setSaveMessage("Album sauvegardé rechargé.");
      }

      setLoading(false);
    }

    loadRestorations();
  }, [router]);

  function updatePage(pageIndex: number, nextPage: Partial<AlbumPageConfig>) {
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex ? { ...page, ...nextPage } : page
      )
    );
  }

  function setPhotoOnPageSlot(
    pageIndex: number,
    slotIndex: number,
    photoId: number | null
  ) {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page;

        const nextPhotoIds = normalizePagePhotoIds(page);
        const existingSlotIndex =
          typeof photoId === "number" ? nextPhotoIds.indexOf(photoId) : -1;

        if (existingSlotIndex >= 0 && existingSlotIndex !== slotIndex) {
          nextPhotoIds[existingSlotIndex] = null;
        }

        nextPhotoIds[slotIndex] = photoId;
        const nextPhotoFits = Object.fromEntries(
          nextPhotoIds
            .filter((id): id is number => typeof id === "number")
            .map((id) => [id, page.photoFits[id] ?? "cover"])
        );

        return { ...page, photoIds: nextPhotoIds, photoFits: nextPhotoFits };
      })
    );
  }

  function updatePhotosPerPage(pageIndex: number, photosPerPage: number) {
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex
          ? {
              ...page,
              layout:
                page.layout !== "auto" && photosPerPage > getLayoutMaxPhotos(page.layout)
                  ? "auto"
                  : page.layout,
              photosPerPage,
              photoIds: normalizePagePhotoIds(page).slice(0, photosPerPage),
              photoFits: Object.fromEntries(
                normalizePagePhotoIds(page)
                  .slice(0, photosPerPage)
                  .filter((photoId): photoId is number => typeof photoId === "number")
                  .map((photoId) => [photoId, page.photoFits[photoId] ?? "cover"])
              ),
            }
          : page
      )
    );
  }

  function updatePageLayout(pageIndex: number, layout: AlbumPageLayout) {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page;

        const photosPerPage = Math.min(page.photosPerPage, getLayoutMaxPhotos(layout));
        const photoIds = normalizePagePhotoIds(page).slice(0, photosPerPage);

        return {
          ...page,
          layout,
          photosPerPage,
          photoIds,
          photoFits: Object.fromEntries(
            photoIds
              .filter((photoId): photoId is number => typeof photoId === "number")
              .map((photoId) => [photoId, page.photoFits[photoId] ?? "cover"])
          ),
        };
      })
    );
  }

  function updatePagePhotoFit(
    pageIndex: number,
    photoId: number,
    photoFit: CalendarPhotoFit
  ) {
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex
          ? { ...page, photoFits: { ...page.photoFits, [photoId]: photoFit } }
          : page
      )
    );
  }

  function addPageAfter(pageIndex: number) {
    setPages((current) => {
      let nextPageNumber = current.length + 1;
      let nextPageId = `page-${nextPageNumber}`;

      while (current.some((page) => page.id === nextPageId)) {
        nextPageNumber += 1;
        nextPageId = `page-${nextPageNumber}`;
      }

      const newPage = {
        id: nextPageId,
        layout: "auto" as AlbumPageLayout,
        note: "",
        photoIds: [null, null, null, null],
        photoFits: {},
        photosPerPage: 4,
      };

      return [
        ...current.slice(0, pageIndex + 1),
        newPage,
        ...current.slice(pageIndex + 1),
      ];
    });
  }

  function removePage(pageIndex: number) {
    setPages((current) =>
      current.length === 1 ? current : current.filter((_, index) => index !== pageIndex)
    );
  }

  function updateCalendarMonth(
    monthIndex: number,
    nextMonth: Partial<CalendarMonthConfig>
  ) {
    setCalendarMonths((current) =>
      current.map((month, index) =>
        index === monthIndex ? { ...month, ...nextMonth } : month
      )
    );
  }

  function toggleCalendarPosterPhoto(photoId: number) {
    setCalendarPosterPhotoIds((current) => {
      let nextPhotoIds: number[];

      if (current.includes(photoId)) {
        nextPhotoIds = current.filter((id) => id !== photoId);
      } else if (current.length >= 3) {
        nextPhotoIds = [...current.slice(1), photoId];
      } else {
        nextPhotoIds = [...current, photoId];
      }

      setCalendarPosterPhotoFits((currentFits) =>
        Object.fromEntries(
          nextPhotoIds.map((id) => [id, currentFits[id] ?? "cover"])
        )
      );

      return nextPhotoIds;
    });
  }

  function updateCalendarPosterPhotoFit(
    photoId: number,
    photoFit: CalendarPhotoFit
  ) {
    setCalendarPosterPhotoFits((current) => ({
      ...current,
      [photoId]: photoFit,
    }));
  }

  function renderRestoredPhoto(
    photo: Restoration,
    alt: string,
    className: string,
    imageClassName = "object-cover",
    watermarkProps: {
      badgeClassName?: string;
      watermarkClassName?: string;
    } = {}
  ) {
    if (photo.unlocked_at) {
      return (
        <img
          src={photo.restored_url}
          alt={alt}
          className={`${className} ${imageClassName} rounded-2xl`}
        />
      );
    }

    return (
      <WatermarkedImage
        src={photo.restored_url}
        alt={`${alt} avec filigrane`}
        className={className}
        imageClassName={imageClassName}
        {...watermarkProps}
      />
    );
  }

  function renderPagePreview(
    page: AlbumPageConfig,
    pageIndex: number,
    className = "",
    cleanExport = false
  ) {
    const pageSlots = normalizePagePhotoIds(page);
    const pagePhotos = pageSlots.map((photoId) =>
      typeof photoId === "number" ? getPhotoById(items, photoId) : null
    );
    const selectedPhotoCount = pagePhotos.filter(Boolean).length;

    if (cleanExport) {
      return (
        <div className={`${getInteriorPageClass(pageStyle, selectedTheme)} ${className}`}>
          <div className={getPageGridClass(page)}>
            {pagePhotos.map((photo, photoIndex) =>
              photo ? (
                <div
                  key={`${page.id}-export-${photo.id}-${photoIndex}`}
                  className={`${getPageImageClass(page, photoIndex)} ${getPhotoStyleClass(pageStyle, selectedTheme)}`}
                >
                  {renderRestoredPhoto(
                    photo,
                    `Page ${pageIndex + 1} photo ${photoIndex + 1}`,
                    "h-full w-full",
                    getCalendarPhotoFitClass(page.photoFits[photo.id] ?? "cover")
                  )}
                </div>
              ) : (
                <span
                  key={`${page.id}-export-empty-${photoIndex}`}
                  className={`${getPageImageClass(page, photoIndex)} rounded-xl border-2 border-dashed ${selectedTheme.borderClass} bg-white/45`}
                />
              )
            )}
          </div>

          {page.note && (
            <p className={`mt-4 rounded-xl px-5 py-4 text-lg font-semibold leading-relaxed ${selectedTheme.noteClass}`}>
              {page.note}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={`${getInteriorPageClass(pageStyle, selectedTheme)} ${className}`}>
        {showPrintGuides && (
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-amber-700/25" />
        )}
        <div className="mb-2 flex items-center justify-between text-xs font-black text-gray-400">
          <span>Page {pageIndex + 1}</span>
          <span>{selectedPhotoCount}/{page.photosPerPage} photo(s)</span>
        </div>

        <div className={getPageGridClass(page)}>
          {pagePhotos.map((photo, photoIndex) =>
            photo ? (
              <div
                key={`${page.id}-${photo.id}-${photoIndex}`}
                className={`${getPageImageClass(page, photoIndex)} ${getPhotoStyleClass(pageStyle, selectedTheme)}`}
              >
                {renderRestoredPhoto(
                  photo,
                  `Page ${pageIndex + 1} photo ${photo.id}`,
                  "h-full w-full",
                  getCalendarPhotoFitClass(page.photoFits[photo.id] ?? "cover")
                )}
              </div>
            ) : (
              <span
                key={`${page.id}-empty-slot-${photoIndex}`}
                className={`${getPageImageClass(page, photoIndex)} border-2 border-dashed ${selectedTheme.borderClass} bg-white/45`}
              />
            )
          )}
        </div>

        {(page.note || selectedPhotoCount === 0) && (
          <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold leading-relaxed ${selectedTheme.noteClass}`}>
            {page.note || "Emplacement prévu pour une date, un lieu ou une anecdote familiale."}
          </p>
        )}
      </div>
    );
  }

  function renderCalendarMonthPreview(
    month: CalendarMonthConfig,
    monthIndex: number,
    className = ""
  ) {
    const monthPhoto = month.photoId ? getPhotoById(items, month.photoId) : null;
    const calendarDays = getCalendarDays(calendarYear, monthIndex);
    const isClassicFamilyTheme = selectedCalendarTheme.id === "family";

    if (isClassicFamilyTheme) {
      return (
        <div
          className={`relative overflow-hidden rounded-[1.35rem] border border-[#ddc99d] bg-[#fff8ec] p-4 shadow-[0_14px_36px_rgba(91,68,37,0.16)] ${className}`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(132,96,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.52),rgba(255,255,255,0))] [background-size:100%_18px,100%_100%]" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-center gap-1.5">
              {Array.from({ length: 13 }).map((_, index) => (
                <span
                  key={`binding-${monthIndex}-${index}`}
                  className="h-2 w-2 rounded-full border border-[#c8a35e] bg-[#f5dfaa] shadow-inner"
                />
              ))}
            </div>

            <div className="rounded-[1.1rem] border border-[#d6bd8b] bg-white/75 p-2 shadow-sm">
              {monthPhoto ? (
                renderRestoredPhoto(
                  monthPhoto,
                  `Photo calendrier ${monthNames[monthIndex]}`,
                  "h-56",
                  getCalendarPhotoFitClass(month.photoFit)
                )
              ) : (
                <div className={`h-56 rounded-xl ${placeholderFrames[monthIndex % placeholderFrames.length]}`} />
              )}
            </div>

            <div className="relative mx-auto -mt-3 w-[86%] rounded-[1rem] border border-[#d4b274] bg-[#fffaf2] px-4 py-3 text-center shadow-[0_8px_22px_rgba(91,68,37,0.12)]">
              <div className="mx-auto mb-1 h-px w-12 bg-[#c79b48]" />
              <p className="font-serif text-xl font-black uppercase tracking-[0.12em] text-[#203049]">
                {monthNames[monthIndex]} {calendarYear}
              </p>
              <p className="mt-1 min-h-[30px] text-xs font-semibold italic leading-relaxed text-[#7b6548]">
                {month.caption || "En famille, chaque moment devient un souvenir."}
              </p>
            </div>

            <div className="mt-4 rounded-[1rem] border border-[#eadcc2] bg-white/70 p-3">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-[0.08em] text-[#8e7855]">
                {weekDays.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-[#efe3ce] bg-[#efe3ce] text-center text-xs font-bold text-[#2f3745]">
                {calendarDays.map((day, index) => (
                  <span
                    key={`${monthIndex}-${index}`}
                    className={`min-h-8 bg-white/80 py-1.5 ${day ? "" : "text-transparent"}`}
                  >
                    {day ?? "0"}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-[0.9rem] border border-[#eadcc2] bg-white/65 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9a7330]">
                Dates importantes
              </p>
              <p className="mt-1 min-h-[22px] text-xs font-semibold leading-relaxed text-[#655743]">
                {month.importantDates || "Ajoutez anniversaires, mariages ou souvenirs du mois."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`rounded-[1.25rem] border ${selectedCalendarTheme.borderClass} ${selectedCalendarTheme.pageClass} p-4 shadow-sm ${className}`}>
        <div className="mb-4">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.2em] ${selectedCalendarTheme.accentClass}`}>
              {monthNames[monthIndex]}
            </p>
            <h3 className="text-3xl font-black text-gray-950">{calendarYear}</h3>
          </div>
        </div>

        {monthPhoto ? (
          renderRestoredPhoto(
            monthPhoto,
            `Photo calendrier ${monthNames[monthIndex]}`,
            "h-52",
            getCalendarPhotoFitClass(month.photoFit)
          )
        ) : (
          <div className={`h-52 rounded-2xl ${placeholderFrames[monthIndex % placeholderFrames.length]}`} />
        )}

        <p className="mt-4 min-h-[40px] text-sm font-semibold leading-relaxed text-gray-600">
          {month.caption || "Souvenir du mois à compléter."}
        </p>

        <div className="mt-4 rounded-2xl bg-white/75 p-3">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-gray-400">
            {weekDays.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-700">
            {calendarDays.map((day, index) => (
              <span
                key={`${monthIndex}-${index}`}
                className={day ? "rounded-lg bg-white py-1" : "py-1"}
              >
                {day ?? ""}
              </span>
            ))}
          </div>
        </div>

        {month.importantDates && (
          <p className="mt-3 rounded-xl bg-white/75 px-3 py-2 text-xs font-semibold leading-relaxed text-gray-500">
            {month.importantDates}
          </p>
        )}
      </div>
    );
  }

  function renderPosterMiniMonth(monthIndex: number, compact = false) {
    const calendarDays = getCalendarDays(calendarYear, monthIndex);

    return (
      <div className={`rounded-xl bg-white/75 ${compact ? "p-1.5" : "p-2"}`}>
        <p className={`mb-1 text-center font-black uppercase ${compact ? "text-[8px]" : "text-[9px]"} ${selectedCalendarTheme.accentClass}`}>
          {monthNames[monthIndex]}
        </p>
        <div className={`grid grid-cols-7 gap-0.5 text-center font-black text-gray-400 ${compact ? "text-[6px]" : "text-[7px]"}`}>
          {weekDays.map((day, index) => (
            <span key={`poster-week-${monthIndex}-${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className={`mt-1 grid grid-cols-7 gap-0.5 text-center font-bold text-gray-700 ${compact ? "text-[7px]" : "text-[8px]"}`}>
          {calendarDays.map((day, index) => (
            <span
              key={`poster-day-${monthIndex}-${index}`}
              className={day ? `rounded-sm bg-white ${compact ? "py-px" : "py-0.5"}` : compact ? "py-px" : "py-0.5"}
            >
              {day ?? ""}
            </span>
          ))}
        </div>
      </div>
    );
  }

  function renderCalendarPosterPreview(displayMode: "screen" | "export" = "export") {
    const isPortrait = calendarProduct === "posterPortrait";
    const isScreenPreview = displayMode === "screen";
    const isLandscapeExport = !isPortrait && !isScreenPreview;
    const posterPhotos = calendarPosterPhotos.slice(0, 3);
    const posterSlots = [posterPhotos[0], posterPhotos[1], posterPhotos[2]];
    const posterSizeClass = isPortrait
      ? isScreenPreview
        ? "min-h-[900px] w-[520px] max-w-full"
        : "min-h-[930px] max-w-[620px]"
      : isScreenPreview
        ? "min-h-[560px] w-[760px] max-w-none"
        : "h-[600px] w-[900px] max-w-none";
    const photoAreaClass = isPortrait
      ? isScreenPreview
        ? "h-[250px]"
        : "h-[360px]"
      : isScreenPreview
        ? "h-[145px]"
        : "h-[185px]";
    const monthGridClass = isPortrait ? "grid-cols-3" : "grid-cols-6";
    const posterPaddingClass = isPortrait
      ? isScreenPreview
        ? "p-4"
        : "p-5"
      : isScreenPreview
        ? "p-3"
        : "p-3";
    const posterGapClass = isPortrait
      ? isScreenPreview
        ? "gap-3"
        : "gap-4"
      : isScreenPreview
        ? "gap-2"
        : "gap-2";
    const posterImageProps = {
      badgeClassName: isPortrait
        ? isScreenPreview
          ? "bottom-2 right-2 px-2.5 py-1 text-[9px]"
          : "bottom-3 right-3 px-3 py-1.5 text-[10px]"
        : "bottom-2 right-2 px-2 py-1 text-[9px]",
      watermarkClassName: isPortrait
        ? isScreenPreview
          ? "px-3 py-1 text-xs tracking-[0.14em]"
          : "px-4 py-1.5 text-sm tracking-[0.16em]"
        : isScreenPreview
          ? "px-2.5 py-1 text-[10px] tracking-[0.12em]"
          : "px-3 py-1.5 text-xs tracking-[0.14em]",
    };
    const posterInnerStyle = isLandscapeExport
      ? {
          height: `${100 / 0.86}%`,
          transform: "scale(0.86)",
          transformOrigin: "top left",
          width: `${100 / 0.86}%`,
        }
      : undefined;

    return (
      <div
        className={`mx-auto rounded-[1.5rem] border ${selectedCalendarTheme.borderClass} ${selectedCalendarTheme.pageClass} ${posterSizeClass} ${posterPaddingClass} ${isLandscapeExport ? "overflow-hidden" : ""} shadow-lg`}
      >
        <div className={`flex min-h-full flex-col ${posterGapClass}`} style={posterInnerStyle}>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.2em] ${selectedCalendarTheme.accentClass}`}>
              Calendrier familial
            </p>
          </div>

          {isPortrait ? (
            <div className={`grid ${photoAreaClass} grid-cols-[1.15fr_0.85fr] gap-3 overflow-hidden`}>
              {posterSlots[0] ? (
                renderRestoredPhoto(
                  posterSlots[0],
                  "Photo principale affiche calendrier",
                  "h-full min-h-0",
                  getCalendarPhotoFitClass(
                    calendarPosterPhotoFits[posterSlots[0].id] ?? "cover"
                  ),
                  posterImageProps
                )
              ) : (
                <span className="grid h-full min-h-0 place-items-center rounded-2xl border-2 border-dashed border-white/80 bg-white/45 text-xs font-black text-gray-500">
                  Photo 1 à choisir
                </span>
              )}

              <div className="grid h-full min-h-0 grid-rows-2 gap-3 overflow-hidden">
                {[posterSlots[1], posterSlots[2]].map((photo, index) =>
                  photo ? (
                    <div key={`poster-side-${photo.id}`} className="h-full min-h-0">
                      {renderRestoredPhoto(
                        photo,
                        `Photo affiche calendrier ${index + 2}`,
                        "h-full min-h-0",
                        getCalendarPhotoFitClass(
                          calendarPosterPhotoFits[photo.id] ?? "cover"
                        ),
                        posterImageProps
                      )}
                    </div>
                  ) : (
                    <span
                      key={`poster-side-empty-${index}`}
                      className="grid h-full min-h-0 place-items-center rounded-2xl border-2 border-dashed border-white/80 bg-white/45 text-xs font-black text-gray-500"
                    >
                      Photo {index + 2} à choisir
                    </span>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className={`grid ${photoAreaClass} grid-cols-3 gap-3 overflow-hidden`}>
              {posterSlots.map((photo, index) =>
                photo ? (
                  <div key={`poster-landscape-${photo.id}`} className="h-full min-h-0">
                    {renderRestoredPhoto(
                      photo,
                      `Photo affiche calendrier ${index + 1}`,
                      "h-full min-h-0",
                      getCalendarPhotoFitClass(
                        calendarPosterPhotoFits[photo.id] ?? "cover"
                      ),
                      posterImageProps
                    )}
                  </div>
                ) : (
                  <span
                    key={`poster-landscape-empty-${index}`}
                    className="grid h-full min-h-0 place-items-center rounded-2xl border-2 border-dashed border-white/80 bg-white/45 text-xs font-black text-gray-500"
                  >
                    Photo {index + 1} à choisir
                  </span>
                )
              )}
            </div>
          )}

          <div className="text-center">
            <h3 className={`${
              isPortrait
                ? isScreenPreview
                  ? "text-4xl"
                  : "text-5xl"
                : isScreenPreview
                  ? "text-3xl"
                  : "text-4xl"
            } font-black text-gray-950`}>
              {calendarYear}
            </h3>
            <p className={`${
              isPortrait
                ? isScreenPreview
                  ? "mt-0.5 text-xs"
                  : "mt-1 text-sm"
                : "mt-0.5 text-xs"
            } font-semibold leading-relaxed text-gray-600`}>
              {calendarPosterCaption || "Une légende familiale à compléter."}
            </p>
          </div>

          <div className={`rounded-2xl bg-white/70 ${isPortrait ? (isScreenPreview ? "p-2" : "p-3") : isScreenPreview ? "p-2" : "p-1.5"}`}>
            <div className={`grid ${isScreenPreview ? "gap-1.5" : "gap-2"} ${monthGridClass}`}>
              {monthNames.map((monthName, monthIndex) => (
                <div key={`poster-full-month-${monthName}`}>
                  {renderPosterMiniMonth(monthIndex, !isPortrait || isScreenPreview)}
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-auto rounded-2xl bg-white/75 ${isPortrait ? (isScreenPreview ? "p-3" : "p-4") : isScreenPreview ? "p-3" : "p-2.5"}`}>
            <h4 className={`${isPortrait ? (isScreenPreview ? "text-base" : "text-xl") : isScreenPreview ? "text-base" : "text-sm"} font-black text-gray-950`}>
              {title || "Notre calendrier souvenir"}
            </h4>
            <p className={`${isPortrait && !isScreenPreview ? "mt-3" : "mt-1"} ${!isPortrait && !isScreenPreview ? "text-[10px]" : "text-xs"} font-semibold leading-relaxed text-gray-500`}>
              {calendarPosterDates || "Dates importantes à ajouter."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderCoverPreview(className = "", cleanExport = false) {
    return (
      <div className={`relative ${className}`}>
        {!cleanExport && (
          <>
            <div className="absolute -bottom-4 left-8 right-8 h-10 rounded-full bg-black/20 blur-2xl" />
            <div className="absolute inset-y-5 -left-2 w-4 rounded-l-2xl bg-[#3b2b1d]/20" />
          </>
        )}
        <div className={`${selectedFormat.previewClass} relative min-h-[560px] overflow-hidden rounded-[1.25rem] border ${selectedTheme.coverBorderClass} ${selectedTheme.coverClass} p-5 sm:min-h-[620px] sm:p-7 shadow-[0_24px_60px_rgba(75,52,28,0.22)]`}>
          <div className="absolute inset-y-0 left-0 w-4 bg-black/10" />
          <div className="absolute inset-x-8 top-4 h-px bg-white/45" />
          {showPrintGuides && !cleanExport && (
            <div className="pointer-events-none absolute inset-6 z-20 rounded-[1rem] border border-dashed border-amber-700/35">
              <span className="absolute -top-3 left-4 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">
                Zone sûre
              </span>
            </div>
          )}
          <div className="relative z-10 flex min-h-[520px] flex-col items-center justify-center text-center sm:min-h-[570px]">
            {!cleanExport && (
              <p className={`text-xs font-black uppercase tracking-[0.22em] ${selectedTheme.textClass}`}>
                Couverture
              </p>
            )}
            <h2 className={`mt-4 max-w-md text-2xl sm:text-3xl font-black leading-tight ${selectedTheme.coverTitleClass}`}>
              {title || "Votre album souvenir"}
            </h2>
            <p className={`mt-3 max-w-md text-sm font-semibold leading-relaxed ${selectedTheme.coverTextClass}`}>
              {coverText}
            </p>

            <div className="my-5 w-full max-w-[320px] sm:my-6">
              {coverPhoto ? (
                <div className="rotate-[-1deg] rounded-[1.25rem] bg-white p-3 shadow-xl">
                  {renderRestoredPhoto(
                    coverPhoto,
                    "Photo principale de couverture",
                    "h-40 sm:h-52",
                    `${getCalendarPhotoFitClass(coverPhotoFit)} rounded-2xl`
                  )}
                </div>
              ) : (
                <div className={`h-40 rounded-[1.25rem] border-2 border-dashed ${selectedTheme.borderClass} bg-white/55 p-3 shadow-inner sm:h-52`}>
                  <div className={`h-full rounded-2xl ${placeholderFrames[0]}`} />
                </div>
              )}
            </div>

            <p className={`max-w-md text-sm font-semibold leading-relaxed ${selectedTheme.coverTextClass}`}>
              {dedication}
            </p>
          </div>
        </div>
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

        <div
          className={`grid gap-8 lg:gap-12 items-start ${
            albumType === "calendar" || albumType === "souvenir"
              ? "lg:grid-cols-1"
              : "lg:grid-cols-[0.95fr_1.05fr]"
          }`}
        >
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-purple-100 bg-gradient-to-br from-purple-100 via-white to-pink-100 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
                    Progression
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-gray-950">
                    {completedStepsCount}/3 étape(s) complétée(s)
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Avancez dans l’ordre pour composer un aperçu clair avant l’export.
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
                  {progressLabels.map((label, index) => (
                    <span
                      key={label}
                      className={`min-w-[128px] rounded-2xl px-5 py-3 text-center text-sm font-black shadow-sm ${
                        completedSteps[index]
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={saveCurrentAlbum}
                    disabled={savingAlbum || loading}
                    className="min-w-[160px] rounded-2xl bg-black px-5 py-3 text-center text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingAlbum ? "Sauvegarde..." : savedAlbumId ? "Mettre à jour" : "Sauvegarder"}
                  </button>
                </div>
              </div>

              {(saveMessage || saveError) && (
                <div
                  className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${
                    saveError
                      ? "bg-red-50 text-red-700"
                      : "bg-white/80 text-purple-700"
                  }`}
                >
                  {saveError || saveMessage}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-700">
                    Résumé du projet
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-gray-950">
                    {selectedAlbumType.label}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    {projectNextAdvice}
                  </p>
                </div>

                <Link
                  href="/gallery"
                  className="rounded-2xl bg-purple-100 px-5 py-3 text-center text-sm font-black text-purple-700"
                >
                  Gérer mes photos
                </Link>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-purple-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-purple-700">
                    Format
                  </p>
                  <p className="mt-2 text-sm font-black text-gray-900">
                    {projectFormatLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                    Objectif
                  </p>
                  <p className="mt-2 text-sm font-black text-gray-900">
                    {projectPhotoTarget}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                    Photos choisies
                  </p>
                  <p className="mt-2 text-2xl font-black text-gray-950">
                    {selectedProjectPhotoIds.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                    Sans filigrane
                  </p>
                  <p className="mt-2 text-2xl font-black text-purple-700">
                    {unlockedProjectPhotoCount}/{selectedProjectPhotoIds.length}
                  </p>
                </div>
              </div>

              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${
                  canExportProject
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-900"
                }`}
              >
                {canExportProject
                  ? "Export final prêt : les photos sélectionnées sont débloquées sans filigrane."
                  : exportBlockReason}
              </div>
            </div>

            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <p className="text-sm font-black text-purple-700 mb-2">Étape 1</p>
              <h2 className="text-2xl font-black mb-2">Choisir votre création</h2>
              <p className="mb-6 text-gray-600">
                Sélectionnez d’abord une famille de produit, puis le format adapté.
              </p>

              <div className="grid gap-5 xl:grid-cols-2">
                <div
                  className={`rounded-[1.5rem] border p-5 transition ${
                    albumType === "souvenir"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setAlbumType("souvenir")}
                    className="w-full text-left"
                  >
                    <span className="block text-xl font-black text-gray-950">
                      Album photo
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-gray-600">
                      Un livre photo familial prêt à adapter chez CEWE, Photobox ou équivalent.
                    </span>
                  </button>

                  <div className="mt-4 grid gap-3">
                    {albumFormats.map((albumFormat) => (
                      <button
                        key={albumFormat.id}
                        type="button"
                        onClick={() => {
                          setAlbumType("souvenir");
                          setFormat(albumFormat.id);
                        }}
                        className={`rounded-2xl border px-4 py-4 text-left ${
                          albumType === "souvenir" && format === albumFormat.id
                            ? "border-purple-500 bg-white text-purple-700 shadow-sm"
                            : "border-gray-100 bg-white/80 text-gray-600"
                        }`}
                      >
                        <span className="block font-black">{albumFormat.label}</span>
                        <span className="block text-sm font-semibold">
                          {albumFormat.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-[1.5rem] border p-5 transition ${
                    albumType === "calendar"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setAlbumType("calendar")}
                    className="w-full text-left"
                  >
                    <span className="block text-xl font-black text-gray-950">
                      Calendrier familial
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-gray-600">
                      Un calendrier à offrir, créé avec vos photos restaurées.
                    </span>
                  </button>

                  <div className="mt-4 grid gap-3">
                    {calendarProductOptions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setAlbumType("calendar");
                          setCalendarProduct(product.id);
                        }}
                        className={`rounded-2xl border px-4 py-4 text-left ${
                          albumType === "calendar" && calendarProduct === product.id
                            ? "border-purple-500 bg-white text-purple-700 shadow-sm"
                            : "border-gray-100 bg-white/80 text-gray-600"
                        }`}
                      >
                        <span className="block font-black">{product.label}</span>
                        <span className="block text-sm font-semibold">
                          {product.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {albumType === "calendar" ? (
              <>
                <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
                  <p className="text-sm font-black text-purple-700 mb-2">Étape 2</p>
                  <h2 className="text-2xl font-black mb-5">
                    Configurer le calendrier familial
                  </h2>

                  <div className="grid sm:grid-cols-[0.7fr_1.3fr] gap-4">
                    <label className="block">
                      <span className="block text-sm font-bold text-gray-600 mb-2">
                        Année
                      </span>
                      <input
                        type="number"
                        value={calendarYear}
                        onChange={(event) =>
                          setCalendarYear(Number(event.target.value) || 2026)
                        }
                        className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[new Date().getFullYear(), new Date().getFullYear() + 1].map(
                          (yearOption) => (
                            <button
                              key={yearOption}
                              type="button"
                              onClick={() => setCalendarYear(yearOption)}
                              className={`rounded-xl px-3 py-2 text-xs font-black ${
                                calendarYear === yearOption
                                  ? "bg-purple-600 text-white"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {yearOption}
                            </button>
                          )
                        )}
                      </div>
                    </label>

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
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-bold text-gray-600 mb-3">
                      Thème calendrier
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {calendarThemes.map((calendarThemeOption) => (
                        <button
                          key={calendarThemeOption.id}
                          type="button"
                          onClick={() => setCalendarTheme(calendarThemeOption.id)}
                          className={`rounded-2xl border px-4 py-4 text-left ${
                            calendarTheme === calendarThemeOption.id
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-100 bg-white text-gray-600"
                          }`}
                        >
                          <span className="block font-black">
                            {calendarThemeOption.label}
                          </span>
                          <span className="block text-sm font-semibold">
                            {calendarThemeOption.detail}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                      <p className="text-sm font-black text-purple-700 mb-2">Étape 3</p>
                      <h2 className="text-2xl font-black">
                        {calendarProduct === "monthly"
                          ? "Composer les 12 mois"
                          : "Composer l’affiche annuelle"}
                      </h2>
                      <p className="text-gray-600">
                        {calendarProduct === "monthly"
                          ? "Pour chaque mois : une photo restaurée, une légende et les dates importantes."
                          : "Choisissez 3 photos fortes, puis ajoutez une légende et les dates clés."}
                      </p>
                    </div>
                    <Link
                      href="/upload"
                      className="rounded-2xl bg-purple-100 px-5 py-3 text-center font-bold text-purple-700"
                    >
                      Ajouter des photos
                    </Link>
                  </div>

                  {calendarProduct === "monthly" ? (
                    <div className="space-y-5">
                      {calendarMonths.map((month, monthIndex) => (
                      <div key={monthNames[monthIndex]} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-purple-700">
                              {monthNames[monthIndex]}
                            </p>
                            <h3 className="text-xl font-black">
                              Page calendrier
                            </h3>
                          </div>
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">
                            {calendarYear}
                          </span>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
                          <div>
                            <label className="mb-4 block">
                              <span className="block text-sm font-bold text-gray-600 mb-2">
                                Légende souvenir
                              </span>
                              <input
                                value={month.caption}
                                onChange={(event) =>
                                  updateCalendarMonth(monthIndex, {
                                    caption: event.target.value,
                                  })
                                }
                                placeholder="Ex. Premier hiver à la maison familiale"
                                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                              />
                            </label>

                            <label className="mb-4 block">
                              <span className="block text-sm font-bold text-gray-600 mb-2">
                                Dates importantes
                              </span>
                              <textarea
                                value={month.importantDates}
                                onChange={(event) =>
                                  updateCalendarMonth(monthIndex, {
                                    importantDates: event.target.value,
                                  })
                                }
                                placeholder="Ex. 12 janvier : anniversaire de Mamie"
                                rows={2}
                                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                              />
                            </label>

                            <div>
                              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-bold text-gray-600">
                                  Photo du mois
                                </p>
                                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-purple-50 p-1">
                                  {calendarPhotoFitOptions.map((fitOption) => (
                                    <button
                                      key={`${monthNames[monthIndex]}-${fitOption.id}`}
                                      type="button"
                                      onClick={() =>
                                        updateCalendarMonth(monthIndex, {
                                          photoFit: fitOption.id,
                                        })
                                      }
                                      className={`rounded-xl px-3 py-2 text-left text-xs font-black ${
                                        month.photoFit === fitOption.id
                                          ? "bg-purple-600 text-white shadow-sm"
                                          : "text-purple-700"
                                      }`}
                                      title={fitOption.detail}
                                    >
                                      {fitOption.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {items.length === 0 ? (
                                <div className={`rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} bg-white p-5 text-sm font-semibold text-gray-500`}>
                                  <p>Aucune photo restaurée disponible.</p>
                                  <Link
                                    href="/upload"
                                    className="mt-3 inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-purple-700"
                                  >
                                    Restaurer une photo
                                  </Link>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {getPickerItems(items, [month.photoId]).map((item) => {
                                    const selected = month.photoId === item.id;

                                    return (
                                      <button
                                        key={`${monthNames[monthIndex]}-${item.id}`}
                                        type="button"
                                        onClick={() =>
                                          updateCalendarMonth(monthIndex, {
                                            photoId: item.id,
                                          })
                                        }
                                        className={`overflow-hidden rounded-2xl border text-left ${
                                          selected
                                            ? "border-purple-500 bg-purple-50 shadow-lg"
                                            : "border-gray-100 bg-white shadow-sm"
                                        }`}
                                      >
                                        <div className="relative h-28 overflow-hidden bg-gray-50">
                                          <img
                                            src={item.restored_url}
                                            alt={`Photo ${item.id}`}
                                            className="h-full w-full object-contain"
                                          />
                                          {!item.unlocked_at && (
                                            <span className="pointer-events-none absolute inset-x-2 top-1/2 -rotate-12 rounded-full bg-black/25 px-2 py-1 text-center text-[9px] font-black uppercase tracking-[0.12em] text-white/80">
                                              Mémoire Vivante
                                            </span>
                                          )}
                                        </div>
                                        <div className="p-3">
                                          <span className={`text-xs font-black ${selected ? "text-purple-700" : "text-gray-500"}`}>
                                            {selected ? "Choisie" : "Choisir"}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="xl:sticky xl:top-28">
                            <p className="mb-3 text-sm font-black text-gray-500">
                              Aperçu du mois au format final
                            </p>
                            <div className="overflow-x-auto pb-2">
                              {renderCalendarMonthPreview(
                                month,
                                monthIndex,
                                "w-[420px] max-w-none shrink-0"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                      <div className="grid gap-4">
                        <label className="block">
                          <span className="block text-sm font-bold text-gray-600 mb-2">
                            Légende de l’affiche
                          </span>
                          <input
                            value={calendarPosterCaption}
                            onChange={(event) =>
                              setCalendarPosterCaption(event.target.value)
                            }
                            placeholder="Ex. Une année de souvenirs en famille"
                            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                          />
                        </label>

                        <label className="block">
                          <span className="block text-sm font-bold text-gray-600 mb-2">
                            Dates importantes
                          </span>
                          <textarea
                            value={calendarPosterDates}
                            onChange={(event) => setCalendarPosterDates(event.target.value)}
                            placeholder="Ex. Anniversaires, mariage, fêtes de famille..."
                            rows={3}
                            className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
                          />
                        </label>

                        <div>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-gray-600">
                              Photos de l’affiche
                            </p>
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">
                              {calendarPosterSelectedCount}/3
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <div className={`rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} bg-white p-5 text-sm font-semibold text-gray-500`}>
                              <p>Aucune photo restaurée disponible.</p>
                              <Link
                                href="/upload"
                                className="mt-3 inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-purple-700"
                              >
                                Restaurer une photo
                              </Link>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {getPickerItems(items, calendarPosterPhotoIds).map((item) => {
                                const selected = calendarPosterPhotoIds.includes(item.id);

                                return (
                                  <button
                                    key={`poster-${item.id}`}
                                    type="button"
                                    onClick={() => toggleCalendarPosterPhoto(item.id)}
                                    className={`overflow-hidden rounded-2xl border text-left ${
                                      selected
                                        ? "border-purple-500 bg-purple-50 shadow-lg"
                                        : "border-gray-100 bg-white shadow-sm"
                                    }`}
                                  >
                                    <div className="relative h-32 overflow-hidden bg-gray-50">
                                      <img
                                        src={item.restored_url}
                                        alt={`Photo affiche ${item.id}`}
                                        className="h-full w-full object-contain"
                                      />
                                      {!item.unlocked_at && (
                                        <span className="pointer-events-none absolute inset-x-2 top-1/2 -rotate-12 rounded-full bg-black/25 px-2 py-1 text-center text-[9px] font-black uppercase tracking-[0.12em] text-white/80">
                                          Mémoire Vivante
                                        </span>
                                      )}
                                    </div>
                                    <div className="p-3">
                                      <span className={`text-xs font-black ${selected ? "text-purple-700" : "text-gray-500"}`}>
                                        {selected ? "Sélectionnée" : "Choisir"}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {calendarPosterPhotos.length > 0 && (
                          <div className="rounded-2xl bg-purple-50 p-4">
                            <p className="mb-3 text-sm font-black text-purple-700">
                              Cadrage des photos sélectionnées
                            </p>
                            <div className="grid gap-3">
                              {calendarPosterPhotos.slice(0, 3).map((photo, photoIndex) => (
                                <div
                                  key={`poster-fit-${photo.id}`}
                                  className="grid gap-3 rounded-2xl bg-white p-3 sm:grid-cols-[96px_1fr] sm:items-center"
                                >
                                  <img
                                    src={photo.restored_url}
                                    alt={`Photo affiche sélectionnée ${photoIndex + 1}`}
                                    className={`h-20 w-full rounded-xl bg-black/5 sm:w-24 ${getPhotoFitObjectClass(
                                      calendarPosterPhotoFits[photo.id] ?? "cover"
                                    )}`}
                                  />
                                  <div>
                                    <p className="mb-2 text-xs font-black text-gray-500">
                                      Photo {photoIndex + 1}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {calendarPhotoFitOptions.map((fitOption) => (
                                        <button
                                          key={`poster-fit-${photo.id}-${fitOption.id}`}
                                          type="button"
                                          onClick={() =>
                                            updateCalendarPosterPhotoFit(
                                              photo.id,
                                              fitOption.id
                                            )
                                          }
                                          className={`rounded-xl px-3 py-2 text-left text-xs font-black ${
                                            (calendarPosterPhotoFits[photo.id] ?? "cover") ===
                                            fitOption.id
                                              ? "bg-purple-600 text-white shadow-sm"
                                              : "bg-purple-50 text-purple-700"
                                          }`}
                                          title={fitOption.detail}
                                        >
                                          {fitOption.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </>
            ) : (
              <>
            <section
              id="album-cover-editor"
              className="scroll-mt-32 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60"
            >
              <p className="text-sm font-black text-purple-700 mb-2">Étape 2</p>
              <h2 className="text-2xl font-black mb-5">Composer la couverture</h2>
              {renderAlbumJumpNav("album-cover-editor")}

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_620px] 2xl:items-start">
                <div>
                  <div className="space-y-4">
                    <label className="block rounded-2xl border border-purple-200 bg-purple-50/80 p-4 shadow-sm">
                      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-purple-800">
                        <span>Titre de couverture</span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-purple-700">
                          À personnaliser
                        </span>
                      </span>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="w-full rounded-2xl border border-purple-200 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-purple-500"
                      />
                    </label>

                    <label className="block rounded-2xl border border-purple-200 bg-purple-50/80 p-4 shadow-sm">
                      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-purple-800">
                        <span>
                        Texte de couverture
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-purple-700">
                          Visible sur la couverture
                        </span>
                      </span>
                      <textarea
                        value={coverText}
                        onChange={(event) => setCoverText(event.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-purple-200 bg-white px-5 py-4 font-semibold outline-none focus:border-purple-500"
                      />
                    </label>

                    <label className="block rounded-2xl border border-purple-200 bg-purple-50/80 p-4 shadow-sm">
                      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-purple-800">
                        <span>Dédicace</span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-purple-700">
                          Texte souvenir
                        </span>
                      </span>
                      <textarea
                        value={dedication}
                        onChange={(event) => setDedication(event.target.value)}
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-purple-200 bg-white px-5 py-4 font-semibold outline-none focus:border-purple-500"
                      />
                    </label>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-sm font-bold text-gray-600">Thème de l’album</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {albumThemes.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setTheme(option.id)}
                          className={`rounded-2xl border p-3 text-left transition ${
                            selectedTheme.id === option.id
                              ? `${option.borderClass} ${option.previewClass} ${option.textClass}`
                              : "border-gray-100 bg-white text-gray-600"
                          }`}
                        >
                          <span className={`mb-3 block h-16 rounded-xl border ${option.coverBorderClass} ${option.coverClass}`} />
                          <span className="block font-black">{option.label}</span>
                          <span className="block text-sm font-semibold">{option.detail}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {coverPhoto && (
                    <div className="mt-6 rounded-2xl bg-purple-50 p-4">
                      <p className="mb-3 text-sm font-black text-purple-700">
                        Cadrage de la photo de couverture
                      </p>
                      <div className="grid gap-3 rounded-2xl bg-white p-3 sm:grid-cols-[96px_1fr] sm:items-center">
                        <img
                          src={coverPhoto.restored_url}
                          alt="Photo de couverture sélectionnée"
                          className={`h-20 w-full rounded-xl bg-black/5 sm:w-24 ${getPhotoFitObjectClass(coverPhotoFit)}`}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          {calendarPhotoFitOptions.map((fitOption) => (
                            <button
                              key={`cover-${fitOption.id}`}
                              type="button"
                              onClick={() => setCoverPhotoFit(fitOption.id)}
                              className={`rounded-xl px-3 py-2 text-left text-xs font-black ${
                                coverPhotoFit === fitOption.id
                                  ? "bg-purple-600 text-white shadow-sm"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                              title={fitOption.detail}
                            >
                              {fitOption.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

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
                      <div className={`rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} bg-white p-5 text-sm font-semibold text-gray-500`}>
                        <p>Ajoutez une photo restaurée pour l’utiliser en couverture.</p>
                        <Link
                          href="/upload"
                          className="mt-3 inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-purple-700"
                        >
                          Restaurer une photo
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {getPickerItems(items, [coverPhotoId]).map((item) => {
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
                                {!item.unlocked_at && (
                                  <span className="pointer-events-none absolute inset-x-2 top-1/2 -rotate-12 rounded-full bg-black/25 px-2 py-1 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                                    Mémoire Vivante
                                  </span>
                                )}
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
                </div>

                <div className="xl:sticky xl:top-28">
                  <p className="mb-3 text-sm font-black text-gray-500">
                    Aperçu de la couverture au format final
                  </p>
                  <div className="overflow-x-auto pb-2">
                    {renderCoverPreview("w-[560px] max-w-none shrink-0")}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60">
              <p className="text-sm font-black text-purple-700 mb-2">Étape 3</p>
              <div className="mb-5">
                <div>
                  <h2 className="text-2xl font-black">Composer les pages intérieures</h2>
                  <p className="text-gray-600">
                    La page 1 apparaît à droite. À gauche, c’est le verso de la couverture.
                  </p>
                </div>
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
                {pages.map((page, pageIndex) => {
                  const pageSlots = normalizePagePhotoIds(page);
                  const selectedPagePhotoIds = getSelectedPagePhotoIds(page);
                  const activeSlotIndex = getActiveSlotIndex(page);
                  const availableItems = getPickerItems(
                    items.filter((item) => {
                      const usage = photoUsage.get(item.id);
                      return !usage || usage.pageIndex === pageIndex;
                    }),
                    pageSlots
                  );

                  return (
                  <div
                    key={page.id}
                    id={`album-page-editor-${page.id}`}
                    className="scroll-mt-32 rounded-[1.5rem] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-purple-700">Page {pageIndex + 1}</p>
                        <h3 className="text-xl font-black">
                          {pageIndex === 0
                            ? "Première page intérieure, à droite"
                            : "Page intérieure"}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => addPageAfter(pageIndex)}
                          className="rounded-2xl bg-black px-4 py-2 text-sm font-black text-white"
                        >
                          Ajouter une page
                        </button>
                        <button
                          type="button"
                          onClick={() => removePage(pageIndex)}
                          disabled={pages.length === 1}
                          className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 disabled:opacity-40"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    {renderAlbumJumpNav(`album-page-editor-${page.id}`)}

                    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_620px] 2xl:items-start">
                      <div>
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

                        <div className="mb-5">
                          <div className="mb-3 flex flex-col gap-1">
                            <p className="text-sm font-bold text-gray-600">Mise en page</p>
                            <p className="text-xs font-semibold text-gray-400">
                              Avec {page.photosPerPage} photo{page.photosPerPage > 1 ? "s" : ""}, le mode Auto propose : {getAutoLayoutLabel(page.photosPerPage)}.
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {(() => {
                              const visibleLayout =
                                isPageLayoutAvailable(page.layout, page.photosPerPage)
                                  ? page.layout
                                  : "auto";

                              return pageLayoutOptions
                              .filter((option) =>
                                isPageLayoutAvailable(option.id, page.photosPerPage)
                              )
                              .map((option) => (
                              <button
                                key={`${page.id}-layout-${option.id}`}
                                type="button"
                                onClick={() => updatePageLayout(pageIndex, option.id)}
                                className={`min-h-[76px] rounded-2xl border px-4 py-3 text-left ${
                                  visibleLayout === option.id
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-gray-100 bg-white text-gray-600"
                                }`}
                              >
                                <span className="block whitespace-nowrap text-sm font-black">{option.label}</span>
                                <span className="mt-1 block text-xs font-semibold">{option.detail}</span>
                              </button>
                              ));
                            })()}
                          </div>
                        </div>

                        <label className="mb-5 block rounded-2xl border border-purple-200 bg-purple-50/80 p-4 shadow-sm">
                          <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-purple-800">
                            <span>Texte ou anecdote de la page</span>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-purple-700">
                              Visible sous les photos
                            </span>
                          </span>
                          <textarea
                            value={page.note}
                            onChange={(event) => updatePage(pageIndex, { note: event.target.value })}
                            placeholder="Ex. Été 1968, vacances en famille à Biarritz."
                            rows={2}
                            className="w-full resize-none rounded-2xl border border-purple-200 bg-white px-5 py-4 font-semibold outline-none focus:border-purple-500"
                          />
                        </label>

                        <div className="mb-5 rounded-2xl bg-purple-50 p-4">
                          <div className="mb-3 flex flex-col gap-1">
                            <p className="text-sm font-black text-purple-700">
                              Emplacements et cadrage
                            </p>
                            <p className="text-xs font-semibold text-purple-700/70">
                              Choisissez l’emplacement à modifier, puis sélectionnez une photo ci-dessous.
                            </p>
                          </div>
                            <div className="grid gap-3">
                              {pageSlots.map((photoId, slotIndex) => {
                                const selectedPhoto =
                                  typeof photoId === "number"
                                    ? getPhotoById(items, photoId)
                                    : null;
                                const isActiveSlot = activeSlotIndex === slotIndex;

                                return (
                                  <div
                                    key={`${page.id}-slot-${slotIndex}`}
                                    className={`grid gap-3 rounded-2xl border bg-white p-3 sm:grid-cols-[96px_1fr] sm:items-center ${
                                      isActiveSlot
                                        ? "border-purple-400 shadow-sm"
                                        : "border-transparent"
                                    }`}
                                  >
                                    {selectedPhoto ? (
                                      <img
                                        src={selectedPhoto.restored_url}
                                        alt={`Photo ${slotIndex + 1}`}
                                        className={`h-20 w-full rounded-xl bg-black/5 sm:w-24 ${getPhotoFitObjectClass(page.photoFits[selectedPhoto.id] ?? "cover")}`}
                                      />
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActivePageSlots((current) => ({
                                            ...current,
                                            [page.id]: slotIndex,
                                          }))
                                        }
                                        className={`flex h-20 w-full items-center justify-center rounded-xl border-2 border-dashed text-xs font-black sm:w-24 ${
                                          isActiveSlot
                                            ? "border-purple-400 bg-purple-50 text-purple-700"
                                            : "border-gray-200 bg-white text-gray-400"
                                        }`}
                                      >
                                        Vide
                                      </button>
                                    )}
                                    <div>
                                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-black text-gray-500">
                                          Photo {slotIndex + 1}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setActivePageSlots((current) => ({
                                                ...current,
                                                [page.id]: slotIndex,
                                              }))
                                            }
                                            className={`rounded-full px-3 py-1 text-[11px] font-black ${
                                              isActiveSlot
                                                ? "bg-purple-600 text-white"
                                                : "bg-purple-50 text-purple-700"
                                            }`}
                                          >
                                            {selectedPhoto ? "Remplacer" : "Choisir"}
                                          </button>
                                          {selectedPhoto && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setPhotoOnPageSlot(pageIndex, slotIndex, null)
                                              }
                                              className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-600"
                                            >
                                              Retirer
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {selectedPhoto ? (
                                        <div className="grid grid-cols-3 gap-2">
                                          {calendarPhotoFitOptions.map((fitOption) => (
                                            <button
                                              key={`${page.id}-${selectedPhoto.id}-${fitOption.id}`}
                                              type="button"
                                              onClick={() =>
                                                updatePagePhotoFit(
                                                  pageIndex,
                                                  selectedPhoto.id,
                                                  fitOption.id
                                                )
                                              }
                                              className={`rounded-xl px-3 py-2 text-left text-xs font-black ${
                                                (page.photoFits[selectedPhoto.id] ?? "cover") === fitOption.id
                                                  ? "bg-purple-600 text-white shadow-sm"
                                                  : "bg-purple-50 text-purple-700"
                                              }`}
                                              title={fitOption.detail}
                                            >
                                              {fitOption.label}
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700">
                                          Sélectionnez cet emplacement puis cliquez sur une photo.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-gray-600">
                                Choisir une photo pour l’emplacement {activeSlotIndex + 1}
                              </p>
                              <p className="text-xs font-semibold text-gray-400">
                                Les photos déjà utilisées sur d’autres pages sont masquées pour éviter les doublons.
                              </p>
                            </div>
                            <span className="text-sm font-black text-gray-400">
                              {selectedPagePhotoIds.length}/{page.photosPerPage}
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <div className={`rounded-2xl border-2 border-dashed ${selectedTheme.borderClass} bg-white p-5 text-sm font-semibold text-gray-500`}>
                              <p>Aucune photo restaurée disponible.</p>
                              <Link
                                href="/upload"
                                className="mt-3 inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-purple-700"
                              >
                                Restaurer une photo
                              </Link>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {availableItems.map((item) => {
                                const selectedSlotIndex = pageSlots.indexOf(item.id);
                                const selected = selectedSlotIndex >= 0;

                                return (
                                  <button
                                    key={`${page.id}-${item.id}`}
                                    type="button"
                                    onClick={() =>
                                      setPhotoOnPageSlot(pageIndex, activeSlotIndex, item.id)
                                    }
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
                                      {!item.unlocked_at && (
                                        <span className="pointer-events-none absolute inset-x-2 top-1/2 -rotate-12 rounded-full bg-black/25 px-2 py-1 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                                          Mémoire Vivante
                                        </span>
                                      )}
                                    </div>
                                    <div className="p-3">
                                      <span className={`text-xs font-black ${selected ? "text-purple-700" : "text-gray-500"}`}>
                                        {selected
                                          ? `Photo ${selectedSlotIndex + 1}`
                                          : `Choisir pour photo ${activeSlotIndex + 1}`}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="2xl:sticky 2xl:top-28">
                        <p className="mb-3 text-sm font-black text-gray-500">
                          Aperçu de la page au format final
                        </p>
                        <div className="overflow-x-auto pb-2">
                          {renderPagePreview(
                            page,
                            pageIndex,
                            "w-[560px] max-w-none shrink-0"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-white/60 bg-[#efe8dd] p-5 sm:p-7 shadow-2xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[#7d6245]">Aperçu réaliste</p>
                  <p className="text-xs font-bold text-[#9a8065]">
                    {albumType === "calendar"
                      ? `${selectedAlbumType.label} · ${selectedCalendarProduct.label}`
                      : `${selectedAlbumType.label} · couverture + pages`}
                  </p>
                </div>
                <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black text-[#7d6245]">
                  {previewPhotoCount} photo(s)
                </span>
              </div>

              {albumType === "calendar" ? (
                <div className="rounded-[1.5rem] bg-[#f6efe4] p-4 sm:p-6 shadow-inner">
                  <div className="mb-5 rounded-2xl bg-white/80 p-5 shadow-sm">
                    <p className={`text-sm font-black ${selectedCalendarTheme.accentClass}`}>
                      Album calendrier
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-gray-950">
                      {title || "Calendrier familial"}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      {calendarYear} · {selectedCalendarProduct.label} · {selectedCalendarTheme.label}
                    </p>
                  </div>

                  {calendarProduct === "monthly" ? (
                    <div className="max-h-[780px] space-y-5 overflow-auto pr-1">
                      {calendarMonths.map((month, monthIndex) => (
                        <div key={`preview-${monthNames[monthIndex]}`}>
                          {renderCalendarMonthPreview(
                            month,
                            monthIndex,
                            "mx-auto w-[420px] max-w-none shrink-0"
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {calendarProduct === "posterLandscape" && (
                        <p className="mb-3 rounded-2xl bg-white/70 px-4 py-2 text-xs font-black text-[#7d6245]">
                          Aperçu horizontal : faites défiler latéralement si nécessaire.
                        </p>
                      )}
                      <div className="max-h-[820px] overflow-auto pr-1">
                        {renderCalendarPosterPreview("screen")}
                      </div>
                    </>
                  )}

                  <div className="mt-8 grid gap-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="font-black">Prêt pour l’export ?</p>
                      <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-600">
                        <p>{selectedCalendarProduct.label}</p>
                        {calendarProduct === "monthly" ? (
                          <>
                            <p>{configuredCalendarMonths}/12 mois configurés</p>
                            <p>
                              {calendarMonths.filter((month) => month.photoId).length}/12 photo(s) choisie(s)
                            </p>
                          </>
                        ) : (
                          <p>{calendarPosterSelectedCount}/3 photo(s) choisie(s)</p>
                        )}
                        <p>Export PDF disponible via l’impression du navigateur.</p>
                        <p>Pack PNG : images prêtes à importer chez un imprimeur.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="font-black">Crédits nécessaires</p>
                      <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-600">
                        <p>
                          {calendarProduct === "monthly"
                            ? "1 crédit par photo mensuelle débloquée sans filigrane."
                            : "Le pack Découverte couvre ce calendrier 3 photos."}
                        </p>
                        <p>
                          Achetez des crédits supplémentaires si vous souhaitez
                          débloquer plus de photos ou préparer plusieurs albums.
                        </p>
                      </div>
                      <Link
                        href="/#tarifs"
                        className="mt-4 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                      >
                        Voir les packs
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={printCurrentAlbum}
                      disabled={!canExportProject}
                      className="rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                    >
                      Exporter le calendrier en PDF
                    </button>
                    <button
                      type="button"
                      onClick={exportImagePack}
                      disabled={exportingImages || !canExportProject}
                      className="rounded-2xl bg-purple-600 px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                    >
                      {exportingImages ? "Préparation du ZIP..." : "Télécharger le pack PNG"}
                    </button>
                    {!canExportProject && (
                      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900">
                        {exportBlockReason}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
              <div className={`rounded-[1.5rem] ${selectedTheme.previewClass} p-4 sm:p-6 shadow-inner`}>
                <div className="overflow-x-auto pb-2">
                  {renderCoverPreview("mx-auto w-[560px] max-w-none shrink-0")}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/75 p-3">
                    <p className="text-xs font-bold text-gray-500">Type</p>
                    <p className="text-lg font-black">{selectedAlbumType.label}</p>
                  </div>
                  <div className="rounded-2xl bg-white/75 p-3">
                    <p className="text-xs font-bold text-gray-500">Pages</p>
                    <p className="text-xl font-black">{pages.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/75 p-3">
                    <p className="text-xs font-bold text-gray-500">Format</p>
                    <p className="text-xl font-black">{selectedFormat.label}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.25rem] bg-white/65 p-4 shadow-inner">
                  <div className={`mb-4 rounded-2xl ${selectedTheme.pageClass} p-4 shadow-sm`}>
                    <p className={`mb-2 text-xs font-black ${selectedTheme.textClass}`}>
                      Verso de couverture
                    </p>
                    <p className={`text-sm leading-relaxed ${selectedTheme.coverTextClass}`}>
                      Page laissée libre pour respecter les contraintes d’impression.
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
                        className={`relative rounded-[1.25rem] ${selectedTheme.spreadClass} p-3 shadow-[0_18px_35px_rgba(75,52,28,0.12)]`}
                      >
                        <div className="absolute inset-y-4 left-1/2 z-10 w-px bg-gradient-to-b from-transparent via-black/20 to-transparent" />
                        <div className="grid grid-cols-2 gap-3">
                          {spread.map((slot, slotIndex) => {
                            if (slot.kind === "verso") {
                              return (
                                <div
                                  key={`verso-${spreadIndex}-${slotIndex}`}
                                  className={`min-h-[260px] rounded-2xl ${selectedTheme.pageClass} p-4 shadow-inner`}
                                >
                                  <p className="mb-3 text-xs font-black text-gray-400">
                                    Verso couverture
                                  </p>
                                  <div className={`flex h-[210px] items-center justify-center rounded-xl border-2 border-dashed ${selectedTheme.borderClass} px-4 text-center text-xs font-semibold leading-relaxed ${selectedTheme.coverTextClass}`}>
                                    Page volontairement libre
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
                            <div className={`min-h-[260px] rounded-2xl ${selectedTheme.pageClass} p-3 shadow-inner`}>
                              <div className="mb-2 flex items-center justify-between text-xs font-black text-gray-300">
                                <span>Page suivante</span>
                                <span>libre</span>
                              </div>
                              <div className={`flex h-[210px] items-center justify-center rounded-xl border-2 border-dashed ${selectedTheme.borderClass} px-4 text-center text-xs font-semibold leading-relaxed ${selectedTheme.coverTextClass}`}>
                                Espace disponible pour une photo ou une anecdote.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="mt-8 grid gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="font-black">Prêt pour l’export ?</p>
                    <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-600">
                      <p>
                        {coverPhoto ? "OK" : "À compléter"} · Photo de couverture
                      </p>
                      <p>
                        {totalSelectedPhotos > 0 ? "OK" : "À compléter"} · Photos intérieures
                      </p>
                      <p>
                        {emptyPagesCount === 0 ? "OK" : "À vérifier"} · {emptyPagesCount} page(s) vide(s)
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="font-black">Crédits nécessaires</p>
                    <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-600">
                      <p>
                        Le pack Album famille débloque 25 photos sans
                        filigrane, adapté à un album carré 24 pages.
                      </p>
                      <p>
                        Pour un album plus complet, le pack Grande mémoire
                        permet de monter jusqu’à 60 photos.
                      </p>
                    </div>
                    <Link
                      href="/#tarifs"
                      className="mt-4 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                    >
                      Voir les packs
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={printCurrentAlbum}
                    disabled={!canExportProject}
                    className="rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                  >
                    Exporter le PDF
                  </button>
                  <button
                    type="button"
                    onClick={exportImagePack}
                    disabled={exportingImages || !canExportProject}
                    className="rounded-2xl bg-purple-600 px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                  >
                    {exportingImages ? "Préparation du ZIP..." : "Télécharger le pack PNG"}
                  </button>
                  {!canExportProject && (
                    <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900">
                      {exportBlockReason}
                    </p>
                  )}
                  <p className="text-center text-sm font-semibold text-gray-500">
                    Le pack PNG contient la couverture avant et les pages intérieures, prêtes à importer chez un imprimeur.
                  </p>
                </div>
              </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <div className="pdf-print-area">
        {albumType === "calendar" ? (
          <div className="mx-auto grid justify-items-center gap-8">
            {calendarProduct === "monthly" ? (
              calendarMonths.map((month, monthIndex) => (
                <div key={`pdf-month-${monthNames[monthIndex]}`} className="pdf-page pdf-page-calendar-month">
                  {renderCalendarMonthPreview(
                    month,
                    monthIndex,
                    "pdf-calendar-month mx-auto w-[420px] max-w-none shrink-0"
                  )}
                </div>
              ))
            ) : (
              <div
                className={`pdf-page ${
                  calendarProduct === "posterLandscape"
                    ? "pdf-page-poster-landscape"
                    : "pdf-page-poster-portrait"
                }`}
              >
                <div className="pdf-calendar-poster">
                  {renderCalendarPosterPreview(
                    calendarProduct === "posterPortrait" ? "screen" : "export"
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto grid justify-items-center gap-8">
            <div className={`pdf-page pdf-page-album ${getAlbumPdfPageClass()}`}>
              {renderCoverPreview(getAlbumPdfPreviewClass())}
            </div>

            {pages.map((page, pageIndex) => (
              <div
                key={`pdf-page-${page.id}`}
                className={`pdf-page pdf-page-album ${getAlbumPdfPageClass()}`}
              >
                {renderPagePreview(
                  page,
                  pageIndex,
                  getAlbumPdfPreviewClass()
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {renderingImageExport && (
        <div ref={imageExportRef} className="image-export-area" aria-hidden="true">
          {albumType === "calendar" ? (
            <div className="grid gap-8">
              {calendarProduct === "monthly" ? (
                calendarMonths.map((month, monthIndex) => (
                  <div
                    key={`export-month-${monthNames[monthIndex]}`}
                    data-export-name={`${String(monthIndex + 1).padStart(2, "0")}-${slugifyFilePart(monthNames[monthIndex])}-${calendarYear}.png`}
                  >
                    {renderCalendarMonthPreview(
                      month,
                      monthIndex,
                      "mx-auto w-[640px] max-w-none shrink-0"
                    )}
                  </div>
                ))
              ) : (
                <div
                  data-export-name={`calendrier-${calendarYear}-${slugifyFilePart(selectedCalendarProduct.label)}.png`}
                >
                  {renderCalendarPosterPreview()}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-8">
              <div data-export-name="01-couverture-avant.png">
                {renderCoverPreview(getAlbumImageExportPreviewClass(), true)}
              </div>

              {pages.map((page, pageIndex) => (
                <div
                  key={`export-page-${page.id}`}
                  data-export-name={`${String(pageIndex + 2).padStart(2, "0")}-page-${pageIndex + 1}-${getSelectedPagePhotoIds(page).length}-sur-${page.photosPerPage}-photos.png`}
                >
                  {renderPagePreview(
                    page,
                    pageIndex,
                    getAlbumImageExportPageClass(),
                    true
                  )}
                </div>
              ))}

            </div>
          )}
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
