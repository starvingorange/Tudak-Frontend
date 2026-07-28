export type CategorySlug =
  | "시사"
  | "연애"
  | "사회"
  | "스포츠"
  | "게임"
  | "문화"
  | "과학기술"
  | "학교";

interface CategoryMeta {
  /** CSS var driving CategoryBadge's solid background (src/tokens/colors.css) */
  colorVar: string;
  /** Tint used for filter-tab icons and seat-picker highlight badges */
  tint: string;
}

export const CATEGORIES: Record<CategorySlug, CategoryMeta> = {
  시사: { colorVar: "var(--cat-sisa)", tint: "#f6f2fe" },
  연애: { colorVar: "var(--cat-yeonae)", tint: "#fdeef1" },
  사회: { colorVar: "var(--cat-sahoe)", tint: "#e9f8f5" },
  스포츠: { colorVar: "var(--cat-sports)", tint: "#eafbf0" },
  게임: { colorVar: "var(--cat-game)", tint: "#fef3e3" },
  문화: { colorVar: "var(--cat-munhwa)", tint: "#f3eefe" },
  과학기술: { colorVar: "var(--cat-tech)", tint: "#eaf2fe" },
  학교: { colorVar: "var(--cat-tech)", tint: "#eaf2fe" },
};

export const CATEGORY_FILTERS: CategorySlug[] = [
  "시사",
  "연애",
  "사회",
  "스포츠",
  "게임",
  "문화",
  "과학기술",
];

/**
 * Candidate order for the debates/votes list filter bars, widest-priority
 * first. CategoryTabBar shows as many of these as fit in one row and folds
 * whatever doesn't fit into a "기타" overflow menu — see that component.
 */
export const LIST_FILTER_CATEGORIES: CategorySlug[] = [
  "시사",
  "연애",
  "사회",
  "스포츠",
  "게임",
  "문화",
  "과학기술",
];

export type ListFilter = "전체" | CategorySlug;

export function matchesListFilter(
  category: CategorySlug,
  filter: ListFilter,
): boolean {
  return filter === "전체" || category === filter;
}
