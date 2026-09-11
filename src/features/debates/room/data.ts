export interface DebaterState {
  name: string;
  sticker: string;
  /** 대기방에서 넘어온 프로필 사진 presigned URL — 없으면(미업로드 유저)
   * 캐릭터 일러스트로 대체 표시한다. */
  imageUrl: string | null;
  statement: string;
  remainingLabel: string;
  remainingPercent: number;
  speaking: boolean;
  /** Card should render dimmed (opponent's turn, actively underway) —
   * defaults to `!speaking` when omitted. Kept separate from `speaking` so a
   * "neither side has started yet" moment (e.g. a pre-turn countdown) can
   * show both cards neutral instead of one dimmed by default. */
  dimmed?: boolean;
}

export interface TranscriptMessage {
  side: "pro" | "con";
  name: string;
  time: string;
  text: string;
}
