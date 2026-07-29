"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { useDismissableOpen } from "@/lib/use-dismissable-open";
import { NotificationPanel } from "./notification-panel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useDismissableOpen<HTMLDivElement>(open, setOpen);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="알림"
        onClick={() => setOpen((v) => !v)}
        className="relative w-6 h-6 text-(--text-1) cursor-pointer"
      >
        <Bell size={22} strokeWidth={2} />
        <span className="absolute -top-px -right-px w-2 h-2 rounded-full bg-(--noti-dot) border-2 border-(--bg-surface)" />
      </button>
      {open && <NotificationPanel />}
    </div>
  );
}
