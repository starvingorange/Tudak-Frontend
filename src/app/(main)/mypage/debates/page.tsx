import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMyCompletedDebates } from "@/features/mypage/data";
import { MyDebateRow } from "@/features/mypage/my-debate-row";

export default function MyDebatesPage() {
  const debates = getMyCompletedDebates();

  return (
    <div className="max-w-241 mx-auto px-4 pt-2 pb-10">
      <div className="flex items-start justify-between">
        <div className="py-9">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-(--text-2) hover:text-(--text-1)"
          >
            <ArrowLeft size={16} />
            마이페이지
          </Link>
          <h1 className="m-0 mt-3 text-[32px] font-extrabold tracking-[-0.5px]">
            참여한 토론
          </h1>
          <div className="mt-2 text-[15px] text-(--text-2)">
            내가 참여했던 토론의 결과를 다시 확인해보세요!
          </div>
        </div>
        <Image
          src="/assets/stickers/st-com-win.png"
          alt="투닭 캐릭터"
          width={200}
          height={160}
          priority
          className="w-37.5 h-37.5 object-contain mr-10"
        />
      </div>

      {debates.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {debates.map((debate) => (
            <MyDebateRow key={debate.id} debate={debate} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-(--border-1) rounded-(--radius-section) py-14 text-center text-[15px] text-(--text-2)">
          아직 종료된 토론이 없어요.
        </div>
      )}
    </div>
  );
}
