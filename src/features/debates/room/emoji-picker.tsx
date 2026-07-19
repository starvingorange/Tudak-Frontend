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
    <div className="absolute bottom-[78px] left-4 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-2xl p-4 w-[392px] box-border shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
      <div className="text-[13px] font-extrabold text-[var(--text-2)] mb-2.5">
        이모티콘 보내기
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {STICKERS.map(([sticker, label]) => (
          <button
            key={sticker}
            type="button"
            title={label}
            onClick={() => onSend(sticker)}
            className="border-none bg-transparent rounded-[10px] p-1.5 cursor-pointer flex items-center justify-center h-14 hover:bg-[var(--bg-hero)]"
          >
            <Image
              src={`/assets/stickers/${sticker}.png`}
              alt={label}
              width={46}
              height={46}
              className="max-h-[46px] max-w-full block"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
