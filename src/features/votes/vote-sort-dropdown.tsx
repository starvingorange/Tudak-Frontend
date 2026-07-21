"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  dropdownItemClass,
  dropdownPanelClass,
  dropdownTriggerClass,
} from "@/components/ui/dropdown-styles";
import { useDismissableOpen } from "@/lib/use-dismissable-open";
import { cn } from "@/lib/utils";
import { VOTE_SORT_OPTIONS } from "./data";

type SortOption = (typeof VOTE_SORT_OPTIONS)[number];

interface VoteSortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function VoteSortDropdown({ value, onChange }: VoteSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useDismissableOpen<HTMLDivElement>(open, setOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(dropdownTriggerClass(open), "w-full justify-between")}
      >
        {value}
        <ChevronDown
          size={14}
          className={cn(
            "text-(--text-2) transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className={`${dropdownPanelClass} left-0 right-0`}>
          {VOTE_SORT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={dropdownItemClass(option === value)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
