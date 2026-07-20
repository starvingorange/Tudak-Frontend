import { DEBATE_ROOMS } from "@/features/debates/data";
import type { CategorySlug } from "@/features/shared/categories";

export interface WaitingRoomInfo {
  id: string;
  topic: string;
  category: CategorySlug;
  description: string;
  pro: { name: string; sticker: string; stance: string } | null;
  con: { name: string; sticker: string; stance: string } | null;
}

export function getWaitingRoomInfo(id: string): WaitingRoomInfo | null {
  const room = DEBATE_ROOMS.find((r) => r.id === id);
  if (!room) return null;

  return {
    id: room.id,
    topic: room.title,
    category: room.category,
    description: `찬성 — ${room.proStance} · 반대 — ${room.conStance}`,
    pro: room.pro && { ...room.pro, stance: room.proStance },
    con: room.con && { ...room.con, stance: room.conStance },
  };
}
