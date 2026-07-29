"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export function LoginView() {
  const router = useRouter();

  const login = () => {
    router.push("/onboarding");
  };

  return (
    <>
      <div className="flex flex-col items-center gap-[22px]">
        <Image
          src="/assets/mascot-megaphone.png"
          alt="투닭 마스코트"
          width={196}
          height={192}
          className="w-[170px] h-[166px]"
          priority
        />
        <div className="relative w-[180px] h-[76px]">
          <Image
            src="/assets/logo-hero-light.png"
            alt="투닭"
            fill
            sizes="180px"
            className="object-contain dark:hidden"
          />
          <Image
            src="/assets/logo-hero-dark.png"
            alt="투닭"
            fill
            sizes="180px"
            className="object-contain hidden dark:block"
          />
        </div>
        <div className="text-[17px] font-bold text-[var(--text-2)] whitespace-nowrap">
          말로 승부하고,{" "}
          <span className="text-[var(--brand-yellow)]">투표</span>로 결정한다!
        </div>
      </div>

      <div className="flex flex-col gap-3.5 w-[360px] max-w-[90vw]">
        <button
          type="button"
          onClick={login}
          className="relative flex items-center justify-center gap-2.5 h-14 rounded-2xl bg-[#FEE500] text-[#191919] text-base font-extrabold font-sans cursor-pointer hover:brightness-[0.97]"
        >
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
          카카오로 시작하기
        </button>
        <button
          type="button"
          onClick={login}
          className="relative flex items-center justify-center gap-2.5 h-14 rounded-2xl border border-[var(--border-1)] bg-[var(--bg-card)] text-[var(--text-1)] text-base font-extrabold font-sans cursor-pointer hover:bg-[var(--bg-page)]"
        >
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
          구글로 시작하기
        </button>
        <div className="text-center text-[13px] text-[var(--text-3)] mt-1.5 leading-relaxed">
          가입 시{" "}
          <a href="/terms" className="font-bold text-[var(--text-2)]">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="font-bold text-[var(--text-2)]">
            개인정보처리방침
          </a>
          에 동의하게 됩니다
        </div>
      </div>
    </>
  );
}
