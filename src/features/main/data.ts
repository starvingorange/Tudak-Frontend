import type { CategorySlug } from "@/features/shared/categories";

export interface PopularDebate {
  id: string;
  category: CategorySlug;
  title: string;
  participants: number;
  fireCount: number;
}

export const POPULAR_DEBATES: PopularDebate[] = [
  {
    id: "4day-workweek",
    category: "시사",
    title: "주 4일 근무제,\n도입해야 할까?",
    participants: 128,
    fireCount: 1256,
  },
  {
    id: "age-gap-dating",
    category: "연애",
    title: "연애할 때\n나이 차이, 몇 살까지 가능?",
    participants: 96,
    fireCount: 987,
  },
  {
    id: "youth-basic-income",
    category: "시사",
    title: "청년 기본소득,\n지급해야 할까?",
    participants: 74,
    fireCount: 812,
  },
];
