import { notFound } from "next/navigation";
import { getDebateResult } from "@/features/debates/result/data";
import { ResultView } from "@/features/debates/result/result-view";

export default async function DebateResultPage({
  params,
}: {
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;
  const result = getDebateResult(debateId);
  if (!result) notFound();

  return <ResultView result={result} />;
}
