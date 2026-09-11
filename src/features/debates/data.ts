import type { CategorySlug } from "@/features/shared/categories";

export interface DebateSeat {
  name: string;
  sticker: string;
  /** Real profile photo (presigned S3 URL) — falls back to `sticker` when
   * the API doesn't provide one for this context (e.g. the waiting/debate
   * room detail endpoint has no image fields yet, unlike the list one). */
  imageUrl?: string;
}

export interface DebateRoom {
  id: string;
  category: CategorySlug;
  title: string;
  /** Stance the 찬성 seat argues for, shown in the join modal */
  proStance: string;
  /** Stance the 반대 seat argues for, shown in the join modal */
  conStance: string;
  pro: DebateSeat | null;
  con: DebateSeat | null;
}
