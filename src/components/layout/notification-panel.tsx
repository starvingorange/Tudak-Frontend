"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getCheckQueryKey } from "@/api/notification/hooks/useGetCheck";
import {
  getView1QueryKey,
  useGetView1,
} from "@/api/notification/hooks/useGetView1";
import { usePatchRead } from "@/api/notification/hooks/usePatchRead";
import { usePatchReadAll } from "@/api/notification/hooks/usePatchReadAll";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

// noticeDateTime의 초/밀리초 단위가 스펙 example에 없어서 밀리초로 가정함 —
// 실제로 보이는 값이 몇 년씩 어긋나면 1000을 곱하도록 고쳐야 함.
function formatNoticeTime(epochMs?: number) {
  if (!epochMs) return "";
  const diffMin = Math.floor((Date.now() - epochMs) / 60_000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

export function NotificationPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetView1({
    pageable: { page: 0, size: PAGE_SIZE },
  });
  const notifications = data?.data?.content ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getView1QueryKey() });
    queryClient.invalidateQueries({ queryKey: getCheckQueryKey() });
  };

  const { mutate: markRead } = usePatchRead({
    mutation: { onSuccess: invalidate },
  });
  const { mutate: markAllRead, isPending: markingAllRead } = usePatchReadAll({
    mutation: { onSuccess: invalidate },
  });

  return (
    <div className="absolute top-full right-0 mt-3 w-[min(380px,calc(100vw-24px))] max-w-[calc(100vw-24px)] overflow-hidden rounded-(--radius-section) border border-(--border-1) bg-(--bg-card) shadow-[0_10px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.4)] sm:mt-4 sm:max-w-none">
      <div className="flex items-center justify-between border-b border-(--border-1) px-4 py-3.5 sm:px-5 sm:py-4">
        <span className="text-[15px] font-extrabold text-(--text-1)">알림</span>
        <button
          type="button"
          onClick={() => markAllRead()}
          disabled={markingAllRead || notifications.length === 0}
          className="border-none bg-transparent cursor-pointer text-[12.5px] font-bold text-(--text-3) disabled:cursor-not-allowed disabled:opacity-50"
        >
          모두 읽음
        </button>
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-[13px] text-(--text-3)">
            불러오는 중...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-(--text-3)">
            새 알림이 없어요
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.notificationId}
              type="button"
              onClick={() => {
                if (!n.isRead && n.notificationId !== undefined) {
                  markRead(n.notificationId);
                }
              }}
              className={cn(
                "flex w-full gap-3 border-b border-(--divider) px-4 py-3 text-left sm:px-5 sm:py-3.5",
                !n.isRead && "bg-(--bg-unread)",
              )}
            >
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-[13px] leading-relaxed sm:text-[13.5px]",
                    n.isRead ? "text-(--text-2)" : "text-(--text-1)",
                  )}
                >
                  {n.message}
                </div>
                <div className="text-xs text-(--text-3) mt-1">
                  {formatNoticeTime(n.noticeDateTime)}
                </div>
              </div>
              {!n.isRead && (
                <span className="w-1.75 h-1.75 rounded-full bg-(--noti-dot) shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
