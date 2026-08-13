import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMyVotes } from "@/features/mypage/data";
import { VoteRow } from "@/features/votes/vote-row";
import { ROUTES } from "@/lib/routes";

export default function MyVotesPage() {
  const votes = getMyVotes();

  return (
    <div className="max-w-241 mx-auto px-4 pt-2 pb-10">
      <div className="flex items-start justify-between">
        <div className="py-9">
          <Link
            href={ROUTES.MY_PAGE()}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-(--text-2) hover:text-(--text-1)"
          >
            <ArrowLeft size={16} />
            마이페이지
          </Link>
          <h1 className="m-0 mt-3 text-[32px] font-extrabold tracking-[-0.5px]">
            참여한 투표
          </h1>
          <div className="mt-2 text-[15px] text-(--text-2)">
            내가 참여한 투표의 진행 상황을 확인해보세요!
          </div>
        </div>
        <Image
          src="/assets/stickers/st-com-read.png"
          alt="투닭 캐릭터"
          width={175}
          height={148}
          priority
          className="w-37.5 h-37.5 object-contain mr-10"
        />
      </div>

      {votes.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {votes.map((vote) => (
            <VoteRow key={vote.id} vote={vote} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-(--border-1) rounded-(--radius-section) py-14 text-center text-[15px] text-(--text-2)">
          아직 참여한 투표가 없어요.
        </div>
      )}
    </div>
  );
}
