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
    <div className="mx-auto max-w-295 px-4 pt-4 pb-8 sm:pt-5 sm:pb-10">
      <div className="relative flex min-h-13 flex-col items-start gap-3 sm:items-center sm:justify-center">
        <Link
          href="/debates"
          className="inline-flex items-center gap-2 rounded-[10px] border border-(--border-1) bg-(--bg-card) px-4 py-2.5 text-sm font-bold sm:absolute sm:left-0 sm:px-4.5 sm:py-2.75"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          나가기
        </Link>
        <h1 className="m-0 text-left text-2xl font-extrabold tracking-[-0.3px] sm:text-center sm:text-[28px]">
          {room.question}
        </h1>
      </div>

      <VoteProgressPanel
        voteEnded={room.voteEnded}
        proVotes={room.proVotes}
        conVotes={room.conVotes}
      />

      <div className="mt-5.5 grid items-center gap-4 md:grid-cols-[1fr_88px_1fr] md:gap-x-0">
        <DebaterCard side="pro" debater={room.pro} />
        <div className="flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--border-1) bg-(--bg-card) text-lg font-extrabold sm:h-16 sm:w-16 sm:text-xl">
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
