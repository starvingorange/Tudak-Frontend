import { DEBATE_ROOMS } from "@/features/debates/data";
import { getDebateResult } from "@/features/debates/result/data";
import { getDebateRoomDetail } from "@/features/debates/room/data";
import type { CategorySlug } from "@/features/shared/categories";
import { VOTE_ROWS } from "@/features/votes/data";

export interface MyDebateSummary {
  id: string;
  category: CategorySlug;
  title: string;
  winner: "pro" | "con" | "tie";
  proPercent: number;
  conPercent: number;
}

/** Debates I took a seat in that have since wrapped up — only rooms with a
 * real AI result (see features/debates/result/data.ts) count as "finished". */
export function getMyCompletedDebates(): MyDebateSummary[] {
  return DEBATE_ROOMS.filter((room) => getDebateResult(room.id) !== null).map(
    (room) => {
      const detail = getDebateRoomDetail(room.id);
      const proVotes = detail?.proVotes ?? 0;
      const conVotes = detail?.conVotes ?? 0;
      const total = proVotes + conVotes;
      const proPercent =
        total === 0 ? 50 : Math.round((proVotes / total) * 100);
      const conPercent = 100 - proPercent;
      return {
        id: room.id,
        category: room.category,
        title: room.title,
        winner:
          proPercent === conPercent
            ? "tie"
            : proPercent > conPercent
              ? "pro"
              : "con",
        proPercent,
        conPercent,
      };
    },
  );
}

/** Curated subset of VOTE_ROWS standing in for "votes I've cast" — there's no
 * auth/session yet, so this can't be derived from real participation. */
const MY_VOTE_IDS = ["4day-workweek", "age-gap-dating", "carbon-tax"];

export function getMyVotes() {
  return VOTE_ROWS.filter((vote) => MY_VOTE_IDS.includes(vote.id));
}
