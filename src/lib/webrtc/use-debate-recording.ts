"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePostPreUpload } from "@/api/file/hooks/usePostPreUpload";
import type { RecordingKeyEntry } from "./debate-peer-connection";

export interface UseDebateRecordingOptions {
  /** 내가 찬성이면 0, 반대면 1, 아직 모르면 null — 이 턴이 내 몫인지
   * 가리는 데 씀(내 턴만 녹음함, 상대 오디오는 안 함). */
  mySide: 0 | 1 | null;
  /** 내 마이크 스트림 — 내 턴을 녹음할 대상. */
  localStream: MediaStream | null;
  /** 방/토론이 바뀌면(재입장 등) 이전 상태를 버리고 새로 시작하기 위한
   * 키 — `debate-call-provider.tsx`가 debateId를 그대로 넘긴다. */
  resetKey: string;
}

export interface UseDebateRecordingResult {
  /** 이 턴이 시작될 때 호출 — 내 턴이 아니거나 스트림이 없으면 아무 일도
   * 안 함. */
  startTurn: (step: number, side: 0 | 1) => void;
  /** 이 턴이 끝날 때 호출 — 내 턴이었을 때만 녹음을 멈추고 즉시
   * preUpload → S3 PUT까지 마친 뒤 s3ObjectKey를 반환. 내 턴이 아니었으면
   * 곧바로 null. */
  stopTurn: (step: number, side: 0 | 1) => Promise<string | null>;
  /** 지금까지 업로드가 끝난 내 턴들의 키 — step 오름차순, 매번 새 배열. */
  myKeys: RecordingKeyEntry[];
  /** 내가 맡은 턴 3개가 전부 업로드까지 끝났는지. */
  isMineComplete: boolean;
}

const MY_TURN_COUNT = 3;

export function useDebateRecording({
  mySide,
  localStream,
  resetKey,
}: UseDebateRecordingOptions): UseDebateRecordingResult {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [keysByStep, setKeysByStep] = useState<Record<number, string>>({});

  const { mutateAsync: preUpload } = usePostPreUpload();

  // 새 토론(다른 debateId)로 바뀌면 이전 방의 업로드 결과가 새 방으로
  // 새어 들어가지 않게 리셋 — DebateCallProvider가 debateId 자체가 바뀔
  // 때만 언마운트되지 않고 재사용되므로 필요함.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey isn't read in the body, but it's the intentional re-run trigger.
  useEffect(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    setKeysByStep({});
  }, [resetKey]);

  const startTurn = useCallback(
    (_step: number, side: 0 | 1) => {
      if (side !== mySide || !localStream) return;

      const recorder = new MediaRecorder(localStream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
    },
    [mySide, localStream],
  );

  const stopTurn = useCallback(
    async (step: number, side: 0 | 1): Promise<string | null> => {
      const recorder = recorderRef.current;
      if (side !== mySide || !recorder) return null;
      recorderRef.current = null;

      const chunks = chunksRef.current;
      const mimeType = recorder.mimeType || "audio/webm";

      const blob = await new Promise<Blob>((resolve) => {
        if (recorder.state === "inactive") {
          resolve(new Blob(chunks, { type: mimeType }));
          return;
        }
        recorder.addEventListener(
          "stop",
          () => resolve(new Blob(chunks, { type: mimeType })),
          { once: true },
        );
        recorder.stop();
      });

      try {
        const preUploadResponse = await preUpload({
          data: { contentType: mimeType },
        });
        const { presignedUrl, s3objectKey } = preUploadResponse.data ?? {};
        if (!presignedUrl || !s3objectKey) {
          console.error(
            "[debate-recording] preUpload response missing presignedUrl/s3objectKey",
            step,
            preUploadResponse,
          );
          return null;
        }

        const uploadResult = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": mimeType },
          body: blob,
        });
        if (!uploadResult.ok) {
          console.error(
            "[debate-recording] S3 PUT failed",
            step,
            uploadResult.status,
            uploadResult.statusText,
          );
          return null;
        }

        setKeysByStep((prev) => ({ ...prev, [step]: s3objectKey }));
        return s3objectKey;
      } catch (error) {
        console.error("[debate-recording] failed to upload turn", step, error);
        return null;
      }
    },
    [mySide, preUpload],
  );

  const myKeys = useMemo<RecordingKeyEntry[]>(
    () =>
      Object.entries(keysByStep)
        .map(([step, s3ObjectKey]) => ({ step: Number(step), s3ObjectKey }))
        .sort((a, b) => a.step - b.step),
    [keysByStep],
  );

  const isMineComplete = mySide !== null && myKeys.length === MY_TURN_COUNT;

  return { startTurn, stopTurn, myKeys, isMineComplete };
}
