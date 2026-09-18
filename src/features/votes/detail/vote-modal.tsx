"use client";

import { useQueryClient } from "@tanstack/react-query";
import { SquareCheckBig } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getViewDetailsQueryKey } from "@/api/poll/hooks/useGetViewDetails";
import { usePostVote } from "@/api/user-poll/hooks/usePostVote";
import { CreateUserPollRequestAgreement } from "@/api/user-poll/types/CreateUserPollRequestAgreement";
import { cn } from "@/lib/utils";
import type { PollDetail } from "./data";

type Side = "pro" | "con";

interface VoteModalProps {
  /** Numeric poll id, or null when the id isn't a real poll (mock demo). */
  pollId: number | null;
  /** True once `GET /api/polls/{id}` has returned — gates the real vote POST. */
  live: boolean;
  poll: PollDetail;
  myVote: Side | null;
  onVote: (side: Side) => void;
  onClose: () => void;
}

export function VoteModal({
  pollId,
  live,
  poll,
  myVote,
  onVote,
  onClose,
}: VoteModalProps) {
  const [picked, setPicked] = useState<Side | null>(myVote);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate, isPending } = usePostVote();
  const voted = myVote !== null;

  const total = poll.proVotes + poll.conVotes;
  const proPercent =
    total === 0 ? 50 : Math.round((poll.proVotes / total) * 100);
  const conPercent = 100 - proPercent;

  const submit = () => {
    if (!picked || isPending) return;
    setError(null);

    if (!live || pollId === null) {
      onVote(picked);
      return;
    }

    mutate(
      {
        data: {
          pollId,
          agreement:
            picked === "pro"
              ? CreateUserPollRequestAgreement.AGREE
              : CreateUserPollRequestAgreement.DISAGREE,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getViewDetailsQueryKey(pollId),
          });
          onVote(picked);
        },
        onError: () => {
          setError(
            "투표에 실패했어요. 이미 투표했거나 잠시 후 다시 시도해주세요.",
          );
        },
      },
    );
  };

  const option = (side: Side) => {
    const isPro = side === "pro";
    const active = (voted ? myVote : picked) === side;
    const color = isPro ? "var(--vote-blue)" : "var(--vote-red)";
    return (
      <button
        type="button"
        disabled={voted || isPending}
        onClick={() => setPicked(side)}
        className={cn(
          "flex items-center gap-4 rounded-xl p-[16px_18px] text-left transition-all",
          active ? (isPro ? "bg-[#eef1fd]" : "bg-[#fdecec]") : "bg-(--bg-card)",
          voted && !active && "opacity-55",
          !voted && "cursor-pointer",
        )}
        style={{
          border: active ? `2px solid ${color}` : "1px solid var(--border-1)",
        }}
      >
        <Image
          src={
            isPro
              ? "/assets-characters/pro-basic.webp"
              : "/assets-characters/con-basic.webp"
          }
          alt={isPro ? "찬성" : "반대"}
          width={isPro ? 190 : 200}
          height={isPro ? 165 : 158}
          style={{ width: "auto" }}
          className="h-14 sm:h-16"
        />
        <span className="flex flex-col items-start gap-1">
          <span
            className="text-[15px] font-extrabold sm:text-base"
            style={{ color }}
          >
            {isPro ? "찬성" : "반대"} · {isPro ? poll.proName : poll.conName}
          </span>
          <span
            className={cn("text-[13px]", !active && "text-(--text-2)")}
            style={active ? { color: "#6f6f6f" } : undefined}
          >
            {isPro ? poll.proTagline : poll.conTagline}
          </span>
        </span>
      </button>
    );
  };

  return (
    // Click-outside-to-close backdrop (only when the click target is the
    // backdrop itself, not a bubbled click from the panel); Escape also closes.
    // biome-ignore lint/a11y/noStaticElementInteractions: role="presentation" backdrop with click-outside-to-close is a standard modal pattern; every real control inside the dialog is a proper button.
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-[92vw] overflow-y-auto rounded-2xl bg-(--bg-card) p-5 box-border sm:w-140 sm:p-[26px_28px]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
          <SquareCheckBig size={18} />
          <span className="flex-1 text-lg font-extrabold">
            어느 입장에 공감하시나요?
          </span>
          <span className="text-[13px] text-[#909090]">
            투표 마감 {poll.deadlineLabel}
          </span>
        </div>
        <div className="mt-2 text-[13.5px] text-(--text-2)">
          토론 종료 후 3일간 투표할 수 있어요. 투표는 한 번만 가능합니다.
        </div>

        <div className="mt-4.5 grid gap-3.5 sm:grid-cols-2">
          {option("pro")}
          {option("con")}
        </div>

        {voted ? (
          <>
            <div className="mt-5 flex h-2.5 overflow-hidden rounded-full">
              <span
                className="bg-(--vote-blue)"
                style={{ width: `${proPercent}%` }}
              />
              <span
                className="bg-(--vote-red)"
                style={{ width: `${conPercent}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between">
              <span className="text-[19px] font-extrabold text-(--vote-blue)">
                {proPercent}%
              </span>
              <span className="text-[19px] font-extrabold text-(--vote-red)">
                {conPercent}%
              </span>
            </div>
            <div className="mt-0.5 flex justify-between text-[13px]">
              <span className="text-(--vote-blue)">
                찬성 {poll.proVotes.toLocaleString()}표
              </span>
              <span className="text-(--vote-red)">
                반대 {poll.conVotes.toLocaleString()}표
              </span>
            </div>
            <div className="mt-4 text-center text-sm font-extrabold">
              {myVote === "pro" ? "찬성" : "반대"}에 투표했어요!
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-(--radius-button) bg-(--brand-yellow) py-3.25 text-sm font-extrabold text-(--brand-on-yellow) hover:brightness-[0.96]"
            >
              확인
            </button>
          </>
        ) : (
          <>
            {error && (
              <div className="mt-3.5 rounded-xl bg-[#fdecec] px-4 py-3 text-center text-[13px] font-bold text-(--vote-red)">
                {error}
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-(--radius-button) border border-(--border-1) bg-(--bg-card) py-3.25 text-sm font-bold hover:border-[#c9c5bd]"
              >
                취소
              </button>
              <button
                type="button"
                disabled={picked === null || isPending}
                onClick={submit}
                className={cn(
                  "inline-flex flex-1 items-center justify-center rounded-(--radius-button) py-3.25 text-sm font-extrabold sm:flex-[1.4]",
                  picked && !isPending
                    ? "bg-(--brand-yellow) text-(--brand-on-yellow) hover:brightness-105"
                    : "bg-[#efedea] text-[#a3a09a]",
                )}
              >
                {isPending
                  ? "투표 중…"
                  : picked
                    ? "투표하기"
                    : "입장을 선택하세요"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
