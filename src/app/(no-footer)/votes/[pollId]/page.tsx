import { PollDetailView } from "@/features/votes/detail/poll-detail-view";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ pollId: string }>;
}) {
  const { pollId } = await params;

  return <PollDetailView pollId={pollId} />;
}
