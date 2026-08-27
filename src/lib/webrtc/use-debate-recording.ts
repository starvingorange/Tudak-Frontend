"use client";

import { useEffect, useRef, useState } from "react";
import { type ArgumentSlot, argumentSlotKey } from "./debate-argument-order";

// Safari는 audio/webm을 못 만든다 — 지원하는 첫 타입을 세션 내내 고정해서
// 쓴다(중간에 바뀌면 서브턴마다 다른 컨테이너로 녹음됨).
const CANDIDATE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return (
    CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ??
    null
  );
}

export interface DebateArgumentRecording {
  slot: ArgumentSlot;
  blob: Blob;
  mimeType: string;
}

export interface UseDebateRecordingOptions {
  /** `useDebateAudioCall().localStream` — 그대로 녹음한다. 마이크 mute
   * 구간(`track.enabled === false`)은 무음으로 남을 뿐 녹음 자체는 끊기지
   * 않으므로, 한 서브턴 안에서 여러 번 껐다 켜도 결과물은 하나로 이어진다. */
  localStream: MediaStream | null;
  isMyTurnNow: boolean;
  currentSlot: ArgumentSlot;
}

export interface UseDebateRecordingResult {
  /** 서브턴별 녹음 결과 — 아직 업로드 API 포맷이 정해지지 않아 지금은
   * 로컬에만 쌓아둔다(S3 presigned url 업로드/STT 연동은 백엔드 스펙이
   * 확정된 뒤 별도로 붙인다). key는 `argumentSlotKey`. */
  recordings: Record<string, DebateArgumentRecording>;
  recordingError: string | null;
}

/** 내 서브턴이 시작/종료되는 시점에 맞춰 `localStream`을 녹음한다 —
 * 실제 서버 업로드는 아직 붙이지 않은, 녹음 파이프라인만 검증하기 위한
 * 단계. */
export function useDebateRecording({
  localStream,
  isMyTurnNow,
  currentSlot,
}: UseDebateRecordingOptions): UseDebateRecordingResult {
  const [recordings, setRecordings] = useState<
    Record<string, DebateArgumentRecording>
  >({});
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mimeTypeRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const wasMyTurnRef = useRef(false);
  // 정지 시점엔 턴이 이미 다음으로 넘어가 있을 수 있어서, 녹음을 시작할
  // 때의 슬롯을 따로 기억해둔다.
  const recordingSlotRef = useRef<ArgumentSlot | null>(null);

  useEffect(() => {
    if (isMyTurnNow && !wasMyTurnRef.current) {
      wasMyTurnRef.current = true;
      if (!localStream) return;

      if (!mimeTypeRef.current) {
        mimeTypeRef.current = pickSupportedMimeType();
      }
      const mimeType = mimeTypeRef.current;
      if (!mimeType) {
        setRecordingError("이 브라우저는 녹음을 지원하지 않아요.");
        return;
      }

      recordingSlotRef.current = currentSlot;
      chunksRef.current = [];
      try {
        const recorder = new MediaRecorder(localStream, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onerror = () => {
          setRecordingError("녹음 중 오류가 발생했어요.");
        };
        recorder.start();
        recorderRef.current = recorder;
      } catch (err) {
        setRecordingError(
          err instanceof Error ? err.message : "녹음을 시작하지 못했어요.",
        );
      }
    } else if (!isMyTurnNow && wasMyTurnRef.current) {
      wasMyTurnRef.current = false;
      const recorder = recorderRef.current;
      const slot = recordingSlotRef.current;
      const mimeType = mimeTypeRef.current;
      recorderRef.current = null;
      recordingSlotRef.current = null;

      if (recorder && slot && mimeType) {
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          setRecordings((prev) => ({
            ...prev,
            [argumentSlotKey(slot)]: { slot, blob, mimeType },
          }));
        };
        if (recorder.state !== "inactive") recorder.stop();
      }
    }
  }, [isMyTurnNow, localStream, currentSlot]);

  // 컴포넌트가 언마운트될 때(통화 종료 등) 진행 중이던 녹음은 버린다.
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (recorder.state !== "inactive") recorder.stop();
      }
    };
  }, []);

  return { recordings, recordingError };
}
