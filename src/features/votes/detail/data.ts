import type {
  DebaterState,
  TranscriptMessage,
} from "@/features/debates/room/data";

export interface PollDetail {
  id: string;
  topic: string;
  proName: string;
  conName: string;
  /** Short one-liner shown under each option in the vote modal. */
  proTagline: string;
  conTagline: string;
  pro: DebaterState;
  con: DebaterState;
  transcript: TranscriptMessage[];
  proVotes: number;
  conVotes: number;
  deadlineLabel: string;
}

// The one fully-authored example — mirrors features/debates/room/data.ts's
// MINT_CHOCO so the replay reads identically on both sides.
const MINT_CHOCO: PollDetail = {
  id: "mint-choco",
  topic: "민트초코는 디저트인가?",
  proName: "민초러버",
  conName: "치킨왕",
  proTagline: "디저트 맞음!",
  conTagline: "디저트로 한정 못함!",
  pro: {
    name: "민초러버",
    sticker: "st-pro-basic",
    statement: "단맛이고 식후에\n먹으니까 디저트 맞음!",
    remainingLabel: "04:12",
    remainingPercent: 52,
    speaking: true,
  },
  con: {
    name: "치킨왕",
    sticker: "st-con-basic",
    statement: "음료·토핑으로도 쓰이니\n디저트로 한정 못함!",
    remainingLabel: "04:45",
    remainingPercent: 45,
    speaking: false,
    dimmed: false,
  },
  transcript: [
    {
      side: "pro",
      name: "민초러버",
      time: "10:15:30",
      text: "단맛이고 식후에 먹으니까 디저트 맞음!",
    },
    {
      side: "con",
      name: "치킨왕",
      time: "10:16:02",
      text: "음료·토핑으로도 쓰이니 디저트로 한정 못함!",
    },
    {
      side: "pro",
      name: "민초러버",
      time: "10:16:45",
      text: "하지만 아이스크림, 케이크 등 다양한 디저트에도\n민트초코가 활용되고 있어요!",
    },
    {
      side: "con",
      name: "치킨왕",
      time: "10:17:10",
      text: "디저트의 정의는 주관적이라,\n모두에게 해당된다고 보기 어려워요.",
    },
  ],
  proVotes: 155,
  conVotes: 121,
  deadlineLabel: "D-3",
};

// 투표 상세 API(useGetViewDetails)를 아직 붙이지 않아서 — 어떤 pollId로
// 들어오든 이 목업 하나를 돌려준다. 연동 시 pollId로 조회하도록 교체.
export function getPollDetail(_pollId: string): PollDetail {
  return MINT_CHOCO;
}
