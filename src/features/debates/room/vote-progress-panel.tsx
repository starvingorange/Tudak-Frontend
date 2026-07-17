const STEPS = ["입론", "반론", "재반론", "최종결론"];

function VoteResultBanner({
  proVotes,
  conVotes,
}: {
  proVotes: number;
  conVotes: number;
}) {
  const total = proVotes + conVotes;
  const proPercent = total === 0 ? 50 : Math.round((proVotes / total) * 100);
  const conPercent = 100 - proPercent;

  return (
    <div className="flex justify-center mt-5">
      <div className="bg-[var(--bg-card)] border border-[var(--border-1)] rounded-xl p-[16px_28px_18px] w-[560px] max-w-full box-border">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[15px] font-extrabold">투표 결과</span>
        </div>
        <div className="flex h-[10px] rounded-[var(--radius-poll)] overflow-hidden mt-3.5">
          <span
            className="bg-[var(--vote-blue)]"
            style={{ width: `${proPercent}%` }}
          />
          <span
            className="bg-[var(--vote-red)]"
            style={{ width: `${conPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2.5">
          <span className="text-[19px] font-extrabold text-[var(--vote-blue)]">
            {proPercent}%
          </span>
          <span className="text-[19px] font-extrabold text-[var(--vote-red)]">
            {conPercent}%
          </span>
        </div>
        <div className="flex justify-between mt-0.5 text-[13px]">
          <span className="text-[var(--vote-blue)]">
            찬성 {proVotes.toLocaleString()}명
          </span>
          <span className="text-[var(--text-2)]">
            반대 {conVotes.toLocaleString()}명
          </span>
        </div>
      </div>
    </div>
  );
}

function Stepper() {
  return (
    <div className="flex justify-center mt-5">
      <div className="flex items-center gap-3.5 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-xl p-[14px_28px]">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-3.5">
            {i > 0 && (
              <span className="text-[#d8d5cf] text-xs tracking-[2px]">
                ------
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <span
                className="w-[26px] h-[26px] rounded-full text-[13px] font-extrabold inline-flex items-center justify-center"
                style={
                  i === 0
                    ? { background: "var(--vote-blue)", color: "#fff" }
                    : { background: "#efedea", color: "#8b8b8b" }
                }
              >
                {i + 1}
              </span>
              <span
                className={`text-[15px] ${i === 0 ? "font-extrabold text-[var(--vote-blue)]" : "font-semibold text-[#8b8b8b]"}`}
              >
                {step}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface VoteProgressPanelProps {
  voteEnded: boolean;
  proVotes: number;
  conVotes: number;
}

export function VoteProgressPanel({
  voteEnded,
  proVotes,
  conVotes,
}: VoteProgressPanelProps) {
  return voteEnded ? (
    <VoteResultBanner proVotes={proVotes} conVotes={conVotes} />
  ) : (
    <Stepper />
  );
}
