import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-[var(--bg-hero)] rounded-[var(--radius-hero)] overflow-hidden h-[330px]">
      <Image
        src="/assets/hero-light.png"
        alt="투닭 캐릭터"
        width={420}
        height={330}
        className="absolute right-0 bottom-0 h-full w-auto block dark:hidden"
      />
      <Image
        src="/assets/hero-dark.png"
        alt="투닭 캐릭터"
        width={420}
        height={330}
        className="absolute right-0 bottom-0 h-full w-auto hidden dark:block"
      />
      <div className="relative z-[1] pt-[38px] pl-[68px] max-w-[420px]">
        <div className="relative w-[216px] h-[52px]">
          <Image
            src="/assets/logo-hero-light.png"
            alt="투닭"
            fill
            className="object-contain object-left dark:hidden"
          />
          <Image
            src="/assets/logo-hero-dark.png"
            alt="투닭"
            fill
            className="object-contain object-left hidden dark:block"
          />
        </div>
        <div className="text-2xl font-extrabold mt-3.5 tracking-[-0.3px] text-[var(--text-1)]">
          말로 승부하고,{" "}
          <span className="text-[var(--brand-yellow)]">투표</span>로 결정한다!
        </div>
        <div className="mt-4 text-[15px] leading-relaxed text-[var(--text-2)]">
          다양한 주제로 펼쳐지는 실시간 토론!
          <br />
          당신의 목소리가 승부를 바꿉니다.
        </div>
        <Button
          href="/debates"
          icon={<MessageCircle size={16} />}
          className="mt-[22px]"
        >
          토론 참여하기
        </Button>
      </div>
    </section>
  );
}
