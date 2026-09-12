import { ResultView } from "@/features/debates/result/result-view";

export default async function DebateResultPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;

  return <ResultView debateId={debateId} />;
}
