import type { PollOption } from "@/components/ui/poll-bar";
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

interface PopularVsVote {
  id: string;
  kind: "vs";
  category: CategorySlug;
  title: string;
  voteCount: number;
  deadline: string;
  leftPercent: number;
  leftLabel: string;
  rightLabel: string;
}

interface PopularPollVote {
  id: string;
  kind: "poll";
  category: CategorySlug;
  title: string;
  voteCount: number;
  deadline: string;
  options: PollOption[];
}

export type PopularVote = PopularVsVote | PopularPollVote;

export const POPULAR_VOTES: PopularVote[] = [
  {
    id: "messi-vs-ronaldo",
    kind: "vs",
    category: "스포츠",
    title: "축구 GOAT는\n메시 vs 호날두?",
    voteCount: 2341,
    deadline: "D-2",
    leftPercent: 62,
    leftLabel: "메시",
    rightLabel: "호날두",
  },
  {
    id: "lol-best-position",
    kind: "poll",
    category: "게임",
    title: "롤에서 가장\n재미있는 포지션은?",
    voteCount: 1872,
    deadline: "D-1",
    options: [
      { label: "미드", percent: 42 },
      { label: "정글", percent: 28 },
      { label: "탑", percent: 18 },
      { label: "기타", percent: 12 },
    ],
  },
  {
    id: "movie-ott-release",
    kind: "vs",
    category: "문화",
    title: "한국 영화, OTT 공개\n동시 개봉 찬성?",
    voteCount: 1521,
    deadline: "D-3",
    leftPercent: 71,
    leftLabel: "찬성",
    rightLabel: "반대",
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
