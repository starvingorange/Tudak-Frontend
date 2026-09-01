"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePostPreUpload } from "@/api/file/hooks/usePostPreUpload";
import type { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";
import { ARGUMENT_ORDER, type ArgumentSlot } from "./debate-argument-order";

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

export interface UseDebateRecordingOptions {
  /** `useDebateAudioCall().localStream` — 그대로 녹음한다. 마이크 mute
   * 구간(`track.enabled === false`)은 무음으로 남을 뿐 녹음 자체는 끊기지
   * 않으므로, 한 서브턴 안에서 여러 번 껐다 켜도 결과물은 하나로 이어진다. */
  localStream: MediaStream | null;
  isMyTurnNow: boolean;
  currentSlot: ArgumentSlot;
  /** 내가 찬성이면 0, 반대면 1, 아직 모르면 null — 내 서브턴 3개(입론→반론→
   * 최종변론)의 순서를 정하는 데 쓴다. */
  mySide: 0 | 1 | null;
}

export interface UseDebateRecordingResult {
  /** 내 서브턴 3개가 (입론→반론→최종변론 순으로) 전부 업로드되면 그 S3 키
   * 3개, 하나라도 아직이면 `null`. */
  myKeys: string[] | null;
  uploadError: string | null;
}

/** 내 서브턴이 끝날 때마다 그 구간을 녹음해서 곧바로 presigned url로 S3에
 * 업로드한다 — 서브턴 끝나고 바로바로 하나씩 올리므로 프론트가 오디오
 * 파일 자체를 오래 들고 있을 일이 없다(들고 있는 건 다 올라간 S3 키
 * 문자열 3개뿐). 최종적으로 방장이 아닌 쪽이 이 3개 키를 방장에게 P2P로
 * 전달하고, 방장이 자기 3개와 합쳐 `postFinishDebate`를 한 번만 호출한다. */
export function useDebateRecording({
  localStream,
  isMyTurnNow,
  currentSlot,
  mySide,
}: UseDebateRecordingOptions): UseDebateRecordingResult {
  const { mutateAsync: preUpload } = usePostPreUpload();
  const [uploadedKeys, setUploadedKeys] = useState<
    Partial<Record<ArgumentDetailsArgumentType, string>>
  >({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mimeTypeRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const wasMyTurnRef = useRef(false);
  // 업로드 시점엔 턴이 이미 다음으로 넘어가 있을 수 있어서, 녹음을 시작할
  // 때의 슬롯을 따로 기억해둔다.
  const recordingSlotRef = useRef<ArgumentSlot | null>(null);

  const uploadRecording = useCallback(
    async (blob: Blob, slot: ArgumentSlot, contentType: string) => {
      try {
        const preUploadResponse = await preUpload({ data: { contentType } });
        const { presignedUrl, s3objectKey } = preUploadResponse.data ?? {};
        if (!presignedUrl || !s3objectKey) {
          throw new Error("녹음 업로드 URL 발급에 실패했어요.");
        }

        const putResult = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: blob,
        });
        if (!putResult.ok) {
          throw new Error(`녹음 업로드에 실패했어요 (${putResult.status}).`);
        }

        setUploadedKeys((prev) => ({
          ...prev,
          [slot.argumentType]: s3objectKey,
        }));
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "녹음 업로드에 실패했어요.",
        );
      }
    },
    [preUpload],
  );

  // 내 서브턴이 시작되면 녹음을 시작하고, 끝나면(다음 서브턴으로 넘어가거나
  // 토론이 끝나면) 멈추고 그 구간 오디오를 곧바로 업로드한다.
  useEffect(() => {
    if (isMyTurnNow && !wasMyTurnRef.current) {
      wasMyTurnRef.current = true;
      if (!localStream) return;

      if (!mimeTypeRef.current) {
        mimeTypeRef.current = pickSupportedMimeType();
      }
      const mimeType = mimeTypeRef.current;
      if (!mimeType) {
        setUploadError("이 브라우저는 녹음을 지원하지 않아요.");
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
          setUploadError("녹음 중 오류가 발생했어요.");
        };
        recorder.start();
        recorderRef.current = recorder;
      } catch (err) {
        setUploadError(
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
          void uploadRecording(blob, slot, mimeType.split(";")[0]);
        };
        if (recorder.state !== "inactive") recorder.stop();
      }
    }
  }, [isMyTurnNow, localStream, currentSlot, uploadRecording]);

  // 컴포넌트가 언마운트될 때(통화 종료 등) 남은 녹음은 업로드하지 않고 버린다.
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

  const myKeys = (() => {
    if (mySide === null) return null;
    const ordered: string[] = [];
    for (const slot of ARGUMENT_ORDER) {
      if (slot.side !== mySide) continue;
      const key = uploadedKeys[slot.argumentType];
      if (!key) return null;
      ordered.push(key);
    }
    return ordered;
  })();

  return { myKeys, uploadError };
}
