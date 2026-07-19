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

/** Tab set shared by the debates and votes list filter bars. */
export const LIST_FILTER_TABS = [
  "전체",
  "시사",
  "연애",
  "사회",
  "학교",
  "기타",
] as const;
export type ListFilterTab = (typeof LIST_FILTER_TABS)[number];

/** Categories not covered by a named tab fall under "기타". */
const NAMED_LIST_TABS = new Set<CategorySlug>(["시사", "연애", "사회", "학교"]);

export function matchesListFilterTab(
  category: CategorySlug,
  tab: ListFilterTab,
): boolean {
  if (tab === "전체") return true;
  if (tab === "기타") return !NAMED_LIST_TABS.has(category);
  return category === tab;
}
