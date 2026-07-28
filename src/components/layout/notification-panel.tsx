import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  sticker: string;
  body: ReactNode;
  time: string;
  unread: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    sticker: "st-con-basic",
    body: (
      <>
        <strong>치킨왕</strong>님이 반대 측으로 참여했어요 —{" "}
        <strong>"주 4일 근무제, 도입해야 할까?"</strong>
      </>
    ),
    time: "방금 전",
    unread: true,
  },
  {
    id: "2",
    sticker: "st-com-idea",
    body: (
      <>
        참여한 토론에 투표가 열렸어요 —{" "}
        <strong>"청년 기본소득, 지급해야 할까?"</strong> (마감 D-3)
      </>
    ),
    time: "1시간 전",
    unread: true,
  },
  {
    id: "3",
    sticker: "st-com-win",
    body: (
      <>
        투표 결과가 나왔어요 — <strong>"민트초코는 디저트인가?"</strong> 찬성
        56% 승리!
      </>
    ),
    time: "어제",
    unread: false,
  },
  {
    id: "4",
    sticker: "st-com-read",
    body: "신고 처리 완료 — 접수됐던 신고가 처리되어 해당 사용자에게 조치했어요.",
    time: "2일 전",
    unread: false,
  },
];

export function NotificationPanel() {
  return (
    <div className="absolute top-full right-0 mt-4 w-[380px] bg-(--bg-card) border border-(--border-1) rounded-(--radius-section) shadow-[0_10px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-(--border-1)">
        <span className="text-[15px] font-extrabold text-(--text-1)">알림</span>
        <button
          type="button"
          className="border-none bg-transparent cursor-pointer text-[12.5px] font-bold text-(--text-3)"
        >
          모두 읽음
        </button>
      </div>
      <div className="flex flex-col">
        {NOTIFICATIONS.map((n) => (
          <Link
            key={n.id}
            href="#"
            className={cn(
              "flex gap-3 px-5 py-3.5 border-b border-(--divider)",
              n.unread && "bg-(--bg-unread)",
            )}
          >
            <Image
              src={`/assets/stickers/${n.sticker}.png`}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 object-contain shrink-0"
            />
            <div className="min-w-0">
              <div
                className={cn(
                  "text-[13.5px] leading-relaxed",
                  n.unread ? "text-(--text-1)" : "text-(--text-2)",
                )}
              >
                {n.body}
              </div>
              <div className="text-xs text-(--text-3) mt-1">{n.time}</div>
            </div>
            {n.unread && (
              <span className="w-[7px] h-[7px] rounded-full bg-(--noti-dot) shrink-0 mt-1.5" />
            )}
          </Link>
        ))}
      </div>
      <Link
        href="#"
        className="block text-center py-3.5 border-t border-(--border-1) text-[13px] font-bold text-(--text-3)"
      >
        알림 전체 보기
      </Link>
    </div>
  );
}
