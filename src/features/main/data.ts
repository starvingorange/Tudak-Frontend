import { DEBATE_ROOMS, type DebateRoom } from "@/features/debates/data";
import type { CategorySlug } from "@/features/shared/categories";

function getDebateRoom(id: string): DebateRoom {
  const room = DEBATE_ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`Unknown debate room id: ${id}`);
  return room;
}

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

export interface WaitingRoom extends DebateRoom {
  filled: number;
  capacity: number;
}

// Reuses real DEBATE_ROOMS entries (with an open seat) so clicking "입장하기"
// here can open the same seat-picking JoinModal the debates list uses.
export const WAITING_ROOMS: WaitingRoom[] = [
  { ...getDebateRoom("age-gap-dating"), filled: 6, capacity: 10 },
  { ...getDebateRoom("ai-judge"), filled: 4, capacity: 8 },
  { ...getDebateRoom("tuition-fees"), filled: 3, capacity: 6 },
];
