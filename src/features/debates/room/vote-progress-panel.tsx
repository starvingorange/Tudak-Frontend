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
    <div className="mt-5 flex justify-center">
      <div className="box-border w-140 max-w-full rounded-xl border border-(--border-1) bg-(--bg-card) p-[16px_18px_18px] sm:p-[16px_28px_18px]">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[15px] font-extrabold">투표 결과</span>
        </div>
        <div className="flex h-2.5 rounded-(--radius-poll) overflow-hidden mt-3.5">
          <span
            className="bg-(--vote-blue)"
            style={{ width: `${proPercent}%` }}
          />
          <span
            className="bg-(--vote-red)"
            style={{ width: `${conPercent}%` }}
          />
        </div>
        <div className="mt-2.5 flex justify-between">
          <span className="text-[18px] font-extrabold text-(--vote-blue) sm:text-[19px]">
            {proPercent}%
          </span>
          <span className="text-[18px] font-extrabold text-(--vote-red) sm:text-[19px]">
            {conPercent}%
          </span>
        </div>
        <div className="mt-0.5 flex justify-between gap-4 text-[12px] sm:text-[13px]">
          <span className="text-(--vote-blue)">
            찬성 {proVotes.toLocaleString()}명
          </span>
          <span className="text-(--text-2)">
            반대 {conVotes.toLocaleString()}명
          </span>
        </div>
      </div>
    </div>
  );
}

function Stepper() {
  return (
    <div className="mt-5 flex justify-center">
      <div className="grid w-full max-w-180 grid-cols-2 gap-3 rounded-xl border border-(--border-1) bg-(--bg-card) p-4 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:gap-3.5 sm:p-[14px_28px]">
        {STEPS.map((step, i) => {
          return (
            <div key={step} className="flex items-center gap-2.5 sm:gap-3.5">
              {i > 0 && (
                <span className="hidden text-xs tracking-[2px] text-[#d8d5cf] sm:inline">
                  ------
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-6.5 h-6.5 rounded-full text-[13px] font-extrabold inline-flex items-center justify-center"
                  style={
                    i === 0
                      ? { background: "var(--vote-blue)", color: "#fff" }
                      : { background: "#efedea", color: "#8b8b8b" }
                  }
                >
                  {i + 1}
                </span>
                <span
                  className={`text-[15px] ${i === 0 ? "font-extrabold text-(--vote-blue)" : "font-semibold text-[#8b8b8b]"}`}
                >
                  {step}
                </span>
              </span>
            </div>
          );
        })}
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
