"use client";

import { ArrowLeft, SquareCheckBig } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ChatLog } from "@/features/debates/room/chat-log";
import { DebaterCard } from "@/features/debates/room/debater-card";
import { VoteProgressPanel } from "@/features/debates/room/vote-progress-panel";
import { ROUTES } from "@/lib/routes";
import type { PollDetail } from "./data";
import { VoteModal } from "./vote-modal";

type Vote = "pro" | "con" | null;

interface PollDetailViewProps {
  poll: PollDetail;
}

export function PollDetailView({ poll }: PollDetailViewProps) {
  const [voteOpen, setVoteOpen] = useState(false);
  const [myVote, setMyVote] = useState<Vote>(null);

  return (
    <div className="mx-auto max-w-295 px-4 pt-4 sm:pt-5">
      <div className="relative flex min-h-13 flex-col items-start gap-3 sm:items-center sm:justify-center">
        <Link
          href={ROUTES.VOTES()}
          className="inline-flex items-center gap-2 rounded-[10px] border border-(--border-1) bg-(--bg-card) px-4 py-2.5 text-sm font-bold sm:absolute sm:left-0 sm:px-4.5 sm:py-2.75"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          나가기
        </Link>
        <h1 className="m-0 text-left text-2xl font-extrabold tracking-[-0.3px] sm:text-center sm:text-[28px]">
          Q. {poll.topic}
        </h1>
      </div>

      <VoteProgressPanel voteEnded={false} proVotes={0} conVotes={0} />

      <div className="mt-5.5 grid items-center gap-4 md:grid-cols-[1fr_88px_1fr] md:gap-x-0">
        <DebaterCard side="pro" debater={poll.pro} />
        <div className="flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--border-1) bg-(--bg-card) text-lg font-extrabold sm:h-16 sm:w-16 sm:text-xl">
            VS
          </span>
        </div>
        <DebaterCard side="con" debater={poll.con} />
      </div>

      <ChatLog messages={poll.transcript} />

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex justify-center border-t border-(--border-1) bg-(--bg-surface) px-4 py-3.5">
        <button
          type="button"
          onClick={() => setVoteOpen(true)}
          className="inline-flex items-center gap-2.5 rounded-full bg-(--brand-yellow) px-10 py-3.5 text-base font-extrabold text-(--brand-on-yellow) hover:brightness-[0.96]"
        >
          <SquareCheckBig size={18} />
          {myVote ? "투표 결과 보기" : "투표하기"}
        </button>
      </div>

      {voteOpen && (
        <VoteModal
          poll={poll}
          myVote={myVote}
          onVote={setMyVote}
          onClose={() => setVoteOpen(false)}
        />
      )}
    </div>
  );
}
