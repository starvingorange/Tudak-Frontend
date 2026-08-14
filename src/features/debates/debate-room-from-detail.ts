import type { GetDebateResponse } from "@/api/debate/types/GetDebateResponse";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import type { DebateRoom, DebateSeat } from "./data";

// The debate-detail API doesn't return a chosen sticker per seat — same
// defaults the create flow's preview and waiting-room view use.
const SEAT_STICKER = { pro: "st-pro-basic", con: "st-con-basic" } as const;

type DebateDetail = GetDebateResponse["data"];

export function debateRoomFromDetail(
  debateId: number,
  detail: DebateDetail,
): DebateRoom {
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

  return {
    id: String(debateId),
    category: detail.category ? BACKEND_TO_CATEGORY[detail.category] : "기타",
    title: detail.title ?? "",
    proStance: detail.agreeLabel ?? "찬성",
    conStance: detail.disagreeLabel ?? "반대",
    pro,
    con,
  };
}
