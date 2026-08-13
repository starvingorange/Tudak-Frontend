"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { getDebate } from "@/api/debate/api/getDebate";
import { useGetDebateList } from "@/api/debate/hooks/useGetDebateList";
import { useLoginGate } from "@/components/auth/use-login-gate";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import type { DebateRoom } from "@/features/debates/data";
import { JoinModal } from "@/features/debates/join-modal";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import { useAuthStore } from "@/stores/auth-store";

// The debate-detail API doesn't return a chosen sticker per seat — same
// defaults the create flow's preview and waiting-room view use.
const SEAT_STICKER = { pro: "st-pro-basic", con: "st-con-basic" } as const;

export function WaitingRoomsSection() {
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const { requireLogin, loginModal } = useLoginGate(
    "토론에 참여하려면 로그인이 필요해요.",
  );

  // GET /api/debates is meant to be public too (same backend-side 403-for-
  // anonymous bug noted in popular-votes-section.tsx), so this isn't gated
  // behind login either.
  const { data, isLoading } = useGetDebateList({
    status: "WAITING",
    pageable: { page: 0, size: 3 },
  });
  const rooms = data?.data?.content ?? [];

  const openJoinModal = async (debateId: number) => {
    if (!useAuthStore.getState().accessToken) {
      requireLogin();
      return;
    }
    setJoiningId(debateId);
    try {
      // 참여 모달에 필요한 라벨, 호스트/상대방 정보는 목록 API에 없어서
      // 클릭 시점에 상세 조회로 채운다 (waiting-room-view.tsx와 동일 패턴).
      const { data: room } = await getDebate(debateId);
      const pro =
        room.hostAgreement === "AGREE" && room.hostNickname
          ? { name: room.hostNickname, sticker: SEAT_STICKER.pro }
          : room.opponentAgreement === "AGREE" && room.opponentNickname
            ? { name: room.opponentNickname, sticker: SEAT_STICKER.pro }
            : null;
      const con =
        room.hostAgreement === "DISAGREE" && room.hostNickname
          ? { name: room.hostNickname, sticker: SEAT_STICKER.con }
          : room.opponentAgreement === "DISAGREE" && room.opponentNickname
            ? { name: room.opponentNickname, sticker: SEAT_STICKER.con }
            : null;
      setOpenRoom({
        id: String(debateId),
        category: room.category ? BACKEND_TO_CATEGORY[room.category] : "기타",
        title: room.title ?? "",
        proStance: room.agreeLabel ?? "찬성",
        conStance: room.disagreeLabel ?? "반대",
        pro,
        con,
      });
    } catch (error) {
      console.error("Failed to load debate detail", error);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <section className="mt-5 rounded-(--radius-section) border border-(--border-1) bg-(--bg-surface) p-4 sm:mt-7 sm:p-[24px_28px_26px]">
      <SectionHeader
        icon={<Clock size={18} className="text-(--text-1)" />}
        title="대기 중인 방"
        moreHref="/debates"
      />
      {isLoading ? null : rooms.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 py-10 text-center sm:mt-5">
          <span className="text-[15px] font-bold text-(--text-2)">
            아직 대기 중인 방이 없어요
          </span>
          <span className="text-[13px] text-(--text-3)">
            토론방을 만들면 여기에 표시돼요
          </span>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:mt-4.5 sm:gap-2.5">
          {rooms.map((room) => {
            const category = room.category
              ? BACKEND_TO_CATEGORY[room.category]
              : "기타";
            const joining = joiningId === room.debateId;
            return (
              <div
                key={room.debateId}
                className="flex flex-col items-stretch gap-3 rounded-(--radius-row) border border-(--border-1) bg-(--bg-card) p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-[12px_16px]"
              >
                <CategoryBadge
                  category={category}
                  className="shrink-0 self-start sm:self-center"
                />
                <span className="flex-1 text-[15px] leading-relaxed font-bold">
                  {room.title}
                </span>
                <Button
                  size="sm"
                  className="justify-center sm:justify-start"
                  disabled={joining}
                  onClick={() =>
                    room.debateId !== undefined && openJoinModal(room.debateId)
                  }
                >
                  {joining ? "불러오는 중..." : "입장하기"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
      {loginModal}
    </section>
  );
}
