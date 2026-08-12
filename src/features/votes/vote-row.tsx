import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import { getStoredAccessToken } from "@/lib/auth";
import type { VoteRow as VoteRowData } from "./data";

interface VoteRowProps {
  vote: VoteRowData;
  onRequireLogin?: () => void;
}

export function VoteRow({ vote, onRequireLogin }: VoteRowProps) {
  return (
    <Link
      href={`/debates/${vote.id}`}
      onClick={(e) => {
        if (!getStoredAccessToken()) {
          e.preventDefault();
          onRequireLogin?.();
        }
      }}
      className="flex flex-col gap-3 rounded-(--radius-card) border border-(--border-1) px-3.5 py-3.5 hover:border-[var(--brand-yellow)] sm:px-6.5 sm:py-5 sm:gap-4 lg:flex-row lg:items-center lg:gap-5"
    >
      <div className="flex items-start gap-3 sm:items-center sm:gap-4 lg:flex-1 lg:items-center lg:gap-3">
        <span className="relative mt-0.5 inline-block h-10 w-10 shrink-0 sm:mt-0 sm:h-[46px] sm:w-[46px] lg:order-2">
          <Image
            src={`/assets/stickers/${vote.sticker}.png`}
            alt="캐릭터"
            fill
            sizes="(max-width: 639px) 40px, 46px"
            className="object-contain"
          />
        </span>
        <div className="min-w-0 flex-1 lg:contents">
          <CategoryBadge
            category={vote.category}
            className="mb-2 px-2.5 py-1 text-[11px] sm:mb-0 sm:px-3 sm:py-1.25 sm:text-xs lg:order-1 lg:mb-0 lg:shrink-0 lg:self-center"
          />
          <span className="block min-w-0 truncate text-[16px] leading-snug font-extrabold tracking-[-0.3px] sm:text-[19px] lg:order-3 lg:min-w-0 lg:flex-1">
            {vote.title}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 border-t border-(--border-1) pt-3 sm:gap-4 sm:pt-4 lg:flex lg:items-center lg:border-t-0 lg:pt-0">
        <span className="flex min-w-0 flex-col gap-1 rounded-[12px] bg-[var(--bg-page)] px-2.5 py-2 text-center lg:w-[110px] lg:bg-transparent lg:px-0 lg:py-0">
          <span className="text-[13px] font-bold text-[var(--vote-blue)]">
            찬성
          </span>
          <span className="inline-flex items-center justify-center gap-1 text-[13px] text-[var(--text-1)] sm:gap-1.5 sm:text-sm">
            <Users size={12} className="text-[var(--text-2)] sm:size-[13px]" />
            <span className="truncate">{vote.proName}</span>
          </span>
        </span>
        <span className="hidden text-sm font-extrabold text-[var(--text-2)] lg:block">
          VS
        </span>
        <span className="flex min-w-0 flex-col gap-1 rounded-[12px] bg-[var(--bg-page)] px-2.5 py-2 text-center lg:w-[120px] lg:bg-transparent lg:px-0 lg:py-0">
          <span className="text-[13px] font-bold text-[var(--vote-red)]">
            반대
          </span>
          <span className="inline-flex items-center justify-center gap-1 text-[13px] text-[var(--text-1)] sm:gap-1.5 sm:text-sm">
            <Users size={12} className="text-[var(--text-2)] sm:size-[13px]" />
            <span className="truncate">{vote.conName}</span>
          </span>
        </span>
        <span className="hidden lg:block lg:h-9 lg:w-px lg:bg-(--border-1)" />
        <span className="col-span-2 flex items-center justify-between border-t border-(--border-1) pt-2.5 lg:col-span-1 lg:w-[78px] lg:justify-end lg:border-t-0 lg:pt-0">
          <span className="text-[11px] font-bold text-[var(--text-3)] lg:hidden">
            참여 인원
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-1)] sm:gap-2 sm:text-sm">
            <Users size={14} className="text-[var(--text-2)] sm:size-[16px]" />
            {vote.participantCount}명
          </span>
        </span>
      </div>
    </Link>
  );
}
