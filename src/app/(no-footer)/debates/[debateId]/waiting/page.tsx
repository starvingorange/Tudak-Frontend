import { notFound } from "next/navigation";
import { getWaitingRoomInfo } from "@/features/debates/waiting/data";
import { WaitingRoomView } from "@/features/debates/waiting/waiting-room-view";

export default async function DebateWaitingPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;
  const room = getWaitingRoomInfo(debateId);
  if (!room) notFound();

  return <WaitingRoomView room={room} />;
}
