import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { VoteRow as VoteRowData } from "./data";

export function VoteRow({ vote }: { vote: VoteRowData }) {
  return (
    <Link
      href={`/debates/${vote.id}`}
      className="flex items-center gap-5 border border-[var(--border-1)] rounded-[var(--radius-card)] px-[26px] py-5 hover:border-[var(--brand-yellow)]"
    >
      <CategoryBadge category={vote.category} className="shrink-0" />
      <Image
        src={`/assets/stickers/${vote.sticker}.png`}
        alt="캐릭터"
        width={46}
        height={46}
        className="h-[46px] w-auto"
      />
      <span className="flex-1 text-[19px] font-extrabold tracking-[-0.3px] min-w-0">
        {vote.title}
      </span>
      <span className="flex flex-col gap-1.5 items-start w-[110px]">
        <span className="text-[13px] font-bold text-[var(--vote-blue)]">
          찬성
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Users size={13} className="text-[var(--text-2)]" />
          {vote.proName}
        </span>
      </span>
      <span className="text-sm font-extrabold text-[var(--text-2)]">VS</span>
      <span className="flex flex-col gap-1.5 items-start w-[120px]">
        <span className="text-[13px] font-bold text-[var(--vote-red)]">
          반대
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm">
          <Users size={13} className="text-[var(--text-2)]" />
          {vote.conName}
        </span>
      </span>
      <span className="w-px h-9 bg-[var(--border-1)]" />
      <span className="inline-flex items-center gap-2 text-sm font-bold w-[78px] justify-end">
        <Users size={16} className="text-[var(--text-2)]" />
        {vote.participantCount}명
      </span>
    </Link>
  );
}
