import Image from "next/image";
import { CreateDebateButton } from "@/features/debates/create/create-debate-button";
import { DebateList } from "@/features/debates/debate-list";

export default function DebatesPage() {
  return (
    <div className="mx-auto max-w-295 px-3 pt-3 pb-10 sm:px-4 sm:pt-2">
      <div className="flex flex-row items-start justify-between gap-2">
        <div className="py-5 sm:py-9">
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.5px] sm:text-[32px]">
            토론 목록
          </h1>
          <div className="mt-2 text-sm leading-relaxed text-(--text-2) sm:text-[15px]">
            다양한 주제로 열려있는 토론방에 참여해보세요!
          </div>
          <CreateDebateButton />
        </div>
        <Image
          src="/assets-characters/pro-speak.webp"
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
