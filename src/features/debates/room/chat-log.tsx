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
      className="w-13 h-13 rounded-full border border-(--border-1) shrink-0 bg-(--bg-hero)"
    />
  );
  const meta = (
    <div className={`flex items-center gap-2 ${isPro ? "" : "justify-end"}`}>
      {isPro && (
        <span className="text-[15px] font-extrabold">{message.name}</span>
      )}
      {isPro && (
        <span
          className="text-white text-[11px] font-bold px-2.25 py-0.75 rounded-(--radius-pill)"
          style={{ background: color }}
        >
          찬성
        </span>
      )}
      <span className="text-[12.5px] text-[#909090]">{message.time}</span>
      {!isPro && (
        <span
          className="text-white text-[11px] font-bold px-2.25 py-0.75 rounded-(--radius-pill)"
          style={{ background: color }}
        >
          반대
        </span>
      )}
      {!isPro && (
        <span className="text-[15px] font-extrabold">{message.name}</span>
      )}
    </div>
  );
  const bubble = (
    <div
      className="px-4 py-3.25 text-[15px] leading-relaxed whitespace-pre-line"
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
      className={`flex gap-3.5 items-start max-w-[56%] ${isPro ? "" : "ml-auto justify-end"}`}
    >
      {isPro && avatar}
      <div className={`flex flex-col gap-2 ${isPro ? "" : "items-end"}`}>
        {meta}
        <div className="flex items-center gap-2.5">
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
    <section className="bg-(--bg-card) border border-(--border-1) rounded-2xl mt-6 p-[26px_28px] flex flex-col gap-6.5">
      {messages.map((message) => (
        <ChatBubble
          key={`${message.side}-${message.time}-${message.text.slice(0, 8)}`}
          message={message}
        />
      ))}
    </section>
  );
}
