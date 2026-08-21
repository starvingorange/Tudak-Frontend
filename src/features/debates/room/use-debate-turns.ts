"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DebateTurnMessage } from "@/lib/webrtc/use-debate-audio-call";

// "1인당 7분(입론+반론 6분 · 최종발언 1분)" 기준 — 찬성(turnIndex 0)이 먼저
// 말하고 반대(turnIndex 1)가 그다음. 시간은 벽시계가 아니라 "눌러서
// 말하기"(마이크 on) 상태일 때만 소모된다.
export const TURN_SECONDS = 7 * 60;

export interface UseDebateTurnsOptions {
  /** 내가 찬성이면 0, 반대면 1, 아직 모르면 null. */
  myTurnIndex: 0 | 1 | null;
  micOn: boolean;
  toggleMic: () => void;
  sendTurn: (message: DebateTurnMessage) => boolean;
  incomingTurn: DebateTurnMessage | null;
  /** 반대(마지막 턴)까지 끝났을 때 한 번 호출됨 — 실제 "end" 컨트롤 메시지
   * 전송과 결과 페이지 이동은 호출하는 쪽(`debate-room-view.tsx`) 책임. */
  onDebateEnd: () => void;
}

export interface UseDebateTurnsResult {
  /** 3, 2, 1 그다음 null(카운트다운 끝) — 끝나기 전까진 아무도 발언 못 함. */
  countdown: number | null;
  currentTurnIndex: 0 | 1;
  /** 지금이 진짜 "내 턴"인지 — 카운트다운도 끝났어야 함. */
  isMyTurnNow: boolean;
  proRemainingSeconds: number;
  conRemainingSeconds: number;
  /** 지금 턴을 강제로 끝내고 다음 사람에게 넘김 — 내 턴이 아니면 아무 일도
   * 안 함. 시간이 다 됐을 때도 내부적으로 이걸 호출함. */
  endTurn: () => void;
}

export function useDebateTurns({
  myTurnIndex,
  micOn,
  toggleMic,
  sendTurn,
  incomingTurn,
  onDebateEnd,
}: UseDebateTurnsOptions): UseDebateTurnsResult {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<0 | 1>(0);
  const [proUsedSeconds, setProUsedSeconds] = useState(0);
  const [conUsedSeconds, setConUsedSeconds] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  // 현재 발언 중인 쪽(나든 상대든)이 마지막으로 마이크를 켠 시각 — 꺼지면
  // null. 라이브 잔여시간 계산에만 쓰이고 리렌더는 `now` 틱이 담당한다.
  const speakingSinceRef = useRef<number | null>(null);
  const prevMicOnRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 턴이 바뀔 때마다(0→1) 카운트다운을 3부터 다시 돌린다 — 처음 시작할 때와
  // 똑같은 연출로, 마이크는 카운트다운이 끝나야 눌릴 수 있다(아래
  // `isMyTurnNow`가 이걸 막아줌).
  const prevTurnIndexRef = useRef<0 | 1>(0);
  useEffect(() => {
    if (currentTurnIndex === prevTurnIndexRef.current) return;
    prevTurnIndexRef.current = currentTurnIndex;
    setCountdown(3);
  }, [currentTurnIndex]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => (c === null ? null : c - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const isMyTurnNow =
    countdown === null &&
    myTurnIndex !== null &&
    myTurnIndex === currentTurnIndex;

  // 내 마이크 on/off를 "말하기 시작"/"말하기 멈춤" 이벤트로 상대에게 전달.
  useEffect(() => {
    if (!isMyTurnNow) {
      prevMicOnRef.current = false;
      return;
    }
    if (micOn && !prevMicOnRef.current) {
      speakingSinceRef.current = Date.now();
      sendTurn({ type: "speak-start" });
    } else if (
      !micOn &&
      prevMicOnRef.current &&
      speakingSinceRef.current !== null
    ) {
      const delta = (Date.now() - speakingSinceRef.current) / 1000;
      speakingSinceRef.current = null;
      const base = currentTurnIndex === 0 ? proUsedSeconds : conUsedSeconds;
      const next = base + delta;
      if (currentTurnIndex === 0) setProUsedSeconds(next);
      else setConUsedSeconds(next);
      sendTurn({ type: "speak-pause", usedSeconds: next });
    }
    prevMicOnRef.current = micOn;
  }, [
    micOn,
    isMyTurnNow,
    currentTurnIndex,
    proUsedSeconds,
    conUsedSeconds,
    sendTurn,
  ]);

  // 상대가 보낸 같은 이벤트를 그대로 미러링 — 상대의 실제 마이크 상태는 알
  // 방법이 없으니, "말하기 시작"을 받으면 내 로컬 시계로 라이브 카운트다운을
  // 재현한다.
  useEffect(() => {
    if (!incomingTurn) return;
    if (incomingTurn.type === "speak-start") {
      speakingSinceRef.current = Date.now();
    } else if (incomingTurn.type === "speak-pause") {
      speakingSinceRef.current = null;
      if (currentTurnIndex === 0) setProUsedSeconds(incomingTurn.usedSeconds);
      else setConUsedSeconds(incomingTurn.usedSeconds);
    } else if (incomingTurn.type === "turn-pass") {
      speakingSinceRef.current = null;
      setCurrentTurnIndex(1);
    }
  }, [incomingTurn, currentTurnIndex]);

  const currentUsedSeconds =
    currentTurnIndex === 0 ? proUsedSeconds : conUsedSeconds;
  const liveCurrentUsedSeconds =
    speakingSinceRef.current !== null
      ? currentUsedSeconds + (now - speakingSinceRef.current) / 1000
      : currentUsedSeconds;
  const currentRemainingSeconds = Math.max(
    0,
    TURN_SECONDS - liveCurrentUsedSeconds,
  );

  const endTurn = useCallback(() => {
    if (!isMyTurnNow) return;

    let finalUsed = currentTurnIndex === 0 ? proUsedSeconds : conUsedSeconds;
    if (speakingSinceRef.current !== null) {
      finalUsed += (Date.now() - speakingSinceRef.current) / 1000;
      speakingSinceRef.current = null;
    }
    if (micOn) toggleMic();

    if (currentTurnIndex === 0) {
      setProUsedSeconds(finalUsed);
      setCurrentTurnIndex(1);
      sendTurn({ type: "turn-pass" });
    } else {
      setConUsedSeconds(finalUsed);
      onDebateEnd();
    }
  }, [
    isMyTurnNow,
    currentTurnIndex,
    proUsedSeconds,
    conUsedSeconds,
    micOn,
    toggleMic,
    sendTurn,
    onDebateEnd,
  ]);

  // 시간이 다 되면(내가 발언 중인 쪽일 때만) 자동으로 턴을 넘긴다 — 상대
  // 쪽에서 중복으로 트리거되지 않도록 발언자만 판단.
  useEffect(() => {
    if (!isMyTurnNow || currentRemainingSeconds > 0) return;
    endTurn();
  }, [isMyTurnNow, currentRemainingSeconds, endTurn]);

  const proRemainingSeconds =
    currentTurnIndex === 0
      ? currentRemainingSeconds
      : Math.max(0, TURN_SECONDS - proUsedSeconds);
  const conRemainingSeconds =
    currentTurnIndex === 1 ? currentRemainingSeconds : TURN_SECONDS;

  return {
    countdown,
    currentTurnIndex,
    isMyTurnNow,
    proRemainingSeconds,
    conRemainingSeconds,
    endTurn,
  };
}
