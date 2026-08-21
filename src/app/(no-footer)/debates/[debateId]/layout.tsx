import { DebateCallProvider } from "@/features/debates/shared/debate-call-provider";

export default async function DebateSessionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ debateId: string }>;
}) {
  const { debateId } = await params;

  return (
    <DebateCallProvider debateId={debateId}>{children}</DebateCallProvider>
  );
}
