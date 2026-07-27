"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

export function ProfileSetupView() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  const trimmedLength = nickname.trim().length;
  const valid =
    trimmedLength >= MIN_NICKNAME_LENGTH &&
    trimmedLength <= MAX_NICKNAME_LENGTH;
  const hint =
    nickname.length === 0
      ? "2~12자, 한글·영문·숫자를 쓸 수 있어요."
      : valid
        ? "사용할 수 있는 닉네임이에요!"
        : "2자 이상 입력해주세요.";

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  };

  const submit = () => {
    if (!valid) return;
    router.push("/");
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3.5">
        <div className="relative w-[140px] h-[52px]">
          <Image
            src="/assets/logo-hero-light.png"
            alt="투닭"
            fill
            sizes="140px"
            className="object-contain dark:hidden"
          />
          <Image
            src="/assets/logo-hero-dark.png"
            alt="투닭"
            fill
            sizes="140px"
            className="object-contain hidden dark:block"
          />
        </div>
        <h1 className="text-[26px] font-black tracking-[-0.5px] m-0">
          프로필을 설정해주세요
        </h1>
        <div className="text-[15px] font-semibold text-[var(--text-2)] whitespace-nowrap">
          토론에서 사용할 프로필이에요. 나중에 바꿀 수 있어요.
        </div>
      </div>

      <div className="flex flex-col items-center gap-7 w-[420px] max-w-[90vw] bg-[var(--bg-card)] border border-[var(--border-1)] rounded-3xl p-10 box-border">
        <div className="relative w-[140px] h-[140px]">
          <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-[3px] border-[var(--brand-yellow)] box-border bg-[var(--bg-hero)]">
            <Image
              src={photo ?? "/assets/profile-placeholder.png"}
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
            className="absolute bottom-0.5 right-0.5 w-[38px] h-[38px] rounded-full bg-[var(--brand-yellow)] border-[3px] border-[var(--bg-card)] box-border flex items-center justify-center cursor-pointer"
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
                "w-full h-[54px] rounded-2xl border-[1.5px] pr-[76px] pl-[18px] text-[15px] font-bold box-border bg-[var(--bg-card)] outline-none",
                nickname.length === 0
                  ? "border-[var(--border-1)]"
                  : valid
                    ? "border-[#3BC96B]"
                    : "border-[#FF6B6B]",
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)]">
              {nickname.length} / {MAX_NICKNAME_LENGTH}
            </span>
          </div>
          <div
            className={cn(
              "text-[13px] min-h-[18px]",
              nickname.length === 0
                ? "text-[var(--text-3)]"
                : valid
                  ? "text-[#1F9D55]"
                  : "text-[var(--brand-yellow)]",
            )}
          >
            {hint}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          className={cn(
            "w-full h-14 rounded-2xl text-base font-black font-sans",
            valid
              ? "bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] cursor-pointer hover:brightness-[0.97]"
              : "bg-[var(--border-1)] text-[var(--text-3)] cursor-not-allowed",
          )}
        >
          투닭 시작하기
        </button>
      </div>
    </>
  );
}
