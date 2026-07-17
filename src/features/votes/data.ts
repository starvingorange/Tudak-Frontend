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

export const VOTE_ROWS: VoteRow[] = [
  {
    id: "4day-workweek",
    category: "시사",
    title: "주 4일 근무제, 도입해야 할까?",
    proName: "민초러버",
    conName: "치킨왕",
    participantCount: 128,
    sticker: "st-pro-basic",
  },
  {
    id: "age-gap-dating",
    category: "연애",
    title: "연애할 때 나이 차이, 몇 살까지 가능?",
    proName: "설렘주의",
    conName: "연애박사",
    participantCount: 96,
    sticker: "st-com-idea",
  },
  {
    id: "youth-basic-income",
    category: "사회",
    title: "청년 기본소득, 지급해야 할까?",
    proName: "토닥이123",
    conName: "현실주의자",
    participantCount: 74,
    sticker: "st-con-basic",
  },
  {
    id: "carbon-tax",
    category: "시사",
    title: "탄소세 도입, 환경에 도움이 될까?",
    proName: "경제탐험가",
    conName: "자유로운영혼",
    participantCount: 55,
    sticker: "st-pro-think",
  },
  {
    id: "ai-judge",
    category: "사회",
    title: "AI가 판사를 대신하는 시대, 가능할까?",
    proName: "미래생각",
    conName: "인간최우선",
    participantCount: 63,
    sticker: "st-com-surprise",
  },
  {
    id: "dating-cost",
    category: "연애",
    title: "데이트 비용은 누가 부담하는 게 맞을까?",
    proName: "연애박사",
    conName: "계산적인사람",
    participantCount: 41,
    sticker: "st-con-think",
  },
];

export const VOTE_FILTER_TABS = [
  "전체",
  "시사",
  "연애",
  "사회",
  "학교",
  "기타",
] as const;
export const VOTE_SORT_OPTIONS = ["최신순", "인기순", "마감임박순"] as const;
