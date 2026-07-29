"use client";

interface LogoutModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ onClose, onConfirm }: LogoutModalProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role="presentation" backdrop with click-outside-to-close is a standard modal pattern; every real control inside the dialog is a proper button.
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-(--bg-card) rounded-2xl w-95 max-w-[92vw] p-[30px_30px_26px] box-border"
      >
        <div className="text-xl font-extrabold tracking-[-0.3px]">
          로그아웃하시겠어요?
        </div>
        <div className="mt-2.5 text-sm text-(--text-2)">
          언제든 다시 로그인할 수 있어요.
        </div>
        <div className="flex gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-(--border-1) bg-(--bg-card) text-(--text-1) text-sm font-bold py-3.25 rounded-(--radius-button) cursor-pointer hover:border-[#c9c5bd]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-(--brand-yellow) text-(--brand-on-yellow) text-sm font-extrabold py-3.25 rounded-(--radius-button) cursor-pointer hover:brightness-105"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
