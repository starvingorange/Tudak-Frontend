"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { useGetCheck } from "@/api/notification/hooks/useGetCheck";
import { useDismissableOpen } from "@/lib/use-dismissable-open";
import { useIsLoggedIn } from "@/stores/auth-store";
import { NotificationPanel } from "./notification-panel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useDismissableOpen<HTMLDivElement>(open, setOpen);
  const loggedIn = useIsLoggedIn();

  const { data } = useGetCheck({ query: { enabled: loggedIn } });
  const hasUnread = data?.data?.notificationExist ?? false;

  return (
    <div ref={ref} className="relative flex">
      <button
        type="button"
        aria-label="알림"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex w-6 h-6 items-center justify-center text-(--text-1) cursor-pointer"
      >
        <Bell size={22} strokeWidth={2} />
        {hasUnread && (
          <span className="absolute -top-px -right-px w-2 h-2 rounded-full bg-(--noti-dot) border-2 border-(--bg-surface)" />
        )}
      </button>
      {open && <NotificationPanel />}
    </div>
  );
}
