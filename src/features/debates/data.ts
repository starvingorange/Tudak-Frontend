import type { CategorySlug } from "@/features/shared/categories";

export interface DebateSeat {
  name: string;
  sticker: string;
}

export interface DebateRoom {
  id: string;
  category: CategorySlug;
  title: string;
  /** Stance the 찬성 seat argues for, shown in the join modal */
  proStance: string;
  /** Stance the 반대 seat argues for, shown in the join modal */
  conStance: string;
  pro: DebateSeat | null;
  con: DebateSeat | null;
}

export const DEBATE_ROOMS: DebateRoom[] = [
  {
    id: "4day-workweek",
    category: "시사",
    title: "주 4일 근무제, 도입해야 할까?",
    proStance: "도입해야 한다",
    conStance: "도입하지 말아야 한다",
    pro: { name: "민초러버", sticker: "st-pro-basic" },
    con: null,
  },
  {
    id: "age-gap-dating",
    category: "연애",
    title: "연애할 때 나이 차이, 몇 살까지 가능?",
    proStance: "나이는 숫자일 뿐이다",
    conStance: "적정선이 있다",
    pro: null,
    con: { name: "치킨왕", sticker: "st-con-basic" },
  },
  {
    id: "youth-basic-income",
    category: "시사",
    title: "청년 기본소득, 지급해야 할까?",
    proStance: "지급해야 한다",
    conStance: "지급하지 말아야 한다",
    pro: { name: "토닥이123", sticker: "st-com-idea" },
    con: null,
  },
  {
    id: "tuition-fees",
    category: "기타",
    title: "대학교 등록금, 지금이 적정할까?",
    proStance: "적정하다",
    conStance: "너무 비싸다",
    pro: null,
    con: { name: "공부하자", sticker: "st-con-think" },
  },
  {
    id: "carbon-tax",
    category: "시사",
    title: "탄소세 도입, 환경에 도움이 될까?",
    proStance: "도움이 된다",
    conStance: "효과가 없다",
    pro: { name: "지구지킴이", sticker: "st-pro-think" },
    con: null,
  },
  {
    id: "ai-judge",
    category: "시사",
    title: "AI가 판사를 대신하는 시대, 가능할까?",
    proStance: "가능하다",
    conStance: "불가능하다",
    pro: null,
    con: { name: "미래생각", sticker: "st-con-speak" },
  },
  {
    id: "mint-choco",
    category: "문화",
    title: "민트초코는 디저트인가?",
    proStance: "디저트 맞음!",
    conStance: "디저트로 한정 못함!",
    pro: { name: "민초러버", sticker: "st-pro-basic" },
    con: { name: "치킨왕", sticker: "st-con-basic" },
  },
];
