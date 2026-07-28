"use client";

import {
  Cpu,
  Gamepad2,
  Grid2x2,
  Heart,
  MoreHorizontal,
  Palette,
  ScrollText,
  Trophy,
  Users,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  dropdownItemClass,
  dropdownPanelClass,
  dropdownTriggerClass,
} from "@/components/ui/dropdown-styles";
import { useDismissableOpen } from "@/lib/use-dismissable-open";
import { LIST_FILTER_CATEGORIES, type ListFilter } from "./categories";

// Record<ListFilter, ...> must cover every CategorySlug (incl. "학교"), even
// though "학교" is never in LIST_FILTER_CATEGORIES and so never gets a tab.
const TAB_ICONS: Record<ListFilter, React.ElementType> = {
  전체: Grid2x2,
  시사: ScrollText,
  연애: Heart,
  사회: Users,
  스포츠: Trophy,
  게임: Gamepad2,
  문화: Palette,
  과학기술: Cpu,
  학교: Users,
};

const CANDIDATES: ListFilter[] = ["전체", ...LIST_FILTER_CATEGORIES];
const GAP_PX = 12; // matches gap-3 below

interface CategoryTabBarProps {
  active: ListFilter;
  onChange: (value: ListFilter) => void;
}

/**
 * Fits as many category tabs as the row has room for and folds whatever
 * doesn't fit into a "기타" overflow menu — the debates list has room for
 * all of them at typical widths (기타 never renders there), the votes list
 * shares its row with a sort dropdown and consistently needs it.
 */
export function CategoryTabBar({ active, onChange }: CategoryTabBarProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moreMeasureRef = useRef<HTMLButtonElement>(null);
  const [visibleCount, setVisibleCount] = useState(CANDIDATES.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useDismissableOpen<HTMLDivElement>(menuOpen, setMenuOpen);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const recalc = () => {
      const containerWidth = row.clientWidth;
      const widths = measureRefs.current.map(
        (el) => el?.getBoundingClientRect().width ?? 0,
      );
      const totalWidth = widths.reduce(
        (sum, w, i) => sum + w + (i > 0 ? GAP_PX : 0),
        0,
      );

      if (totalWidth <= containerWidth) {
        setVisibleCount(CANDIDATES.length);
        return;
      }

      const moreWidth =
        moreMeasureRef.current?.getBoundingClientRect().width ?? 0;
      const budget = containerWidth - moreWidth - GAP_PX;
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + widths[i] + (i > 0 ? GAP_PX : 0);
        if (next > budget && i > 0) break;
        used = next;
        count = i + 1;
      }
      setVisibleCount(Math.max(1, count));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  const visible = CANDIDATES.slice(0, visibleCount);
  const overflow = CANDIDATES.slice(visibleCount);
  const isOverflowActive = overflow.includes(active);

  return (
    <div ref={rowRef} className="relative">
      {/* Ghost row: same buttons, invisible, used only to measure natural widths. */}
      <div
        aria-hidden
        className="absolute top-0 left-0 flex gap-3 invisible pointer-events-none -z-10"
      >
        {CANDIDATES.map((tab, i) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              type="button"
              tabIndex={-1}
              ref={(el) => {
                measureRefs.current[i] = el;
              }}
              className={dropdownTriggerClass(false)}
            >
              <Icon size={16} />
              {tab}
            </button>
          );
        })}
        <button
          type="button"
          tabIndex={-1}
          ref={moreMeasureRef}
          className={dropdownTriggerClass(false)}
        >
          <MoreHorizontal size={16} />
          기타
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        {visible.map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={dropdownTriggerClass(tab === active)}
            >
              <Icon size={16} />
              {tab}
            </button>
          );
        })}

        {overflow.length > 0 && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={dropdownTriggerClass(isOverflowActive || menuOpen)}
            >
              <MoreHorizontal size={16} />
              {isOverflowActive ? active : "기타"}
            </button>
            {menuOpen && (
              <div className={`${dropdownPanelClass} left-0 min-w-[160px]`}>
                {overflow.map((tab) => {
                  const Icon = TAB_ICONS[tab];
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        onChange(tab);
                        setMenuOpen(false);
                      }}
                      className={dropdownItemClass(tab === active)}
                    >
                      <Icon size={15} />
                      {tab}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
