import { View1SortType } from "@/api/poll/types/View1SortType";
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

export const VOTE_SORT_OPTIONS = ["최신순", "인기순", "마감임박순"] as const;

export const VOTE_SORT_TO_BACKEND: Record<
  (typeof VOTE_SORT_OPTIONS)[number],
  View1SortType
> = {
  최신순: View1SortType.LATEST,
  인기순: View1SortType.POPULAR,
  마감임박순: View1SortType.DEADLINE,
};
