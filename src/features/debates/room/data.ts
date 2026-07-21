import { DEBATE_ROOMS } from "@/features/debates/data";

export interface DebaterState {
  name: string;
  sticker: string;
  statement: string;
  remainingLabel: string;
  remainingPercent: number;
  speaking: boolean;
}

export interface TranscriptMessage {
  side: "pro" | "con";
  name: string;
  time: string;
  text: string;
}

export interface DebateRoomDetail {
  id: string;
  question: string;
  pro: DebaterState | null;
  con: DebaterState | null;
  transcript: TranscriptMessage[];
  voteEnded: boolean;
  myTurn: boolean;
  proVotes: number;
  conVotes: number;
}

// The one fully-authored example; every other id below is a lighter,
// generated detail derived from the debates-list seat data.
const MINT_CHOCO: DebateRoomDetail = {
  id: "mint-choco",
  question: "Q. 민트초코는 디저트인가?",
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
  voteEnded: true,
  myTurn: false,
  proVotes: 154,
  conVotes: 121,
};

function toDebaterState(
  seat: { name: string; sticker: string } | null,
  stance: string,
): DebaterState | null {
  if (!seat) return null;
  return {
    name: seat.name,
    sticker: seat.sticker,
    statement: stance,
    remainingLabel: "05:00",
    remainingPercent: 100,
    speaking: true,
  };
}

export function getDebateRoomDetail(id: string): DebateRoomDetail | null {
  if (id === MINT_CHOCO.id) return MINT_CHOCO;

  const room = DEBATE_ROOMS.find((r) => r.id === id);
  if (!room) return null;

  const pro = toDebaterState(room.pro, room.proStance);
  const con = toDebaterState(room.con, room.conStance);
  const transcript: TranscriptMessage[] = [
    ...(room.pro
      ? [
          {
            side: "pro" as const,
            name: room.pro.name,
            time: "방금",
            text: room.proStance,
          },
        ]
      : []),
    ...(room.con
      ? [
          {
            side: "con" as const,
            name: room.con.name,
            time: "방금",
            text: room.conStance,
          },
        ]
      : []),
  ];

  return {
    id,
    question: `Q. ${room.title}`,
    pro,
    con,
    transcript,
    voteEnded: false,
    myTurn: false,
    proVotes: 0,
    conVotes: 0,
  };
}
