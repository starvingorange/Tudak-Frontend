import type { CategorySlug } from "@/features/shared/categories";

export interface VoteRow {
  id: string;
  category: CategorySlug;
  title: string;
  proName: string;
  conName: string;
  participantCount: number;
  sticker: string;
}

// Sort isn't backed by the poll list API yet (GetView1Request only takes
// pageable + categoryType, no sort key) — this stays UI-only until the
// backend adds one.
export const VOTE_SORT_OPTIONS = ["최신순", "인기순", "마감임박순"] as const;
