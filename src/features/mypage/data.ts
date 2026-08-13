import { VOTE_ROWS } from "@/features/votes/data";

/** Curated subset of VOTE_ROWS standing in for "votes I've cast" — there's no
 * auth/session yet, so this can't be derived from real participation. */
const MY_VOTE_IDS = ["4day-workweek", "age-gap-dating", "carbon-tax"];

export function getMyVotes() {
  return VOTE_ROWS.filter((vote) => MY_VOTE_IDS.includes(vote.id));
}
