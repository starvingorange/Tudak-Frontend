import { getDebateRoomDetail } from "@/features/debates/room/data";
import type { CategorySlug } from "@/features/shared/categories";

export interface DebateResult {
  id: string;
  category: CategorySlug;
  topic: string;
  leftLabel: string;
  rightLabel: string;
  leftSummary: string;
  rightSummary: string;
  leftComment: string;
  rightComment: string;
  aiSummary: string;
  missedPoint: string;
}

// The one fully-authored example, written for this app's actual mint-choco
// debate (see features/debates/room/data.ts) — every other room in
// DEBATE_ROOMS has voteEnded: false, so there's no AI result to show yet.
const MINT_CHOCO: DebateResult = {
  id: "mint-choco",
  category: "문화",
  topic: "민트초코는 디저트인가?",
  leftLabel: "찬성",
  rightLabel: "반대",
  leftSummary:
    '"식후에 즐기는 달콤함"과 "디저트로도 자주 활용되는 점"을 핵심 근거로 들었어요.',
  rightSummary:
    '"음료·토핑 등 다양한 활용"과 "디저트라는 정의의 모호함"을 근거로 들었어요.',
  leftComment:
    '근거는 명확했지만, "정의가 모호하다"는 상대 반박에 대한 재반박이 조금 부족했어요.',
  rightComment:
    "다양한 활용 사례를 잘 짚었지만, 그래서 디저트가 아니라는 결론으로 넘어가는 논리가 다소 급했어요.",
  aiSummary:
    '결국 "디저트를 어떻게 정의할지"에 대한 기준 차이에서 비롯된 논쟁으로 보여요.',
  missedPoint:
    "디저트로 분류되지 않지만 자주 소비되는 다른 식품과의 비교는 두 분 다 다루지 않았어요.",
};

export function getDebateResult(id: string): DebateResult | null {
  if (id !== MINT_CHOCO.id) return null;
  const room = getDebateRoomDetail(id);
  if (!room?.voteEnded) return null;
  return MINT_CHOCO;
}
