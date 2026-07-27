import Image from "next/image";
import { CreateDebateForm } from "@/features/debates/create/create-debate-form";

export default function NewDebatePage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 pt-6 pb-14 flex flex-col gap-5">
      <div className="flex items-end justify-between gap-6">
        <h1 className="m-0 text-[34px] font-black tracking-[-0.5px] pb-2">
          토론 방 생성
        </h1>
        <Image
          src="/assets/mascot-write.png"
          alt="글 쓰는 투닭"
          width={210}
          height={155}
          priority
          style={{ height: "auto" }}
          className="w-[210px] shrink-0"
        />
      </div>
      <CreateDebateForm />
    </div>
  );
}
