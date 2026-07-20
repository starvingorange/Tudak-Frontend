import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatLog } from "@/features/debates/room/chat-log";
import { ControlBar } from "@/features/debates/room/control-bar";
import { getDebateRoomDetail } from "@/features/debates/room/data";
import { DebaterCard } from "@/features/debates/room/debater-card";
import { SpectatorVote } from "@/features/debates/room/spectator-vote";
import { VoteProgressPanel } from "@/features/debates/room/vote-progress-panel";

export default async function DebateRoomPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;
  const room = getDebateRoomDetail(debateId);
  if (!room) notFound();

  return (
    <div className="max-w-[1180px] mx-auto px-4 pt-5 pb-10">
      <div className="relative flex items-center justify-center min-h-[52px]">
        <Link
          href="/debates"
          className="absolute left-0 inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-[10px] px-[18px] py-[11px] text-sm font-bold"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          나가기
        </Link>
        <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.3px]">
          {room.question}
        </h1>
      </div>

      <VoteProgressPanel
        voteEnded={room.voteEnded}
        proVotes={room.proVotes}
        conVotes={room.conVotes}
      />

      <div className="grid grid-cols-[1fr_88px_1fr] items-center mt-[22px] gap-x-0">
        <DebaterCard side="pro" debater={room.pro} />
        <div className="flex justify-center">
          <span className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-1)] inline-flex items-center justify-center text-xl font-extrabold">
            VS
          </span>
        </div>
        <DebaterCard side="con" debater={room.con} />
      </div>

      <ChatLog messages={room.transcript} />

      {room.voteEnded && room.pro && room.con && (
        <SpectatorVote
          proName={room.pro.name}
          proTagline={room.pro.statement.replace("\n", " ")}
          conName={room.con.name}
          conTagline={room.con.statement.replace("\n", " ")}
        />
      )}

      <ControlBar myTurn={room.myTurn} />
    </div>
  );
}
