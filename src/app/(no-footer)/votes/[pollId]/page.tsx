import { getPollDetail } from "@/features/votes/detail/data";
import { PollDetailView } from "@/features/votes/detail/poll-detail-view";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ pollId: string }>;
}) {
  const { pollId } = await params;
  const poll = getPollDetail(pollId);

  return <PollDetailView poll={poll} />;
}
