import type { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";
import type {
  DebaterState,
  TranscriptMessage,
} from "@/features/debates/room/data";

/** One voice recording from the debate — `GET /api/polls/{id}` returns these
 * per side as `agree.arguments[]` / `disagree.arguments[]`. */
export interface PollRecording {
  side: "pro" | "con";
  phase: ArgumentDetailsArgumentType;
  audioUrl: string;
}

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
  /** Text transcript — no API source (the poll API only returns voice URLs),
   * so this stays mock and is only shown when `recordings` is empty. */
  transcript: TranscriptMessage[];
  /** Real debate recordings from the API; empty in the mock. */
  recordings: PollRecording[];
  proVotes: number;
  conVotes: number;
  deadlineLabel: string;
}

// 폴백용 예시 데이터. 찬/반 카드의 `statement`는 실제 발언 요약이 아니라
// (poll API에 그런 필드가 없다) 그냥 "찬성"/"반대" 라벨로 둔다.
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
    statement: "찬성",
    remainingLabel: "04:12",
    remainingPercent: 52,
    speaking: true,
  },
  con: {
    name: "치킨왕",
    sticker: "st-con-basic",
    statement: "반대",
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
  recordings: [],
  proVotes: 155,
  conVotes: 121,
  deadlineLabel: "D-3",
};

// `useGetViewDetails`가 데이터를 주기 전(로딩·에러)이나 스펙에 없는 필드
// (대사 텍스트·타이머·마감일 등)의 폴백. 실제 값은 poll-detail-from-view.ts가
// 이 위에 덮어씌운다.
export function getPollDetailFallback(_pollId: string): PollDetail {
  return MINT_CHOCO;
}
