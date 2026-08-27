import { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";

export interface ArgumentSlot {
  side: 0 | 1;
  argumentType: ArgumentDetailsArgumentType;
}

// 찬성(0)과 반대(1)가 번갈아 가며 입론 → 반론 → 최종변론 순서로 진행 —
// `use-debate-turns.ts`가 이 순서 그대로 6개 서브턴을 돌린다. 녹음 업로드
// API(`postFinishDebate`의 `s3ObjectKeyList` 등)와의 매핑 규칙은 백엔드
// 스펙이 확정되면 별도로 정한다 — 아직은 연결하지 않음.
export const ARGUMENT_ORDER: readonly ArgumentSlot[] = [
  { side: 0, argumentType: ArgumentDetailsArgumentType.OPENING },
  { side: 1, argumentType: ArgumentDetailsArgumentType.OPENING },
  { side: 0, argumentType: ArgumentDetailsArgumentType.REBUTTAL },
  { side: 1, argumentType: ArgumentDetailsArgumentType.REBUTTAL },
  { side: 0, argumentType: ArgumentDetailsArgumentType.CONCLUSION },
  { side: 1, argumentType: ArgumentDetailsArgumentType.CONCLUSION },
];

// "1인당 7분(입론+반론 6분 · 최종변론 1분)" — waiting-room-view.tsx의 안내
// 문구 그대로. 입론/반론 사이의 정확한 분배는 스펙에 없어 3분씩 동일 배분.
export const ARGUMENT_TYPE_SECONDS: Record<
  ArgumentDetailsArgumentType,
  number
> = {
  [ArgumentDetailsArgumentType.OPENING]: 3 * 60,
  [ArgumentDetailsArgumentType.REBUTTAL]: 3 * 60,
  [ArgumentDetailsArgumentType.CONCLUSION]: 1 * 60,
};

export function argumentSlotKey(slot: ArgumentSlot): string {
  return `${slot.side}-${slot.argumentType}`;
}
