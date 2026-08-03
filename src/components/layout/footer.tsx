import { Camera, MessageCircle, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_FILTERS } from "@/features/shared/categories";

const SERVICE_LINKS = ["이용약관", "개인정보처리방침", "신고하기", "문의하기"];

export function Footer() {
  return (
    <footer className="mt-14 px-3 sm:mt-20 sm:px-2">
      <div className="mx-auto grid max-w-[964px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[150px_1fr_200px_200px_140px] sm:gap-6 items-start">
        <div className="relative h-[96px] w-[96px] sm:h-[130px] sm:w-[130px]">
          <Image
            src="/assets/footer-chick-light.png"
            alt="투닭 캐릭터"
            fill
            sizes="(max-width: 639px) 96px, 130px"
            className="object-contain dark:hidden"
          />
          <Image
            src="/assets/footer-chick-dark.png"
            alt="투닭 캐릭터"
            fill
            sizes="(max-width: 639px) 96px, 130px"
            className="object-contain hidden dark:block"
          />
        </div>
        <div>
          <div className="relative h-9 w-[72px]">
            <Image
              src="/assets/logo-footer-light2.png"
              alt="투닭"
              fill
              sizes="72px"
              className="object-contain object-left dark:hidden"
            />
            <Image
              src="/assets/logo-footer-dark2.png"
              alt="투닭"
              fill
              sizes="72px"
              className="object-contain object-left hidden dark:block"
            />
          </div>
          <div className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-[var(--text-2)]">
            당신의 말이 세상을 바꿀 수도 있습니다.
            <br />
            토론하고, 투표하고, 함께 결정해요!
          </div>
        </div>
        <div>
          <div className="text-sm font-extrabold mb-3.5">서비스</div>
          <div className="flex flex-col gap-[11px] text-[13.5px]">
            {SERVICE_LINKS.map((label) => (
              <Link key={label} href="#" className="text-[var(--text-2)]">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-extrabold mb-3.5">카테고리</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-[11px] text-[13.5px]">
            {CATEGORY_FILTERS.map((label) => (
              <Link key={label} href="#" className="text-[var(--text-2)]">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-extrabold mb-3.5">팔로우</div>
          <div className="flex gap-3.5 items-center text-[var(--text-label)]">
            <Camera size={22} />
            <Video size={21} />
            <MessageCircle size={21} />
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-[var(--border-1)] py-6 text-center text-[13px] text-[var(--text-3)] sm:py-7">
        © 2025 투닭. All rights reserved.
      </div>
    </footer>
  );
}
