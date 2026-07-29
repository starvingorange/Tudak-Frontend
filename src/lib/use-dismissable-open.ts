"use client";

import { useEffect, useRef } from "react";

/**
 * Closes an open flag when clicking outside the returned ref's element, or
 * on Escape. `setOpen` must be a stable setter (e.g. useState's) — it's a
 * dependency of the effect.
 */
export function useDismissableOpen<T extends HTMLElement>(
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return ref;
}
