import type { GetDebateResponse } from "@/api/debate/types/GetDebateResponse";
import type { DebateSeat } from "@/features/debates/data";

// The debate-detail API doesn't return a chosen sticker per seat — these are
// the same defaults the create flow's preview used.
const SEAT_STICKER = { pro: "st-pro-basic", con: "st-con-basic" } as const;

type DebateDetail = GetDebateResponse["data"];

export function getSeatsFromDetail(detail: DebateDetail): {
  pro: DebateSeat | null;
  con: DebateSeat | null;
} {
  const pro: DebateSeat | null =
    detail.hostAgreement === "AGREE" && detail.hostNickname
      ? { name: detail.hostNickname, sticker: SEAT_STICKER.pro }
      : detail.opponentAgreement === "AGREE" && detail.opponentNickname
        ? { name: detail.opponentNickname, sticker: SEAT_STICKER.pro }
        : null;
  const con: DebateSeat | null =
    detail.hostAgreement === "DISAGREE" && detail.hostNickname
      ? { name: detail.hostNickname, sticker: SEAT_STICKER.con }
      : detail.opponentAgreement === "DISAGREE" && detail.opponentNickname
        ? { name: detail.opponentNickname, sticker: SEAT_STICKER.con }
        : null;

  return { pro, con };
}
