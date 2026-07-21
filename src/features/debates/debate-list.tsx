"use client";

import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  type ListFilter,
  matchesListFilter,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import { DEBATE_ROOMS, type DebateRoom } from "./data";
import { DebateCard } from "./debate-card";
import { JoinModal } from "./join-modal";

export function DebateList() {
  const [tab, setTab] = useState<ListFilter>("전체");
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);

  const rooms = useMemo(
    () => DEBATE_ROOMS.filter((room) => matchesListFilter(room.category, tab)),
    [tab],
  );

  return (
    <>
      <div className="border border-(--border-1) rounded-(--radius-section) mt-6 p-4">
        <CategoryTabBar active={tab} onChange={setTab} />
      </div>
      <div className="grid grid-cols-3 gap-4.5 mt-5.5">
        {rooms.slice(0, 6).map((room) => (
          <DebateCard key={room.id} room={room} onJoin={setOpenRoom} />
        ))}
      </div>
      <Pagination />
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
    </>
  );
}
