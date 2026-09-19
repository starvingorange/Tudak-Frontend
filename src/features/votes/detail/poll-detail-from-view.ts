import { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";
import type { GetViewDetailsResponse } from "@/api/poll/types/GetViewDetailsResponse";
import type { PollDetail, PollRecording } from "./data";

type ViewData = GetViewDetailsResponse["data"];

// 토론 진행 순서 — 각 단계마다 찬성 먼저, 반대 다음.
const PHASE_ORDER = [
  ArgumentDetailsArgumentType.OPENING,
  ArgumentDetailsArgumentType.REBUTTAL,
  ArgumentDetailsArgumentType.CONCLUSION,
] as const;

/** `GET /api/polls/{id}` 응답을 화면 모델에 병합한다. API에 없는 필드
 * (대사 텍스트·타이머·스텝·마감일·카테고리)는 `fallback` 값을 그대로 둔다. */
export function pollDetailFromView(
  pollId: string,
  view: ViewData,
  fallback: PollDetail,
): PollDetail {
  const proName = view.agree?.agreeNickname ?? fallback.proName;
  const conName = view.disagree?.agreeNickname ?? fallback.conName;
  const proLabel = view.agree?.label ?? fallback.proLabel;
  const conLabel = view.disagree?.label ?? fallback.conLabel;

  const recordings: PollRecording[] = [];
  for (const phase of PHASE_ORDER) {
    const pro = view.agree?.arguments?.find((a) => a.argumentType === phase);
    if (pro?.voicePresignedUrl) {
      recordings.push({ side: "pro", phase, audioUrl: pro.voicePresignedUrl });
    }
    const con = view.disagree?.arguments?.find((a) => a.argumentType === phase);
    if (con?.voicePresignedUrl) {
      recordings.push({ side: "con", phase, audioUrl: con.voicePresignedUrl });
    }
  }

  return {
    ...fallback,
    id: pollId,
    topic: view.title ?? fallback.topic,
    proName,
    conName,
    proLabel,
    conLabel,
    pro: {
      ...fallback.pro,
      name: proName,
      statement: proLabel,
      imageUrl: view.agree?.imagePresignedUrl ?? null,
    },
    con: {
      ...fallback.con,
      name: conName,
      statement: conLabel,
      imageUrl: view.disagree?.imagePresignedUrl ?? null,
    },
    recordings,
    proVotes: view.agreeVoteCount ?? fallback.proVotes,
    conVotes: view.disagreeVoteCount ?? fallback.conVotes,
  };
}
