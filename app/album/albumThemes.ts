export type AlbumThemeId = "heritage" | "atelier" | "contemporary";

export type AlbumTheme = {
  id: AlbumThemeId;
  label: string;
  name: string;
  detail: string;
  description: string;
  colors: {
    pageBackground: string;
    spreadBackground: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    border: string;
    muted: string;
  };
  typography: {
    titleFont: string;
    bodyFont: string;
    captionFont: string;
    titleClass: string;
    bodyClass: string;
    captionClass: string;
    titleWeight: number;
    bodyWeight: number;
    letterSpacing?: string;
    titleTransform?: "none" | "uppercase";
  };
  texture: {
    type: "none" | "paper" | "grain" | "linen";
    opacity: number;
    overlayClass: string;
  };
  photoStyle: {
    borderRadius: string;
    borderWidth: string;
    borderColor: string;
    shadow: string;
    rotation?: number;
    frameBackground?: string;
  };
  decorations: {
    dividerStyle: "none" | "fine-line" | "botanical" | "geometric";
    dividerClass: string;
    cornerClass: string;
    cornerOrnament?: "none" | "botanical" | "tape" | "line";
    botanicalElement?: "none" | "olive" | "lavender" | "eucalyptus";
  };
  pageNumbers: {
    visible: boolean;
    position: "none" | "bottom-center" | "bottom-outside";
    style: "none" | "classic" | "minimal";
  };
  coverTemplates: string[];
  pageTemplates: string[];
  previewClass: string;
  textClass: string;
  borderClass: string;
  coverClass: string;
  coverBorderClass: string;
  coverTitleClass: string;
  coverTextClass: string;
  pageClass: string;
  spreadClass: string;
  noteClass: string;
  photoFrameClass: string;
};

export const albumThemes: AlbumTheme[] = [
  {
    id: "heritage",
    label: "Héritage",
    name: "Collection Héritage",
    detail: "Ivoire, dorure légère, intemporel",
    description: "Un livre intemporel à transmettre.",
    colors: {
      pageBackground: "#fffaf1",
      spreadBackground: "#d8c8b7",
      textPrimary: "#2f241a",
      textSecondary: "#6f5b45",
      accent: "#b89453",
      border: "#dcc9a8",
      muted: "#f4eadb",
    },
    typography: {
      titleFont: "serif",
      bodyFont: "sans",
      captionFont: "serif",
      titleClass: "font-serif tracking-[0.01em]",
      bodyClass: "font-sans",
      captionClass: "font-serif italic",
      titleWeight: 700,
      bodyWeight: 600,
      letterSpacing: "0",
      titleTransform: "none",
    },
    texture: {
      type: "paper",
      opacity: 0.08,
      overlayClass:
        "opacity-[0.16] [background-image:radial-gradient(rgba(90,64,30,0.12)_0.6px,transparent_0.6px)] [background-size:7px_7px]",
    },
    photoStyle: {
      borderRadius: "0.75rem",
      borderWidth: "6px",
      borderColor: "#ffffff",
      shadow: "shadow-md",
      frameBackground: "#ffffff",
    },
    decorations: {
      dividerStyle: "fine-line",
      dividerClass: "bg-[#b89453]/55",
      cornerClass:
        "border-[#b89453]/45 after:absolute after:right-2 after:top-2 after:h-5 after:w-5 after:rounded-full after:border after:border-[#b89453]/35",
      cornerOrnament: "botanical",
      botanicalElement: "olive",
    },
    pageNumbers: {
      visible: false,
      position: "none",
      style: "none",
    },
    coverTemplates: ["classic-centered"],
    pageTemplates: ["full", "story", "duo", "memory", "triptych", "mosaic"],
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
    name: "Collection Atelier",
    detail: "Carnet de voyage, papier chaud",
    description: "Le charme d’un carnet de souvenirs.",
    colors: {
      pageBackground: "#fff7ea",
      spreadBackground: "#d4b996",
      textPrimary: "#382719",
      textSecondary: "#795a3e",
      accent: "#7f8a5f",
      border: "#dfc5a5",
      muted: "#f2e4d0",
    },
    typography: {
      titleFont: "serif",
      bodyFont: "sans",
      captionFont: "sans",
      titleClass: "font-serif tracking-[0.005em]",
      bodyClass: "font-sans",
      captionClass: "font-sans",
      titleWeight: 700,
      bodyWeight: 600,
      letterSpacing: "0",
      titleTransform: "none",
    },
    texture: {
      type: "paper",
      opacity: 0.12,
      overlayClass:
        "opacity-[0.18] [background-image:linear-gradient(0deg,rgba(120,82,45,0.11)_1px,transparent_1px),radial-gradient(rgba(120,82,45,0.10)_0.7px,transparent_0.7px)] [background-size:100%_22px,9px_9px]",
    },
    photoStyle: {
      borderRadius: "0.75rem",
      borderWidth: "6px",
      borderColor: "#fffaf2",
      shadow: "shadow-md",
      rotation: -0.5,
      frameBackground: "#fffaf2",
    },
    decorations: {
      dividerStyle: "botanical",
      dividerClass: "bg-[#7f8a5f]/45",
      cornerClass:
        "border-[#b98a57]/35 before:absolute before:-left-1 before:top-4 before:h-3 before:w-10 before:-rotate-6 before:bg-[#d7bf91]/70",
      cornerOrnament: "tape",
      botanicalElement: "eucalyptus",
    },
    pageNumbers: {
      visible: false,
      position: "none",
      style: "none",
    },
    coverTemplates: ["classic-centered"],
    pageTemplates: ["full", "story", "duo", "memory", "triptych", "mosaic"],
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
    name: "Collection Contemporaine",
    detail: "Blanc, minimaliste, photos larges",
    description: "L’élégance du minimalisme.",
    colors: {
      pageBackground: "#ffffff",
      spreadBackground: "#e8ebf2",
      textPrimary: "#111827",
      textSecondary: "#4b5563",
      accent: "#4f46e5",
      border: "#d9ddf2",
      muted: "#f6f7fb",
    },
    typography: {
      titleFont: "sans",
      bodyFont: "sans",
      captionFont: "sans",
      titleClass: "font-sans tracking-0",
      bodyClass: "font-sans",
      captionClass: "font-sans",
      titleWeight: 800,
      bodyWeight: 600,
      letterSpacing: "0",
      titleTransform: "none",
    },
    texture: {
      type: "none",
      opacity: 0,
      overlayClass: "",
    },
    photoStyle: {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      borderColor: "#edf0f7",
      shadow: "shadow-sm",
      frameBackground: "#ffffff",
    },
    decorations: {
      dividerStyle: "geometric",
      dividerClass: "bg-[#4f46e5]/30",
      cornerClass:
        "border-[#4f46e5]/25 before:absolute before:right-2 before:top-2 before:h-px before:w-8 before:bg-[#4f46e5]/35",
      cornerOrnament: "line",
      botanicalElement: "none",
    },
    pageNumbers: {
      visible: false,
      position: "none",
      style: "none",
    },
    coverTemplates: ["classic-centered"],
    pageTemplates: ["full", "story", "duo", "memory", "triptych", "mosaic"],
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

export function normalizeAlbumThemeId(themeId: string): AlbumThemeId {
  if (themeId === "classic" || themeId === "vintage") return "atelier";
  if (themeId === "gift" || themeId === "prune") return "contemporary";
  if (themeId === "ivoire") return "heritage";

  return albumThemes.some((albumTheme) => albumTheme.id === themeId)
    ? (themeId as AlbumThemeId)
    : "heritage";
}
