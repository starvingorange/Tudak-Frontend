import Image from "next/image";

const STICKERS: [string, string][] = [
  ["st-pro-basic", "찬성!"],
  ["st-pro-think", "생각 중"],
  ["st-pro-speak", "내 말 좀"],
  ["st-pro-conf", "자신 있음"],
  ["st-pro-happy", "기뻐요"],
  ["st-pro-typing", "입력 중"],
  ["st-con-basic", "반대!"],
  ["st-con-think", "흠…"],
  ["st-con-speak", "그건 아니지"],
  ["st-con-conf", "어디 한번"],
  ["st-con-angry", "화나요"],
  ["st-con-typing", "입력 중"],
  ["st-com-read", "공부해볼게"],
  ["st-com-idea", "좋은 생각!"],
  ["st-com-surprise", "놀람"],
  ["st-com-sad", "슬픔"],
  ["st-com-win", "승리"],
  ["st-com-lose", "패배"],
];

export function EmojiPicker({ onSend }: { onSend: (sticker: string) => void }) {
  return (
    <div className="absolute bottom-[calc(100%+12px)] left-0 box-border w-[min(392px,calc(100vw-32px))] max-w-[calc(100vw-32px)] rounded-2xl border border-[var(--border-1)] bg-[var(--bg-card)] p-3 shadow-[0_8px_28px_rgba(0,0,0,0.08)] sm:left-4 sm:w-[392px] sm:max-w-none sm:p-4">
      <div className="mb-2.5 text-[13px] font-extrabold text-[var(--text-2)]">
        이모티콘 보내기
      </div>
      <div className="grid grid-cols-4 gap-1.5 min-[420px]:grid-cols-5 sm:grid-cols-6">
        {STICKERS.map(([sticker, label]) => (
          <button
            key={sticker}
            type="button"
            title={label}
            onClick={() => onSend(sticker)}
            className="flex h-13 items-center justify-center rounded-[10px] border-none bg-transparent p-1.5 hover:bg-[var(--bg-hero)] sm:h-14"
          >
            <Image
              src={`/assets/stickers/${sticker}.png`}
              alt={label}
              width={46}
              height={46}
              className="block max-h-10 max-w-full sm:max-h-[46px]"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
