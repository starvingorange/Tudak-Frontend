import { WaitingRoomView } from "@/features/debates/waiting/waiting-room-view";

export default async function DebateWaitingPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;

  return <WaitingRoomView debateId={debateId} />;
}
