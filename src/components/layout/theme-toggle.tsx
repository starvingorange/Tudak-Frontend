"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid a hydration mismatch: next-themes only knows the real theme client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label="다크 모드 전환"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative w-6 h-6 text-[var(--text-1)] inline-flex items-center justify-center cursor-pointer"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
