"use client";

import {
  Gamepad2,
  Grid2x2,
  Heart,
  MoreHorizontal,
  Palette,
  ScrollText,
  Trophy,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  dropdownItemClass,
  dropdownPanelClass,
  dropdownTriggerClass,
} from "@/components/ui/dropdown-styles";
import { useDismissableOpen } from "@/lib/use-dismissable-open";
import { LIST_FILTER_CATEGORIES, type ListFilter } from "./categories";

const TAB_ICONS: Record<ListFilter, React.ElementType> = {
  전체: Grid2x2,
  시사: ScrollText,
  연애: Heart,
  스포츠: Trophy,
  게임: Gamepad2,
  문화: Palette,
  기타: MoreHorizontal,
};

const CANDIDATES: ListFilter[] = ["전체", ...LIST_FILTER_CATEGORIES];
const MOBILE_GAP_PX = 8;
const DESKTOP_GAP_PX = 12; // matches sm:gap-3 below

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
      const gapPx = window.innerWidth < 640 ? MOBILE_GAP_PX : DESKTOP_GAP_PX;
      const widths = measureRefs.current.map(
        (el) => el?.getBoundingClientRect().width ?? 0,
      );
      const totalWidth = widths.reduce(
        (sum, w, i) => sum + w + (i > 0 ? gapPx : 0),
        0,
      );

      if (totalWidth <= containerWidth) {
        setVisibleCount(CANDIDATES.length);
        return;
      }

      const moreWidth =
        moreMeasureRef.current?.getBoundingClientRect().width ?? 0;
      const budget = containerWidth - moreWidth - gapPx;
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + widths[i] + (i > 0 ? gapPx : 0);
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
        className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-hidden -z-10"
      >
        <div className="flex w-max gap-2 opacity-0 sm:gap-3">
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
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
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
              <div className={`${dropdownPanelClass} left-0 min-w-40`}>
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
