import type { FindPollResponse } from "@/api/poll/types/FindPollResponse";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import type { VoteRow } from "./data";

// The poll list API doesn't return a chosen sticker — same fixed default the
// debate list uses for missing seat stickers (debate-room-from-detail.ts).
const DEFAULT_STICKER = "st-pro-basic";

export function voteRowFromPoll(poll: FindPollResponse): VoteRow {
  return {
    id: String(poll.pollId),
    category: poll.categoryType
      ? BACKEND_TO_CATEGORY[poll.categoryType]
      : "기타",
    title: poll.title ?? "",
    proName: poll.agreeNickname ?? "찬성",
    conName: poll.disagreeNickname ?? "반대",
    participantCount: poll.voteCount ?? 0,
    sticker: DEFAULT_STICKER,
  };
}
