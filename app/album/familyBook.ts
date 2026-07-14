export type BookFormat = "square" | "square-xl";

export type RenderMode = "editor" | "preview" | "print" | "flipbook" | "video";

export type BookPhotoPlacement = {
  fit: "cover" | "contain" | "top";
  id: number;
  slotIndex: number;
};

export type BookPage = {
  id: string;
  type:
    | "cover"
    | "inside-cover"
    | "title-page"
    | "chapter"
    | "photo-full"
    | "photo-story"
    | "two-photos"
    | "mosaic"
    | "quote"
    | "before-after"
    | "closing-page"
    | "back-cover";
  layoutId: string;
  photos: BookPhotoPlacement[];
  title?: string;
  subtitle?: string;
  body?: string;
  caption?: string;
  date?: string;
  place?: string;
  quote?: string;
  hidden?: boolean;
};

export type FamilyBook = {
  id: string;
  ownerId: string;
  title: string;
  subtitle?: string;
  familyName?: string;
  period?: string;
  place?: string;
  dedication?: string;
  openingQuote?: string;
  backCoverText?: string;
  collectionId: string;
  coverTemplateId: string;
  typographyId: string;
  photoStyleId: string;
  decorationId: string;
  format: BookFormat;
  pages: BookPage[];
  createdAt: string;
  updatedAt: string;
};

type LegacyAlbumPage = {
  id?: string;
  layout?: string;
  note?: string;
  photoIds?: Array<number | null>;
  photoFits?: Record<number, "cover" | "contain" | "top">;
  photosPerPage?: number;
};

type LegacyAlbumConfig = {
  albumOrnament?: string;
  albumPhotoStyle?: string;
  albumTypography?: string;
  coverText?: string;
  dedication?: string;
  format?: string;
  pages?: LegacyAlbumPage[];
  theme?: string;
  title?: string;
};

function getBookPageType(page: LegacyAlbumPage): BookPage["type"] {
  const photoCount = (page.photoIds ?? []).filter((photoId) => typeof photoId === "number").length;

  if (photoCount <= 1) return "photo-full";
  if (photoCount === 2) return page.layout === "story" ? "photo-story" : "two-photos";

  return "mosaic";
}

export function normalizeFamilyBook(input: {
  config?: LegacyAlbumConfig | null;
  createdAt?: string | null;
  id?: string | null;
  ownerId?: string | null;
  updatedAt?: string | null;
}): FamilyBook {
  const config = input.config ?? {};
  const now = new Date().toISOString();

  return {
    id: input.id ?? "draft-family-book",
    ownerId: input.ownerId ?? "",
    title: config.title?.trim() || "Notre album souvenir",
    subtitle: config.coverText,
    dedication: config.dedication,
    backCoverText: config.dedication,
    collectionId: config.theme ?? "heritage",
    coverTemplateId: "classic-centered",
    typographyId: config.albumTypography ?? "timeless",
    photoStyleId: config.albumPhotoStyle ?? "print",
    decorationId: config.albumOrnament ?? "fine",
    format: config.format === "square-xl" ? "square-xl" : "square",
    pages: (config.pages ?? []).map((page, pageIndex) => ({
      id: page.id ?? `page-${pageIndex + 1}`,
      type: getBookPageType(page),
      layoutId: page.layout ?? "auto",
      photos: (page.photoIds ?? []).flatMap((photoId, slotIndex) =>
        typeof photoId === "number"
          ? [
              {
                fit: page.photoFits?.[photoId] ?? "cover",
                id: photoId,
                slotIndex,
              },
            ]
          : []
      ),
      body: page.note,
      caption: page.note,
    })),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}
