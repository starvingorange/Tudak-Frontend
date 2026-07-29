import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const ROW_CLASS =
  "flex items-center gap-3.5 w-full px-7 py-4.5 text-left border-b border-(--border-1) last:border-b-0 hover:bg-(--bg-hero) cursor-pointer";

interface MenuRowProps {
  icon: ReactNode;
  label: string;
  trailing?: string;
  /** Pass `href` for a navigation row (gets a chevron), or `onClick` for an
   * action row that opens a dialog instead of going somewhere. */
  href?: string;
  onClick?: () => void;
}

export function MenuRow({
  icon,
  label,
  trailing,
  href,
  onClick,
}: MenuRowProps) {
  const content = (
    <>
      <span className="text-(--text-2) shrink-0">{icon}</span>
      <span className="flex-1 text-[15px] font-bold">{label}</span>
      {trailing && (
        <span className="text-sm font-bold text-(--text-2)">{trailing}</span>
      )}
      {href && <ChevronRight size={18} className="text-(--text-3) shrink-0" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={ROW_CLASS}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      {content}
    </button>
  );
}
