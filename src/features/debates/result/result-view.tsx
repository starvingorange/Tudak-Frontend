"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { useGetDebate } from "@/api/debate/hooks/useGetDebate";
import { useGetViewDetails } from "@/api/poll/hooks/useGetViewDetails";
import type { ArgumentDetails } from "@/api/poll/types/ArgumentDetails";
import { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";
import type { DebateUser } from "@/api/poll/types/DebateUser";
import { CategoryBadge } from "@/components/ui/category-badge";
import { useDebateCall } from "@/features/debates/shared/debate-call-provider";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import { ROUTES } from "@/lib/routes";

interface ResultViewProps {
  debateId: string;
}

const ARGUMENT_LABEL: Record<ArgumentDetailsArgumentType, string> = {
  [ArgumentDetailsArgumentType.OPENING]: "입론",
  [ArgumentDetailsArgumentType.REBUTTAL]: "반론",
  [ArgumentDetailsArgumentType.CONCLUSION]: "결론",
};

export function ResultView({ debateId }: ResultViewProps) {
  const numericId = Number(debateId);
  const { pollId } = useDebateCall();

  const { data: debateData } = useGetDebate(numericId, {
    query: { enabled: Number.isFinite(numericId) },
  });
  const { data: pollData, isLoading: pollLoading } = useGetViewDetails(
    pollId ?? 0,
    { query: { enabled: pollId !== null } },
  );

  const room = debateData?.data;
  const poll = pollData?.data;

  if (pollId === null || pollLoading || !poll) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-var(--nav-height))] max-w-240 items-center justify-center px-4 text-center">
        <span className="text-sm font-bold text-(--text-2)">
          결과를 정리하는 중이에요...
        </span>
      </div>
    );
  }

  const category = room?.category ? BACKEND_TO_CATEGORY[room.category] : "기타";

  return (
    <div className="max-w-240 mx-auto px-4 py-8 min-h-[calc(100dvh-var(--nav-height))] flex flex-col justify-between gap-6">
      <div className="flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <CategoryBadge category={category} className="w-fit" />
          <h1 className="text-4xl font-black tracking-[-0.5px] m-0">
            {poll.title ?? room?.title ?? ""}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <DebaterResultPanel
            label={room?.agreeLabel ?? "찬성"}
            user={poll.agree}
            voteCount={poll.agreeVoteCount ?? 0}
            accent="blue"
          />
          <DebaterResultPanel
            label={room?.disagreeLabel ?? "반대"}
            user={poll.disagree}
            voteCount={poll.disagreeVoteCount ?? 0}
            accent="red"
          />
        </div>

        <div className="bg-(--bg-hero) border border-(--border-1) rounded-2xl p-6 text-center text-[15px] font-bold text-(--text-2)">
          AI 분석은 준비 중이에요 — 곧 만나보실 수 있어요.
        </div>
      </div>

      <Link
        href={ROUTES.HOME()}
        className="h-14 rounded-2xl bg-(--brand-yellow) text-(--brand-on-yellow) text-base font-black flex items-center justify-center gap-2.5 hover:brightness-[0.96]"
      >
        <Home size={18} strokeWidth={2} />
        홈으로
      </Link>
    </div>
  );
}

function DebaterResultPanel({
  label,
  user,
  voteCount,
  accent,
}: {
  label: string;
  user: DebateUser | undefined;
  voteCount: number;
  accent: "blue" | "red";
}) {
  // #eef1fd/#fdecec match the pro/con tints used in join-modal.tsx, so body
  // copy needs fixed dark ink instead of the theme's --text-*.
  const tint = accent === "blue" ? "#eef1fd" : "#fdecec";
  const border = accent === "blue" ? "#d3ddf8" : "#f6d2d2";
  const ink = accent === "blue" ? "var(--vote-blue)" : "var(--vote-red)";
  // FindPollDetailsResponse.DebateUser는 찬성/반대 둘 다 같은 스키마를 써서
  // 필드 이름이 항상 `agreeNickname`이다 — 실제로는 이 유저의 닉네임일 뿐.
  const nickname = user?.agreeNickname ?? label;

  return (
    <div
      className="flex flex-col gap-3.5 rounded-2xl border p-6"
      style={{ background: tint, borderColor: border }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="w-fit rounded-full border-[1.5px] px-4 py-1.5 text-sm font-extrabold"
          style={{ borderColor: ink, color: ink }}
        >
          {label}
        </span>
        <span className="text-sm font-bold text-[#1a1a1a]">
          {voteCount.toLocaleString()}표
        </span>
      </div>
      <div className="text-base font-black text-[#1a1a1a]">{nickname}</div>
      <div className="flex flex-col gap-2">
        {(user?.arguments ?? []).map((argument, index) =>
          argument.voicePresignedUrl ? (
            <ArgumentAudio
              // biome-ignore lint/suspicious/noArrayIndexKey: no stable id in this API shape, and the list never reorders
              key={index}
              argument={argument}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

function ArgumentAudio({ argument }: { argument: ArgumentDetails }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-[#1a1a1a]/70">
        {argument.argumentType ? ARGUMENT_LABEL[argument.argumentType] : ""}
      </span>
      {/* biome-ignore lint/a11y/useMediaCaption: recorded debate speech, no transcript to caption with */}
      <audio controls src={argument.voicePresignedUrl} className="h-9 w-full" />
    </div>
  );
}
