import { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";

export interface ArgumentSlot {
  side: 0 | 1;
  argumentType: ArgumentDetailsArgumentType;
}

// 찬성(0)과 반대(1)가 번갈아 가며 입론 → 반론 → 최종변론 순서로 진행 —
// `use-debate-turns.ts`가 이 순서 그대로 6개 서브턴을 돌리고, `postFinishDebate`에
// 보내는 `s3ObjectKeyList`도 이 순서를 그대로 따른다(`mergeArgumentKeys` 참고).
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

/** 내 3개(입론→반론→최종변론)와 상대에게서 P2P로 받은 3개를 `ARGUMENT_ORDER`
 * 순서 그대로 하나의 6개짜리 리스트로 합친다 — `postFinishDebate`의
 * `s3ObjectKeyList`에 그대로 넘기면 된다. 방장 클라이언트만 이걸 호출한다. */
export function mergeArgumentKeys(
  mySide: 0 | 1,
  myKeys: readonly string[],
  theirKeys: readonly string[],
): string[] {
  let myIndex = 0;
  let theirIndex = 0;
  return ARGUMENT_ORDER.map((slot) =>
    slot.side === mySide ? myKeys[myIndex++] : theirKeys[theirIndex++],
  );
}
