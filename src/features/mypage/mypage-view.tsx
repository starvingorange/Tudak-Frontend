"use client";

import {
  History,
  LogOut,
  MessageCircle,
  Settings,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getMyCompletedDebates, getMyVotes } from "./data";
import { EditProfileModal } from "./edit-profile-modal";
import { LogoutModal } from "./logout-modal";
import { MenuRow } from "./menu-row";

export function MyPageView() {
  const router = useRouter();
  const [nickname, setNickname] = useState("설렘주의");
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const myDebates = getMyCompletedDebates();
  const myVotes = getMyVotes();

  return (
    <div className="max-w-241 mx-auto px-4 pt-2 pb-10">
      <div className="flex items-start justify-between">
        <div className="py-9">
          <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.5px]">
            마이페이지
          </h1>
          <div className="mt-2 text-[15px] text-(--text-2)">
            내 프로필과 지금까지의 활동 내역을 확인해보세요!
          </div>
        </div>
        <Image
          src="/assets/stickers/st-pro-happy.png"
          alt="투닭 캐릭터"
          width={175}
          height={172}
          priority
          className="w-37.5 h-37.5 object-contain mr-10"
        />
      </div>

      <section className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) overflow-hidden">
        <div className="flex items-center gap-6 p-[26px_28px]">
          <Image
            src={photo ?? "/assets/avatar.png"}
            alt="프로필"
            width={88}
            height={88}
            className="w-22 h-22 rounded-full shrink-0 object-cover"
            unoptimized={photo !== null}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-extrabold tracking-[-0.3px]">
              {nickname}
            </div>
            <div className="mt-1.5 text-sm text-(--text-2)">
              토론에서 사용하는 프로필이에요.
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            프로필 수정
          </Button>
        </div>
        <div className="grid grid-cols-2 border-t border-(--border-1) bg-(--bg-hero)">
          <div className="flex flex-col items-center gap-1 py-5">
            <span className="text-[13px] font-bold text-(--text-2)">
              참여한 토론
            </span>
            <span className="text-[22px] font-black">{myDebates.length}건</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-5 border-l border-(--border-1)">
            <span className="text-[13px] font-bold text-(--text-2)">
              참여한 투표
            </span>
            <span className="text-[22px] font-black">{myVotes.length}건</span>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <SectionHeader
          icon={<History size={18} className="text-(--text-1)" />}
          title="활동 내역"
        />
        <div className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) mt-4.5 overflow-hidden">
          <MenuRow
            href="/mypage/debates"
            icon={<MessageCircle size={20} />}
            label="참여한 토론"
            trailing={`${myDebates.length}건`}
          />
          <MenuRow
            href="/mypage/votes"
            icon={<ThumbsUp size={20} />}
            label="참여한 투표"
            trailing={`${myVotes.length}건`}
          />
        </div>
      </section>

      <section className="mt-7">
        <SectionHeader
          icon={<Settings size={18} className="text-(--text-1)" />}
          title="계정"
        />
        <div className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) mt-4.5 overflow-hidden">
          <MenuRow
            icon={<LogOut size={20} />}
            label="로그아웃"
            onClick={() => setLoggingOut(true)}
          />
        </div>
      </section>

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

      {loggingOut && (
        <LogoutModal
          onClose={() => setLoggingOut(false)}
          onConfirm={() => router.push("/login")}
        />
      )}
    </div>
  );
}
