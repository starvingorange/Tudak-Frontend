import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { VoteRow as VoteRowData } from "./data";

export function VoteRow({ vote }: { vote: VoteRowData }) {
  return (
    <Link
      href={`/debates/${vote.id}`}
      className="flex items-center gap-5 border border-(--border-1) rounded-(--radius-card) px-6.5 py-5 hover:border-[var(--brand-yellow)]"
    >
      <CategoryBadge category={vote.category} className="shrink-0" />
      <span className="relative inline-block w-[46px] h-[46px] shrink-0">
        <Image
          src={`/assets/stickers/${vote.sticker}.png`}
          alt="캐릭터"
          fill
          sizes="46px"
          className="object-contain"
        />
      </span>
      <span className="flex-1 text-[19px] font-extrabold tracking-[-0.3px] min-w-0">
        {vote.title}
      </span>
      <span className="flex flex-col gap-1.5 items-center w-[110px]">
        <span className="text-[13px] font-bold text-[var(--vote-blue)]">
          찬성
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-1)]">
          <Users size={13} className="text-[var(--text-2)]" />
          {vote.proName}
        </span>
      </span>
      <span className="text-sm font-extrabold text-[var(--text-2)]">VS</span>
      <span className="flex flex-col gap-1.5 items-center w-[120px]">
        <span className="text-[13px] font-bold text-[var(--vote-red)]">
          반대
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-1)]">
          <Users size={13} className="text-[var(--text-2)]" />
          {vote.conName}
        </span>
      </span>
      <span className="w-px h-9 bg-[var(--border-1)]" />
      <span className="inline-flex items-center gap-2 text-sm font-bold w-[78px] justify-end text-[var(--text-1)]">
        <Users size={16} className="text-[var(--text-2)]" />
        {vote.participantCount}명
      </span>
    </Link>
  );
}
