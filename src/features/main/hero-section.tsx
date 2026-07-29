import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-(--bg-hero) rounded-(--radius-hero) overflow-hidden h-82.5">
      <Image
        src="/assets/hero-light.png"
        alt="투닭 캐릭터"
        width={526}
        height={330}
        priority
        style={{ width: "auto" }}
        className="absolute right-0 bottom-0 h-full block dark:hidden"
      />
      <Image
        src="/assets/hero-dark.png"
        alt="투닭 캐릭터"
        width={526}
        height={330}
        style={{ width: "auto" }}
        className="absolute right-0 bottom-0 h-full hidden dark:block"
      />
      <div className="relative z-1 pt-9.5 pl-17 max-w-105">
        <div className="relative w-54 h-13">
          <Image
            src="/assets/logo-hero-light.png"
            alt="투닭"
            fill
            sizes="216px"
            className="object-contain object-left dark:hidden"
          />
          <Image
            src="/assets/logo-hero-dark.png"
            alt="투닭"
            fill
            sizes="216px"
            className="object-contain object-left hidden dark:block"
          />
        </div>
        <div className="text-2xl font-extrabold mt-3.5 tracking-[-0.3px] text-(--text-1)">
          말로 승부하고, <span className="text-(--brand-yellow)">투표</span>로
          결정한다!
        </div>
        <div className="mt-4 text-[15px] leading-relaxed text-(--text-2)">
          다양한 주제로 펼쳐지는 실시간 토론!
          <br />
          당신의 목소리가 승부를 바꿉니다.
        </div>
        <Button
          href="/debates"
          icon={<MessageCircle size={16} />}
          className="mt-5.5"
        >
          토론 참여하기
        </Button>
      </div>
    </section>
  );
}
