import Image from "next/image";
import { VoteList } from "@/features/votes/vote-list";

export default function VotesPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 pt-2 pb-10">
      <div className="border-b border-[var(--border-1)] flex items-end justify-between">
        <div className="py-9">
          <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.5px]">
            투표 목록
          </h1>
          <div className="mt-2 text-[15px] text-[var(--text-2)]">
            다양한 주제로 진행 중인 투표를 확인하고 참여해보세요!
          </div>
        </div>
        <Image
          src="/assets/stickers/st-com-idea.png"
          alt="투닭 캐릭터"
          width={175}
          height={158}
          priority
          style={{ width: "auto" }}
          className="h-[150px] mr-10"
        />
      </div>
      <VoteList />
    </div>
  );
}
