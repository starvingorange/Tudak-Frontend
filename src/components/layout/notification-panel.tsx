"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getCheckQueryKey } from "@/api/notification/hooks/useGetCheck";
import {
  getViewQueryKey,
  useGetView,
} from "@/api/notification/hooks/useGetView";
import { usePatchRead } from "@/api/notification/hooks/usePatchRead";
import { usePatchReadAll } from "@/api/notification/hooks/usePatchReadAll";
import { cn } from "@/lib/utils";
import { useIsLoggedIn } from "@/stores/auth-store";

const PAGE_SIZE = 20;

function formatRelativeTime(epochMs: number): string {
  const diffMs = Math.max(0, Date.now() - epochMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "방금 전";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`;
  return `${Math.floor(diffMs / day)}일 전`;
}

export function NotificationPanel() {
  const loggedIn = useIsLoggedIn();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetView(
    { pageable: { page: 0, size: PAGE_SIZE } },
    { query: { enabled: loggedIn } },
  );
  const notifications = data?.data?.content ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getViewQueryKey() });
    queryClient.invalidateQueries({ queryKey: getCheckQueryKey() });
  };

  const readMutation = usePatchRead({ mutation: { onSuccess: invalidate } });
  const readAllMutation = usePatchReadAll({
    mutation: { onSuccess: invalidate },
  });

  return (
    <div className="absolute top-full right-0 mt-3 w-[min(380px,calc(100vw-24px))] max-w-[calc(100vw-24px)] overflow-hidden rounded-(--radius-section) border border-(--border-1) bg-(--bg-card) shadow-[0_10px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.4)] sm:mt-4 sm:max-w-none">
      <div className="flex items-center justify-between border-b border-(--border-1) px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="text-[15px] font-extrabold text-(--text-1)">알림</span>
        <button
          type="button"
          disabled={readAllMutation.isPending}
          onClick={() => readAllMutation.mutate()}
          className="border-none bg-transparent cursor-pointer text-[12.5px] font-bold text-(--text-3) disabled:opacity-50"
        >
          모두 읽음
        </button>
      </div>
      <div className="flex max-h-100 flex-col overflow-y-auto">
        {!loggedIn ? (
          <div className="px-4 py-10 text-center text-[13px] font-bold text-(--text-2)">
            로그인 후 알림을 확인할 수 있어요.
          </div>
        ) : isLoading ? null : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] font-bold text-(--text-2)">
            아직 알림이 없어요
          </div>
        ) : (
          notifications.map((n) => {
            const unread = n.isRead === false;
            return (
              <button
                key={n.notificationId}
                type="button"
                onClick={() => {
                  if (unread && n.notificationId !== undefined) {
                    readMutation.mutate(n.notificationId);
                  }
                }}
                className={cn(
                  "flex gap-3 border-b border-(--divider) px-4 py-3 text-left sm:px-5 sm:py-3.5",
                  unread && "bg-(--bg-unread)",
                )}
              >
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-[13px] leading-relaxed sm:text-[13.5px]",
                      unread ? "text-(--text-1)" : "text-(--text-2)",
                    )}
                  >
                    {n.message}
                  </div>
                  <div className="text-xs text-(--text-3) mt-1">
                    {n.noticeDateTime !== undefined
                      ? formatRelativeTime(n.noticeDateTime)
                      : ""}
                  </div>
                </div>
                {unread && (
                  <span className="w-1.75 h-1.75 rounded-full bg-(--noti-dot) shrink-0 mt-1.5" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
