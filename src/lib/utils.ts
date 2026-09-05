import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 백엔드가 필드에 따라 raw ISO 타임스탬프("2026-09-08T00:49:35.313826")와
// 이미 사람이 읽을 수 있는 라벨("D-3")을 섞어서 내려주는 경우가 있어서,
// 파싱 가능한 값만 "yyyy.MM.dd"로 다듬고 나머지는 그대로 보여준다.
export function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
