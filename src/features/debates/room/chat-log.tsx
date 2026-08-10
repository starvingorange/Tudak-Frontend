import Image from "next/image";
import type { TranscriptMessage } from "./data";

function ChatBubble({ message }: { message: TranscriptMessage }) {
  const isPro = message.side === "pro";
  const color = isPro ? "var(--vote-blue)" : "var(--vote-red)";
  const tint = isPro ? "#eef1fd" : "#fdecec";
  const avatar = (
    <Image
      src={`/assets/avatar-${message.side}.png`}
      alt={message.name}
      width={52}
      height={52}
      className="h-10 w-10 shrink-0 rounded-full border border-(--border-1) bg-(--bg-hero) sm:h-13 sm:w-13"
    />
  );
  const meta = (
    <div
      className={`flex flex-wrap items-center gap-2 ${isPro ? "" : "justify-start sm:justify-end"}`}
    >
      {isPro && (
        <span className="text-sm font-extrabold sm:text-[15px]">
          {message.name}
        </span>
      )}
      {isPro && (
        <span
          className="text-white text-[11px] font-bold px-2.25 py-0.75 rounded-(--radius-pill)"
          style={{ background: color }}
        >
          찬성
        </span>
      )}
      <span className="text-[12px] text-[#909090] sm:text-[12.5px]">
        {message.time}
      </span>
      {!isPro && (
        <span
          className="text-white text-[11px] font-bold px-2.25 py-0.75 rounded-(--radius-pill)"
          style={{ background: color }}
        >
          반대
        </span>
      )}
      {!isPro && (
        <span className="text-sm font-extrabold sm:text-[15px]">
          {message.name}
        </span>
      )}
    </div>
  );
  const bubble = (
    <div
      className="px-3.5 py-3 text-[14px] leading-relaxed whitespace-pre-line sm:px-4 sm:py-3.25 sm:text-[15px]"
      style={{
        // Fixed dark text: this tint is always a light pastel in both themes,
        // so it can't use the theme's (theme-flipping) --text-1 color.
        background: tint,
        color: "#1a1a1a",
        borderRadius: isPro ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
      }}
    >
      {message.text}
    </div>
  );

  return (
    <div
      className={`flex max-w-[92%] items-start gap-2.5 sm:max-w-[72%] lg:max-w-[56%] ${isPro ? "" : "ml-auto justify-end"}`}
    >
      {isPro && avatar}
      <div
        className={`flex min-w-0 flex-col gap-2 ${isPro ? "" : "items-end"}`}
      >
        {meta}
        <div className="flex items-center gap-2">
          {isPro ? (
            bubble
          ) : (
            <>
              <PlaybackButton color={color} />
              {bubble}
            </>
          )}
          {isPro && <PlaybackButton color={color} />}
        </div>
      </div>
      {!isPro && avatar}
    </div>
  );
}

function PlaybackButton({ color }: { color: string }) {
  return (
    <button
      type="button"
      title="음성 다시 듣기"
      className="w-8.5 h-8.5 rounded-full border border-(--border-1) bg-(--bg-card) inline-flex items-center justify-center cursor-pointer shrink-0"
      style={{ color }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <title>음성 다시 듣기</title>
        <path d="M7 4.5v15l13-7.5Z" />
      </svg>
    </button>
  );
}

export function ChatLog({ messages }: { messages: TranscriptMessage[] }) {
  return (
    <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-(--border-1) bg-(--bg-card) p-4 sm:gap-6.5 sm:p-[26px_28px]">
      {messages.map((message) => (
        <ChatBubble
          key={`${message.side}-${message.time}-${message.text.slice(0, 8)}`}
          message={message}
        />
      ))}
    </section>
  );
}
