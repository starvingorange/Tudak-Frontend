import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { WAITING_ROOMS } from "./data";

export function WaitingRoomsSection() {
  return (
    <section className="bg-[var(--bg-surface)] border border-[var(--border-1)] rounded-[var(--radius-section)] mt-7 p-[24px_28px_26px]">
      <SectionHeader
        icon={<Clock size={18} className="text-[var(--text-1)]" />}
        title="대기 중인 방"
        moreHref="/debates"
      />
      <div className="flex flex-col gap-[10px] mt-[18px]">
        {WAITING_ROOMS.map((room) => (
          <div
            key={room.id}
            className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-[var(--radius-row)] p-[12px_16px]"
          >
            <CategoryBadge category={room.category} className="shrink-0" />
            <span className="flex-1 text-[15px] font-bold">{room.title}</span>
            <span className="inline-flex items-center gap-[7px] text-[13px] text-[var(--text-2)]">
              정원 <Users size={13} />
              <span className="text-sm font-extrabold text-[var(--text-1)]">
                {room.filled} / {room.capacity}
              </span>
            </span>
            <Link
              href={`/debates/${room.id}`}
              className="border-[1.5px] border-[var(--brand-yellow)] text-[var(--btn-outline-fg)] text-[13px] font-extrabold px-[22px] py-2 rounded-[var(--radius-button-sm)] hover:bg-[var(--brand-yellow)] hover:text-[var(--brand-on-yellow)]"
            >
              입장하기
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
