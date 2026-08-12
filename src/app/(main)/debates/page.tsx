import { Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DebateList } from "@/features/debates/debate-list";
import { ROUTES } from "@/lib/routes";

export default function DebatesPage() {
  return (
    <div className="mx-auto max-w-295 px-3 pt-3 pb-10 sm:px-4 sm:pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="py-5 sm:py-9">
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.5px] sm:text-[32px]">
            토론 목록
          </h1>
          <div className="mt-2 text-sm leading-relaxed text-(--text-2) sm:text-[15px]">
            다양한 주제로 열려있는 토론방에 참여해보세요!
          </div>
          <Button
            href={ROUTES.createDebate()}
            icon={<Plus size={20} />}
            className="mt-4 w-fit sm:mt-5"
          >
            토론방 만들기
          </Button>
        </div>
        <Image
          src="/assets/stickers/st-pro-speak.png"
          alt="투닭 캐릭터"
          width={150}
          height={150}
          sizes="(max-width: 639px) 104px, 150px"
          className="mr-0 h-26 w-26 self-end object-contain sm:mr-10 sm:h-37.5 sm:w-37.5"
        />
      </div>
      <DebateList />
    </div>
  );
}
