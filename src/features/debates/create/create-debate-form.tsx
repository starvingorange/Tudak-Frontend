"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePostCreateDebate } from "@/api/debate/hooks/usePostCreateDebate";
import { CreateDebateRequestAgreement } from "@/api/debate/types/CreateDebateRequestAgreement";
import {
  CATEGORY_FILTERS,
  CATEGORY_TO_BACKEND,
  type CategorySlug,
} from "@/features/shared/categories";
import { setPendingAgreement } from "@/lib/pending-debate-agreement";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const MAX_TOPIC_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LABEL_LENGTH = 10;

type Side = "left" | "right";

export function CreateDebateForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategorySlug>("시사");
  const [leftLabel, setLeftLabel] = useState("찬성");
  const [rightLabel, setRightLabel] = useState("반대");
  const [side, setSide] = useState<Side>("left");

  const { mutate: createDebate, isPending, error } = usePostCreateDebate();

  const valid =
    topic.trim() !== "" &&
    description.trim() !== "" &&
    leftLabel.trim() !== "" &&
    rightLabel.trim() !== "";

  const submit = () => {
    if (!valid || isPending) return;
    createDebate(
      {
        data: {
          title: topic,
          content: description,
          category: CATEGORY_TO_BACKEND[category],
          agreeLabel: leftLabel,
          disagreeLabel: rightLabel,
          agreement:
            side === "left"
              ? CreateDebateRequestAgreement.AGREE
              : CreateDebateRequestAgreement.DISAGREE,
        },
      },
      {
        onSuccess: (res) => {
          const debateId = res.data?.debateId;
          if (debateId) {
            const agreement =
              side === "left"
                ? CreateDebateRequestAgreement.AGREE
                : CreateDebateRequestAgreement.DISAGREE;
            setPendingAgreement(debateId, agreement);
            router.push(ROUTES.DEBATE_WAITING(debateId));
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-8 bg-(--bg-card) border border-(--border-1) rounded-3xl p-9">
      <div className="flex flex-col gap-2.5">
        <div className="text-sm font-extrabold">토론 주제</div>
        <div className="relative">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={MAX_TOPIC_LENGTH}
            placeholder="토론 주제를 입력해주세요"
            className="w-full h-14 rounded-2xl border border-(--border-1) pr-19 pl-4.5 text-[15px] box-border bg-(--bg-card) outline-none"
          />
          <span className="absolute right-4 bottom-2.5 text-xs text-(--text-3)">
            {topic.length} / {MAX_TOPIC_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-sm font-extrabold">안건 설명</div>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder={
              "토론 참가자들이 주제를 이해할 수 있도록\n배경이나 논점을 작성해주세요."
            }
            className="w-full h-35 rounded-2xl border border-(--border-1) p-[16px_18px_28px] text-[15px] box-border bg-(--bg-card) leading-relaxed resize-none outline-none"
          />
          <span className="absolute right-4 bottom-3.5 text-xs text-(--text-3)">
            {description.length} / {MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-sm font-extrabold">카테고리</div>
        <div className="flex gap-2.5 flex-wrap">
          {CATEGORY_FILTERS.map((name) => {
            const active = category === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={cn(
                  "px-5.5 py-2.5 rounded-full text-sm font-bold cursor-pointer border-[1.5px]",
                  active
                    ? "bg-(--bg-hero) border-(--brand-yellow)"
                    : "bg-(--bg-card) border-(--border-1)",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-sm font-extrabold">찬성 / 반대 입장 라벨</div>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-(--text-2)">
              찬성 라벨
            </span>
            <div className="relative">
              <input
                value={leftLabel}
                onChange={(e) => setLeftLabel(e.target.value)}
                maxLength={MAX_LABEL_LENGTH}
                className="w-full h-12.5 rounded-xl border border-(--border-1) pr-16 pl-4 text-[15px] font-bold box-border outline-none bg-(--bg-card)"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-(--text-3)">
                {leftLabel.length} / {MAX_LABEL_LENGTH}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-(--text-2)">
              반대 라벨
            </span>
            <div className="relative">
              <input
                value={rightLabel}
                onChange={(e) => setRightLabel(e.target.value)}
                maxLength={MAX_LABEL_LENGTH}
                className="w-full h-12.5 rounded-xl border border-(--border-1) pr-16 pl-4 text-[15px] font-bold box-border outline-none bg-(--bg-card)"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-(--text-3)">
                {rightLabel.length} / {MAX_LABEL_LENGTH}
              </span>
            </div>
          </div>
        </div>
        <div className="text-[13px] text-(--text-3)">
          입장 라벨은 토론 참여자에게 표시됩니다.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-sm font-extrabold">내 입장</div>
        <div className="grid grid-cols-2 gap-5">
          {(
            [
              ["left", leftLabel],
              ["right", rightLabel],
            ] as const
          ).map(([value, label]) => {
            const active = side === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSide(value)}
                className={cn(
                  "flex items-center gap-3 h-16 px-5.5 rounded-2xl cursor-pointer border-[1.5px]",
                  active
                    ? "border-(--brand-yellow) bg-(--bg-hero)"
                    : "border-(--border-1) bg-(--bg-card)",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full border-2 box-border flex items-center justify-center",
                    active ? "border-(--brand-yellow)" : "border-(--border-1)",
                  )}
                >
                  {active && (
                    <span className="w-2.5 h-2.5 rounded-full bg-(--brand-yellow)" />
                  )}
                </span>
                <span className="text-[15px] font-extrabold">
                  {label}(으)로 참여
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-sm font-extrabold">토론 진행 안내</div>
        <div className="bg-(--bg-hero) rounded-2xl p-6 grid grid-cols-[auto_1fr_1fr_1fr] gap-5 items-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-(--brand-yellow) flex items-center justify-center shrink-0">
            <MessageCircle size={22} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] font-bold text-(--text-2)">
              입론 + 반론
            </span>
            <span className="text-[22px] font-black">6분</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-(--border-1)">
            <span className="text-[13px] font-bold text-(--text-2)">
              최종 발언
            </span>
            <span className="text-[22px] font-black">1분</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] font-bold text-(--text-2)">
              총 토론 시간
            </span>
            <span className="text-[22px] font-black">7분</span>
          </div>
        </div>
      </div>

      {error != null && (
        <div className="rounded-xl bg-[#fdecec] text-(--vote-red) text-center text-sm font-bold py-3.5 px-4.5">
          토론방을 만들지 못했어요. 잠시 후 다시 시도해주세요.
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!valid || isPending}
        className={cn(
          "h-15 rounded-2xl text-[17px] font-black font-sans flex items-center justify-center gap-2.5 py-4",
          valid && !isPending
            ? "bg-(--brand-yellow) text-(--brand-on-yellow) cursor-pointer hover:brightness-[0.97]"
            : "bg-(--border-1) text-(--text-3) cursor-not-allowed",
        )}
      >
        <MessageCircle size={20} strokeWidth={2.2} />
        {isPending ? "생성 중..." : "토론방 생성하기"}
      </button>
    </div>
  );
}
