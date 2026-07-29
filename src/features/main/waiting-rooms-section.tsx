"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import type { DebateRoom } from "@/features/debates/data";
import { JoinModal } from "@/features/debates/join-modal";
import { WAITING_ROOMS } from "./data";

export function WaitingRoomsSection() {
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);

  return (
    <section className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) mt-7 p-[24px_28px_26px]">
      <SectionHeader
        icon={<Clock size={18} className="text-(--text-1)" />}
        title="대기 중인 방"
        moreHref="/debates"
      />
      <div className="flex flex-col gap-2.5 mt-4.5">
        {WAITING_ROOMS.map((room) => (
          <div
            key={room.id}
            className="flex items-center gap-4 bg-(--bg-card) border border-(--border-1) rounded-(--radius-row) p-[12px_16px]"
          >
            <CategoryBadge category={room.category} className="shrink-0" />
            <span className="flex-1 text-[15px] font-bold">{room.title}</span>
            <Button size="sm" onClick={() => setOpenRoom(room)}>
              입장하기
            </Button>
          </div>
        ))}
      </div>
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
    </section>
  );
}
