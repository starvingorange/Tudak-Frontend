// 백엔드가 내려주는 sticker id는 여전히 "st-" 접두사가 붙은 값(예: st-pro-basic)이라
// 파일명(캐릭터 설명 단어만 남긴 pro-basic 등)으로 변환이 필요함.
export function getStickerSrc(sticker: string) {
  return `/assets-characters/${sticker.replace(/^st-/, "")}.webp`;
}
