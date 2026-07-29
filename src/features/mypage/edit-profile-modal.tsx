"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

interface EditProfileModalProps {
  nickname: string;
  photo: string | null;
  onClose: () => void;
  onSave: (nickname: string, photo: string | null) => void;
}

export function EditProfileModal({
  nickname: initialNickname,
  photo: initialPhoto,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState(initialPhoto);
  const [nickname, setNickname] = useState(initialNickname);

  const trimmedLength = nickname.trim().length;
  const valid =
    trimmedLength >= MIN_NICKNAME_LENGTH &&
    trimmedLength <= MAX_NICKNAME_LENGTH;
  // Real availability can only be confirmed by the backend on save, so this
  // hint only ever flags an invalid format — it never claims a name is free.
  const hint =
    nickname.length === 0
      ? "2~12자, 한글·영문·숫자를 쓸 수 있어요."
      : valid
        ? ""
        : "2자 이상 입력해주세요.";

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  };

  const save = () => {
    if (!valid) return;
    onSave(nickname.trim(), photo);
  };

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
        className="bg-(--bg-card) rounded-3xl w-105 max-w-[92vw] p-9 box-border flex flex-col items-center gap-6"
      >
        <div className="w-full flex items-center justify-between">
          <div className="text-xl font-extrabold tracking-[-0.3px]">
            프로필 수정
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="border-none bg-transparent cursor-pointer text-[#909090] p-1 leading-none hover:text-(--text-1)"
          >
            ✕
          </button>
        </div>

        <div className="relative w-35 h-35">
          <div className="w-35 h-35 rounded-full overflow-hidden border-3 border-(--brand-yellow) box-border bg-(--bg-hero)">
            <Image
              src={photo ?? "/assets/avatar.png"}
              alt="프로필 사진"
              width={140}
              height={140}
              className="w-full h-full object-cover"
              unoptimized={photo !== null}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로필 사진 변경"
            className="absolute bottom-0.5 right-0.5 w-9.5 h-9.5 rounded-full bg-(--brand-yellow) border-3 border-(--bg-card) box-border flex items-center justify-center cursor-pointer"
          >
            <Camera size={17} strokeWidth={2} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <div className="text-sm font-extrabold">닉네임</div>
          <div className="relative">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="닉네임을 입력해주세요"
              className={cn(
                "w-full h-13.5 rounded-2xl border-[1.5px] pr-19 pl-4.5 text-[15px] font-bold box-border bg-(--bg-card) outline-none",
                !valid && nickname.length > 0
                  ? "border-[#FF6B6B]"
                  : "border-(--border-1)",
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-(--text-3)">
              {nickname.length} / {MAX_NICKNAME_LENGTH}
            </span>
          </div>
          <div
            className={cn(
              "text-[13px] min-h-4.5",
              nickname.length === 0 || valid
                ? "text-(--text-3)"
                : "text-[#FF6B6B]",
            )}
          >
            {hint}
          </div>
        </div>

        <div className="flex gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-(--border-1) bg-(--bg-card) text-(--text-1) text-sm font-bold py-3.25 rounded-(--radius-button) cursor-pointer hover:border-[#c9c5bd]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid}
            className={cn(
              "flex-[1.4] text-sm font-extrabold py-3.25 rounded-(--radius-button)",
              valid
                ? "bg-(--brand-yellow) text-(--brand-on-yellow) cursor-pointer hover:brightness-105"
                : "bg-[#efedea] text-[#a3a09a] cursor-not-allowed",
            )}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
