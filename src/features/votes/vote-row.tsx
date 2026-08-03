import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { VoteRow as VoteRowData } from "./data";

export function VoteRow({ vote }: { vote: VoteRowData }) {
  return (
    <Link
      href={`/debates/${vote.id}`}
      className="flex flex-col gap-4 rounded-(--radius-card) border border-(--border-1) px-4 py-4 hover:border-[var(--brand-yellow)] sm:px-6.5 sm:py-5 lg:flex-row lg:items-center lg:gap-5"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <CategoryBadge category={vote.category} className="shrink-0" />
        <span className="relative inline-block h-11 w-11 shrink-0 sm:h-[46px] sm:w-[46px]">
          <Image
            src={`/assets/stickers/${vote.sticker}.png`}
            alt="캐릭터"
            fill
            sizes="(max-width: 639px) 44px, 46px"
            className="object-contain"
          />
        </span>
        <span className="min-w-0 flex-1 text-[17px] leading-snug font-extrabold tracking-[-0.3px] sm:text-[19px]">
          {vote.title}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-(--border-1) pt-4 sm:gap-4 lg:flex lg:items-center lg:border-t-0 lg:pt-0">
        <span className="flex min-w-0 flex-col gap-1.5 rounded-[12px] bg-[var(--bg-card)] px-3 py-2.5 text-center lg:w-[110px] lg:bg-transparent lg:px-0 lg:py-0">
          <span className="text-[13px] font-bold text-[var(--vote-blue)]">
            찬성
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 text-sm text-[var(--text-1)]">
            <Users size={13} className="text-[var(--text-2)]" />
            <span className="truncate">{vote.proName}</span>
          </span>
        </span>
        <span className="flex min-w-0 flex-col gap-1.5 rounded-[12px] bg-[var(--bg-card)] px-3 py-2.5 text-center lg:w-[120px] lg:bg-transparent lg:px-0 lg:py-0">
          <span className="text-[13px] font-bold text-[var(--vote-red)]">
            반대
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 text-sm text-[var(--text-1)]">
            <Users size={13} className="text-[var(--text-2)]" />
            <span className="truncate">{vote.conName}</span>
          </span>
        </span>
        <span className="col-span-2 flex items-center justify-between border-t border-(--border-1) pt-3 lg:col-span-1 lg:w-px lg:h-9 lg:border-t-0 lg:bg-[var(--border-1)] lg:pt-0">
          <span className="text-xs font-bold text-[var(--text-3)] lg:hidden">
            참여 인원
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-1)] lg:w-[78px] lg:justify-end">
            <Users size={16} className="text-[var(--text-2)]" />
            {vote.participantCount}명
          </span>
        </span>
        <span className="hidden text-sm font-extrabold text-[var(--text-2)] lg:block">
          VS
        </span>
      </div>
    </Link>
  );
}
