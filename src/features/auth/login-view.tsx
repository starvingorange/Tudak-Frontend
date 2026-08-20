"use client";

import Image from "next/image";
import { useState } from "react";
import { getGoogleAuthorizeUrl } from "@/lib/google";
import { getKakaoAuthorizeUrl } from "@/lib/kakao";

function KakaoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="absolute left-5"
      aria-hidden="true"
    >
      <path
        fill="#191919"
        d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1.2 4.4c-.1.4.3.7.6.5l5.2-3.5c.2 0 .5.1.7.1 5.5 0 10-3.5 10-7.9S17.5 3 12 3z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="absolute left-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.1-6.9-5.1L1.2 17C3.1 21.1 7.2 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.1 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.2 6.7C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3l3.9-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.3-3.2C18 1.3 15.2 0 12 0 7.2 0 3.1 2.9 1.2 6.7l3.9 3c.9-2.9 3.7-5 6.9-5z"
      />
    </svg>
  );
}

export function LoginView() {
  const [status, setStatus] = useState<"idle" | "redirecting" | "error">(
    "idle",
  );

  const loginWithKakao = () => {
    const authorizeUrl = getKakaoAuthorizeUrl();

    if (!authorizeUrl) {
      setStatus("error");
      return;
    }

    setStatus("redirecting");
    window.location.assign(authorizeUrl);
  };

  const loginWithGoogle = () => {
    const authorizeUrl = getGoogleAuthorizeUrl();

    if (!authorizeUrl) {
      setStatus("error");
      return;
    }

    setStatus("redirecting");
    window.location.assign(authorizeUrl);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-5.5">
        <Image
          src="/assets/mascot-megaphone.webp"
          alt="투닭 마스코트"
          width={196}
          height={192}
          className="w-[170px] h-auto object-contain"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-[140px] h-[52px]">
            <Image
              src="/assets/logo/logo-light.svg"
              alt="투닭"
              fill
              sizes="140px"
              className="object-contain"
            />
          </div>
          <div className="text-[17px] font-bold text-[var(--text-2)] whitespace-nowrap">
            말로 승부하고,{" "}
            <span className="text-[var(--brand-yellow)]">투표</span>로 결정한다!
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 w-[360px] max-w-[90vw]">
        <button
          type="button"
          onClick={loginWithKakao}
          disabled={status === "redirecting"}
          className="relative flex h-14 w-full items-center justify-center rounded-2xl bg-[#FEE500] text-base font-extrabold text-[#191919] cursor-pointer hover:brightness-[0.97]"
        >
          <KakaoIcon />
          카카오로 시작하기
        </button>

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={status === "redirecting"}
          className="relative flex h-14 w-full items-center justify-center rounded-2xl border border-[var(--border-1)] bg-[var(--bg-card)] text-base font-extrabold text-[var(--text-1)] cursor-pointer hover:brightness-[0.97]"
        >
          <GoogleIcon />
          구글로 시작하기
        </button>

        <div className="text-center text-[13px] text-[var(--text-3)] leading-relaxed mt-1.5">
          가입 시{" "}
          <button type="button" className="font-bold text-[var(--text-2)]">
            이용약관
          </button>{" "}
          및{" "}
          <button type="button" className="font-bold text-[var(--text-2)]">
            개인정보처리방침
          </button>
          에 동의하게 됩니다
        </div>
      </div>
    </>
  );
}
