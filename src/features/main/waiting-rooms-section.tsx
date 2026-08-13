"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { useLoginGate } from "@/components/auth/use-login-gate";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import type { DebateRoom } from "@/features/debates/data";
import { JoinModal } from "@/features/debates/join-modal";
import { useAuthStore } from "@/stores/auth-store";
import { WAITING_ROOMS } from "./data";

export function WaitingRoomsSection() {
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);
  const { requireLogin, loginModal } = useLoginGate(
    "토론에 참여하려면 로그인이 필요해요.",
  );

  return (
    <section className="mt-5 rounded-(--radius-section) border border-(--border-1) bg-(--bg-surface) p-4 sm:mt-7 sm:p-[24px_28px_26px]">
      <SectionHeader
        icon={<Clock size={18} className="text-(--text-1)" />}
        title="대기 중인 방"
        moreHref="/debates"
      />
      <div className="mt-4 flex flex-col gap-3 sm:mt-4.5 sm:gap-2.5">
        {WAITING_ROOMS.map((room) => (
          <div
            key={room.id}
            className="flex flex-col items-stretch gap-3 rounded-(--radius-row) border border-(--border-1) bg-(--bg-card) p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-[12px_16px]"
          >
            <CategoryBadge
              category={room.category}
              className="shrink-0 self-start sm:self-center"
            />
            <span className="flex-1 text-[15px] leading-relaxed font-bold">
              {room.title}
            </span>
            <Button
              size="sm"
              className="justify-center sm:justify-start"
              onClick={() => {
                if (!useAuthStore.getState().accessToken) {
                  requireLogin();
                  return;
                }
                setOpenRoom(room);
              }}
            >
              입장하기
            </Button>
          </div>
        ))}
      </div>
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
      {loginModal}
    </section>
  );
}
