"use client";

import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  LIST_FILTER_TABS,
  type ListFilterTab,
  matchesListFilterTab,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import { DEBATE_ROOMS, type DebateRoom } from "./data";
import { DebateCard } from "./debate-card";
import { JoinModal } from "./join-modal";

export function DebateList() {
  const [tab, setTab] = useState<ListFilterTab>(LIST_FILTER_TABS[0]);
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);

  const rooms = useMemo(
    () =>
      DEBATE_ROOMS.filter((room) => matchesListFilterTab(room.category, tab)),
    [tab],
  );

  return (
    <>
      <div className="border border-[var(--border-1)] rounded-[var(--radius-section)] mt-6 p-4">
        <CategoryTabBar active={tab} onChange={setTab} />
      </div>
      <div className="grid grid-cols-3 gap-[18px] mt-[22px]">
        {rooms.map((room) => (
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
