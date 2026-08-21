import Image from "next/image";
import { VoteList } from "@/features/votes/vote-list";

export default function VotesPage() {
  return (
    <div className="mx-auto max-w-295 px-3 pt-3 pb-10 sm:px-4 sm:pt-2">
      <div className="flex flex-row items-start justify-between gap-2">
        <div className="py-5 sm:py-9">
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.5px] sm:text-[32px]">
            투표 목록
          </h1>
          <div className="mt-2 text-sm leading-relaxed text-(--text-2) sm:text-[15px]">
            다양한 주제로 진행 중인 투표를 확인하고 참여해보세요!
          </div>
        </div>
        <Image
          src="/assets-characters/com-idea.webp"
          alt="투닭 캐릭터"
          width={150}
          height={150}
          sizes="(max-width: 639px) 96px, 150px"
          className="mr-0 h-24 w-24 self-end object-contain sm:mr-10 sm:h-37.5 sm:w-37.5"
        />
      </div>
      <VoteList />
    </div>
  );
}
