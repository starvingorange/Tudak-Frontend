"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "./edit-profile-modal";

export function MyPageView() {
  const [nickname, setNickname] = useState("설렘주의");
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-250 mx-auto px-4 py-10 flex flex-col gap-6">
      <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.5px]">
        마이페이지
      </h1>

      <div className="bg-(--bg-card) border border-(--border-1) rounded-2xl p-8 flex items-center gap-6">
        <Image
          src={photo ?? "/assets/avatar.png"}
          alt="프로필"
          width={88}
          height={88}
          className="rounded-full shrink-0 object-cover"
          unoptimized={photo !== null}
        />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="text-xl font-extrabold">{nickname}</div>
          <div className="text-sm text-(--text-2)">
            토론에서 사용하는 프로필이에요.
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditing(true)}>
          프로필 수정
        </Button>
      </div>

      <Link
        href="/debates"
        className="text-sm font-bold text-(--text-2) hover:text-(--text-1)"
      >
        ← 홈으로 돌아가기
      </Link>

      {editing && (
        <EditProfileModal
          nickname={nickname}
          photo={photo}
          onClose={() => setEditing(false)}
          onSave={(nextNickname, nextPhoto) => {
            setNickname(nextNickname);
            setPhoto(nextPhoto);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
