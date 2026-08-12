"use client";

import Link from "next/link";

interface LoginRequiredModalProps {
  onClose: () => void;
  description?: string;
}

export function LoginRequiredModal({
  onClose,
  description = "로그인하면 투표와 토론에 참여할 수 있어요.",
}: LoginRequiredModalProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role="presentation" backdrop with click-outside-to-close is a standard modal pattern; every real control inside the dialog is a proper button/link.
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="box-border w-full max-w-[92vw] rounded-2xl bg-(--bg-card) p-5 sm:w-95 sm:p-[30px_30px_26px]"
      >
        <div className="text-lg font-extrabold tracking-[-0.3px] sm:text-xl">
          로그인이 필요해요
        </div>
        <div className="mt-2.5 text-sm text-(--text-2)">{description}</div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-(--border-1) bg-(--bg-card) text-(--text-1) text-sm font-bold py-3.25 rounded-(--radius-button) cursor-pointer hover:border-[#c9c5bd]"
          >
            취소
          </button>
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center bg-(--brand-yellow) text-(--brand-on-yellow) text-sm font-extrabold py-3.25 rounded-(--radius-button) cursor-pointer no-underline hover:brightness-105"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
