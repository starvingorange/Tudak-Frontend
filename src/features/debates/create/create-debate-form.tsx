"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  CATEGORY_FILTERS,
  type CategorySlug,
} from "@/features/shared/categories";
import { cn } from "@/lib/utils";

const MAX_TOPIC_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LABEL_LENGTH = 10;

type Side = "left" | "right";

export function CreateDebateForm() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategorySlug>("사회");
  const [leftLabel, setLeftLabel] = useState("찬성");
  const [rightLabel, setRightLabel] = useState("반대");
  const [side, setSide] = useState<Side>("left");
  const [created, setCreated] = useState(false);

  const submit = () => {
    if (!topic.trim()) return;
    setCreated(true);
    setTimeout(() => setCreated(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-3xl p-9">
      <div className="flex flex-col gap-2.5">
        <div className="text-sm font-extrabold">토론 주제</div>
        <div className="relative">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={MAX_TOPIC_LENGTH}
            placeholder="토론 주제를 입력해주세요"
            className="w-full h-14 rounded-2xl border border-[var(--border-1)] pr-[76px] pl-[18px] text-[15px] box-border bg-[var(--bg-card)] outline-none"
          />
          <span className="absolute right-4 bottom-2.5 text-xs text-[var(--text-3)]">
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
            className="w-full h-[140px] rounded-2xl border border-[var(--border-1)] p-[16px_18px_28px] text-[15px] box-border bg-[var(--bg-card)] leading-relaxed resize-none outline-none"
          />
          <span className="absolute right-4 bottom-3.5 text-xs text-[var(--text-3)]">
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
                  "px-[22px] py-2.5 rounded-full text-sm font-bold cursor-pointer border-[1.5px]",
                  active
                    ? "bg-[var(--bg-hero)] border-[var(--brand-yellow)]"
                    : "bg-[var(--bg-card)] border-[var(--border-1)]",
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
            <span className="text-[13px] font-bold text-[var(--text-2)]">
              찬성 라벨
            </span>
            <div className="relative">
              <input
                value={leftLabel}
                onChange={(e) => setLeftLabel(e.target.value)}
                maxLength={MAX_LABEL_LENGTH}
                className="w-full h-[50px] rounded-xl border border-[var(--border-1)] pr-16 pl-4 text-[15px] font-bold box-border outline-none bg-[var(--bg-card)]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)]">
                {leftLabel.length} / {MAX_LABEL_LENGTH}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[var(--text-2)]">
              반대 라벨
            </span>
            <div className="relative">
              <input
                value={rightLabel}
                onChange={(e) => setRightLabel(e.target.value)}
                maxLength={MAX_LABEL_LENGTH}
                className="w-full h-[50px] rounded-xl border border-[var(--border-1)] pr-16 pl-4 text-[15px] font-bold box-border outline-none bg-[var(--bg-card)]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)]">
                {rightLabel.length} / {MAX_LABEL_LENGTH}
              </span>
            </div>
          </div>
        </div>
        <div className="text-[13px] text-[var(--text-3)]">
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
                  "flex items-center gap-3 h-16 px-[22px] rounded-2xl cursor-pointer border-[1.5px]",
                  active
                    ? "border-[var(--brand-yellow)] bg-[var(--bg-hero)]"
                    : "border-[var(--border-1)] bg-[var(--bg-card)]",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full border-2 box-border flex items-center justify-center",
                    active
                      ? "border-[var(--brand-yellow)]"
                      : "border-[var(--border-1)]",
                  )}
                >
                  {active && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-yellow)]" />
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
        <div className="bg-[var(--bg-hero)] rounded-2xl p-6 grid grid-cols-[auto_1fr_1fr_1fr] gap-5 items-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-[var(--brand-yellow)] flex items-center justify-center shrink-0">
            <MessageCircle size={22} strokeWidth={2.2} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] font-bold text-[var(--text-2)]">
              입론 + 반론
            </span>
            <span className="text-[22px] font-black">6분</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-[var(--border-1)]">
            <span className="text-[13px] font-bold text-[var(--text-2)]">
              최종 발언
            </span>
            <span className="text-[22px] font-black">1분</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] font-bold text-[var(--text-2)]">
              총 토론 시간
            </span>
            <span className="text-[22px] font-black">7분</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        className="h-15 rounded-2xl bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] text-[17px] font-black font-sans cursor-pointer flex items-center justify-center gap-2.5 py-4 hover:brightness-[0.97]"
      >
        <MessageCircle size={20} strokeWidth={2.2} />
        토론방 생성하기
      </button>
      {created && (
        <div className="rounded-xl bg-[#E7F8EE] text-[#1F9D55] text-center text-sm font-bold py-3.5 px-4.5">
          토론방이 생성되었습니다! 🎉
        </div>
      )}
    </div>
  );
}
