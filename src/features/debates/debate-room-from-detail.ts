import type { GetDebateResponse } from "@/api/debate/types/GetDebateResponse";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import type { DebateRoom } from "./data";
import { getSeatsFromDetail } from "./shared/debate-seats";

type DebateDetail = GetDebateResponse["data"];

export interface DebateSeatImages {
  agreeImageUrl?: string;
  disagreeImageUrl?: string;
}

// 상세 조회(DebateDetailResponse)엔 아직 이미지 필드가 없어서, 목록 조회
// (DebateListResponse)에서만 내려주는 agreeImageUrl/disagreeImageUrl을
// 호출부(debate-list.tsx)가 따로 넘겨준다.
export function debateRoomFromDetail(
  debateId: number,
  detail: DebateDetail,
  images?: DebateSeatImages,
): DebateRoom {
  const { pro, con } = getSeatsFromDetail(detail);

  return {
    id: String(debateId),
    category: detail.category ? BACKEND_TO_CATEGORY[detail.category] : "기타",
    title: detail.title ?? "",
    proStance: detail.agreeLabel ?? "찬성",
    conStance: detail.disagreeLabel ?? "반대",
    pro:
      pro && images?.agreeImageUrl
        ? { ...pro, imageUrl: images.agreeImageUrl }
        : pro,
    con:
      con && images?.disagreeImageUrl
        ? { ...con, imageUrl: images.disagreeImageUrl }
        : con,
  };
}
