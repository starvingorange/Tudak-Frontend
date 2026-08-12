export type CategorySlug =
  | "시사"
  | "연애"
  | "스포츠"
  | "게임"
  | "문화"
  | "기타";

interface CategoryMeta {
  /** CSS var driving CategoryBadge's solid background (src/tokens/colors.css) */
  colorVar: string;
  /** Tint used for filter-tab icons and seat-picker highlight badges */
  tint: string;
}

// Mirrors the backend's CreateDebateRequestCategory / DebateListResponseCategory
// enum (ISSUE / LOVE / SPORTS / GAME / CULTURE_TECH / OTHERS) 1:1 — see
// src/api/debate/types/CreateDebateRequestCategory.ts.
export const CATEGORIES: Record<CategorySlug, CategoryMeta> = {
  시사: { colorVar: "var(--cat-sisa)", tint: "#f6f2fe" },
  연애: { colorVar: "var(--cat-yeonae)", tint: "#fdeef1" },
  스포츠: { colorVar: "var(--cat-sports)", tint: "#eafbf0" },
  게임: { colorVar: "var(--cat-game)", tint: "#fef3e3" },
  문화: { colorVar: "var(--cat-munhwa)", tint: "#f3eefe" },
  기타: { colorVar: "var(--cat-tech)", tint: "#eaf2fe" },
};

export const CATEGORY_FILTERS: CategorySlug[] = [
  "시사",
  "연애",
  "스포츠",
  "게임",
  "문화",
  "기타",
];

/**
 * Candidate order for the debates/votes list filter bars, widest-priority
 * first. CategoryTabBar shows as many of these as fit in one row and folds
 * whatever doesn't fit into a "기타" overflow menu — see that component.
 */
export const LIST_FILTER_CATEGORIES: CategorySlug[] = [
  "시사",
  "연애",
  "스포츠",
  "게임",
  "문화",
  "기타",
];

export type ListFilter = "전체" | CategorySlug;

export function matchesListFilter(
  category: CategorySlug,
  filter: ListFilter,
): boolean {
  return filter === "전체" || category === filter;
}

// Mirrors the backend's category enum 1:1 (ISSUE / LOVE / SPORTS / GAME /
// CULTURE_TECH / OTHERS — see e.g. src/api/debate/types/
// CreateDebateRequestCategory.ts and DebateDetailResponseCategory.ts, which
// are structurally identical). Kept as plain string literals here instead
// of importing a generated enum, since this module has no reason to depend
// on one specific endpoint's types.
export type BackendCategory =
  | "ISSUE"
  | "LOVE"
  | "SPORTS"
  | "GAME"
  | "CULTURE_TECH"
  | "OTHERS";

export const CATEGORY_TO_BACKEND: Record<CategorySlug, BackendCategory> = {
  시사: "ISSUE",
  연애: "LOVE",
  스포츠: "SPORTS",
  게임: "GAME",
  문화: "CULTURE_TECH",
  기타: "OTHERS",
};

export const BACKEND_TO_CATEGORY: Record<BackendCategory, CategorySlug> = {
  ISSUE: "시사",
  LOVE: "연애",
  SPORTS: "스포츠",
  GAME: "게임",
  CULTURE_TECH: "문화",
  OTHERS: "기타",
};
