import { DebateRoomView } from "@/features/debates/room/debate-room-view";

export default async function DebateRoomPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;

  return <DebateRoomView debateId={debateId} />;
}
