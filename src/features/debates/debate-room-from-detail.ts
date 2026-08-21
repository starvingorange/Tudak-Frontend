import type { GetDebateResponse } from "@/api/debate/types/GetDebateResponse";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import type { DebateRoom } from "./data";
import { getSeatsFromDetail } from "./shared/debate-seats";

type DebateDetail = GetDebateResponse["data"];

export function debateRoomFromDetail(
  debateId: number,
  detail: DebateDetail,
): DebateRoom {
  const { pro, con } = getSeatsFromDetail(detail);

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
