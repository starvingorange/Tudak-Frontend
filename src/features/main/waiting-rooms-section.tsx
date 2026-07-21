"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import type { DebateRoom } from "@/features/debates/data";
import { JoinModal } from "@/features/debates/join-modal";
import { WAITING_ROOMS } from "./data";

export function WaitingRoomsSection() {
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);

  return (
    <section className="bg-[var(--bg-surface)] border border-[var(--border-1)] rounded-[var(--radius-section)] mt-7 p-[24px_28px_26px]">
      <SectionHeader
        icon={<Clock size={18} className="text-[var(--text-1)]" />}
        title="대기 중인 방"
        moreHref="/debates"
      />
      <div className="flex flex-col gap-[10px] mt-[18px]">
        {WAITING_ROOMS.map((room) => (
          <div
            key={room.id}
            className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-[var(--radius-row)] p-[12px_16px]"
          >
            <CategoryBadge category={room.category} className="shrink-0" />
            <span className="flex-1 text-[15px] font-bold">{room.title}</span>
            <button
              type="button"
              onClick={() => setOpenRoom(room)}
              className="inline-flex items-center gap-[7px] text-[13px] font-extrabold px-[22px] py-2 rounded-[var(--radius-button-sm)] bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] cursor-pointer hover:text-[var(--brand-on-yellow)]"
            >
              입장하기
            </button>
          </div>
        ))}
      </div>
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
    </section>
  );
}
