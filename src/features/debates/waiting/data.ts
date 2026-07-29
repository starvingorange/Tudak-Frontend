import { DEBATE_ROOMS } from "@/features/debates/data";
import type { CategorySlug } from "@/features/shared/categories";

export interface WaitingRoomInfo {
  id: string;
  topic: string;
  category: CategorySlug;
  description: string;
  proStance: string;
  conStance: string;
  pro: { name: string; sticker: string } | null;
  con: { name: string; sticker: string } | null;
}

export function getWaitingRoomInfo(id: string): WaitingRoomInfo | null {
  const room = DEBATE_ROOMS.find((r) => r.id === id);
  if (!room) return null;

  return {
    id: room.id,
    topic: room.title,
    category: room.category,
    description: `찬성 — ${room.proStance} · 반대 — ${room.conStance}`,
    proStance: room.proStance,
    conStance: room.conStance,
    pro: room.pro,
    con: room.con,
  };
}
