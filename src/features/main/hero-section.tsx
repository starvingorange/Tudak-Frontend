import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-(--radius-hero) bg-(--bg-hero) min-h-[25rem] sm:h-82.5 sm:min-h-0">
      <Image
        src="/assets/hero-light.png"
        alt="투닭 캐릭터"
        width={526}
        height={330}
        priority
        sizes="(max-width: 639px) 200px, 526px"
        style={{ width: "auto" }}
        className="absolute right-[-1.5rem] bottom-0 h-[11.5rem] w-auto block dark:hidden sm:right-0 sm:h-full"
      />
      <Image
        src="/assets/hero-dark.png"
        alt="투닭 캐릭터"
        width={526}
        height={330}
        sizes="(max-width: 639px) 200px, 526px"
        style={{ width: "auto" }}
        className="absolute right-[-1.5rem] bottom-0 h-[11.5rem] w-auto hidden dark:block sm:right-0 sm:h-full"
      />
      <div className="relative z-1 flex min-h-[25rem] max-w-[17rem] flex-col px-5 pt-6 pb-40 sm:block sm:min-h-0 sm:max-w-105 sm:pt-9.5 sm:pl-17 sm:pr-0 sm:pb-0">
        <div className="relative h-11 w-42 sm:h-13 sm:w-54">
          <Image
            src="/assets/logo-hero-light.png"
            alt="투닭"
            fill
            sizes="(max-width: 639px) 168px, 216px"
            className="object-contain object-left dark:hidden"
          />
          <Image
            src="/assets/logo-hero-dark.png"
            alt="투닭"
            fill
            sizes="(max-width: 639px) 168px, 216px"
            className="object-contain object-left hidden dark:block"
          />
        </div>
        <div className="mt-3 text-[1.75rem] leading-tight font-extrabold tracking-[-0.3px] text-(--text-1) sm:mt-3.5 sm:text-2xl">
          말로 승부하고, <span className="text-(--brand-yellow)">투표</span>로
          결정한다!
        </div>
        <div className="mt-3 text-sm leading-relaxed text-(--text-2) sm:mt-4 sm:text-[15px]">
          다양한 주제로 펼쳐지는 실시간 토론!
          <br />
          당신의 목소리가 승부를 바꿉니다.
        </div>
        <Button
          href={ROUTES.DEBATES()}
          icon={<MessageCircle size={16} />}
          className="mt-5 w-fit sm:mt-5.5"
        >
          토론 참여하기
        </Button>
      </div>
    </section>
  );
}
