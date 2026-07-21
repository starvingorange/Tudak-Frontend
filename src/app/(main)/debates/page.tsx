import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DebateList } from "@/features/debates/debate-list";

export default function DebatesPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 pt-2 pb-10">
      <div className="border-b border-[var(--border-1)] flex items-end justify-between">
        <div className="py-9">
          <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.5px]">
            토론 목록
          </h1>
          <div className="mt-2 text-[15px] text-[var(--text-2)]">
            다양한 주제로 열려있는 토론방에 참여해보세요!
          </div>
          <Button
            href="/debates/new"
            icon={<MessageCircle size={16} />}
            className="mt-5"
          >
            토론방 만들기
          </Button>
        </div>
        <Image
          src="/assets/stickers/st-pro-speak.png"
          alt="투닭 캐릭터"
          width={150}
          height={150}
          className="h-[150px] w-auto mr-10"
        />
      </div>
      <DebateList />
    </div>
  );
}
