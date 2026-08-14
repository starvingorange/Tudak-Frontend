"use client";

import { useGetMyPollList } from "@/api/user-poll/hooks/useGetMyPollList";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import { MyVoteRow } from "./my-vote-row";

// 목록 조회 API가 캐릭터 스티커를 안 줘서 고정 기본값을 쓴다.
const DEFAULT_STICKER = "st-com-idea";

export function MyVotesView() {
  const { data, isLoading } = useGetMyPollList({
    pageable: { page: 0, size: 20 },
  });
  const votes = data?.data?.content ?? [];

  if (isLoading) return null;

  if (votes.length === 0) {
    return (
      <div className="border border-dashed border-(--border-1) rounded-(--radius-section) py-14 text-center text-[15px] text-(--text-2)">
        아직 참여한 투표가 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {votes.map((vote, index) => (
        <MyVoteRow
          key={vote.pollId ?? index}
          category={
            vote.categoryType ? BACKEND_TO_CATEGORY[vote.categoryType] : "기타"
          }
          title={vote.pollName ?? ""}
          proName={vote.agreeNickname ?? "익명"}
          conName={vote.disagreeNickname ?? "익명"}
          participantCount={vote.voteCount ?? 0}
          sticker={DEFAULT_STICKER}
        />
      ))}
    </div>
  );
}
