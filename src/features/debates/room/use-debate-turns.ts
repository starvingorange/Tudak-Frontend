"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DebateTurnMessage } from "@/lib/webrtc/use-debate-audio-call";

// 한 사람의 "전체 발언 시간"은 7분 — 입론/반론/결론 3단계에 걸쳐 나눠 쓰는
// 누적 예산이다(단계마다 새로 7분이 아님). 진행 순서는 찬성→반대를 한
// 묶음으로, 입론(0,1) → 반론(2,3) → 결론(4,5) 총 6턴이고, "발언 종료"를
// 누를 때마다 다음 스텝으로 넘어간다. 마지막(반대·결론) 턴이 끝나면 토론
// 자체가 끝난다.
export const TURN_SECONDS = 7 * 60;
export const TOTAL_STEPS = 6;

export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export type DebatePhase = 0 | 1 | 2; // 입론 / 반론 / 결론

export interface UseDebateTurnsOptions {
  /** 내가 찬성이면 0, 반대면 1, 아직 모르면 null. */
  myTurnIndex: 0 | 1 | null;
  micOn: boolean;
  toggleMic: () => void;
  sendTurn: (message: DebateTurnMessage) => boolean;
  incomingTurn: DebateTurnMessage | null;
  /** 매 턴이 실제로 시작될 때(카운트다운이 끝나는 순간) 한 번 호출 —
   * `use-debate-recording.ts`가 이 시점에 맞춰 녹음을 시작한다. */
  onTurnStart?: (step: number, side: 0 | 1, phase: DebatePhase) => void;
  /** 매 턴이 끝날 때(발언 종료를 눌렀든 시간이 다 됐든) 한 번 호출 — 마지막
   * 턴(step 5) 종료는 이걸 호출한 *다음* `onDebateEnd`도 호출된다. */
  onTurnEnd?: (step: number, side: 0 | 1, phase: DebatePhase) => void;
  /** 반대·결론(마지막) 턴까지 끝났을 때 한 번 호출됨 — 실제 "end" 컨트롤
   * 메시지 전송과 결과 페이지 이동은 호출하는 쪽(`debate-room-view.tsx`)
   * 책임. */
  onDebateEnd: () => void;
}

export interface UseDebateTurnsResult {
  /** 3, 2, 1 그다음 null(카운트다운 끝) — 끝나기 전까진 아무도 발언 못 함. */
  countdown: number | null;
  /** 지금 말할 차례인 쪽 — 0 찬성, 1 반대. */
  currentTurnIndex: 0 | 1;
  /** 지금이 입론/반론/결론 중 어느 단계인지. */
  currentPhase: DebatePhase;
  /** 지금이 진짜 "내 턴"인지 — 카운트다운도 끝났어야 함. */
  isMyTurnNow: boolean;
  proRemainingSeconds: number;
  conRemainingSeconds: number;
  /** 지금 턴을 강제로 끝내고 다음 사람에게 넘김 — 내 턴이 아니면 아무 일도
   * 안 함. 시간이 다 됐을 때도 내부적으로 이걸 호출함. */
  endTurn: () => void;
}

// step 0..5 → (phase, side): 입론(찬/반) 반론(찬/반) 결론(찬/반)
function phaseOf(step: number): DebatePhase {
  return Math.floor(step / 2) as DebatePhase;
}
function sideOf(step: number): 0 | 1 {
  return (step % 2) as 0 | 1;
}

export function useDebateTurns({
  myTurnIndex,
  micOn,
  toggleMic,
  sendTurn,
  incomingTurn,
  onTurnStart,
  onTurnEnd,
  onDebateEnd,
}: UseDebateTurnsOptions): UseDebateTurnsResult {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [step, setStep] = useState(0);
  // 찬성/반대 각자의 누적 사용 시간 — 자기 턴이 아닐 땐(상대 턴이거나 아직
  // 시작 전이거나) 그대로 멈춰 있다가, 다시 자기 턴이 되면 이어서 늘어난다.
  const [proUsedSeconds, setProUsedSeconds] = useState(0);
  const [conUsedSeconds, setConUsedSeconds] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const currentTurnIndex = sideOf(step);
  const currentPhase = phaseOf(step);

  // 현재 턴이 실제로 시작된(카운트다운이 끝난) 시각 — 여기서부터 마이크
  // on/off와 무관하게 벽시계로 흐른다.
  const turnStartedAtRef = useRef<number | null>(null);
  const onTurnStartRef = useRef(onTurnStart);
  onTurnStartRef.current = onTurnStart;
  const onTurnEndRef = useRef(onTurnEnd);
  onTurnEndRef.current = onTurnEnd;
  // incomingTurn을 처리하는 effect가 이 값을 읽기만 하고 의존성으로 삼지는
  // 않기 위한 ref — 아래 큰 주석 참고.
  const currentTurnIndexRef = useRef(currentTurnIndex);
  currentTurnIndexRef.current = currentTurnIndex;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      turnStartedAtRef.current = Date.now();
      onTurnStartRef.current?.(step, sideOf(step), phaseOf(step));
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => (c === null ? null : c - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const isMyTurnNow =
    countdown === null &&
    myTurnIndex !== null &&
    myTurnIndex === currentTurnIndex;

  // 각자 자기 턴 시작 시각을 독립적으로(카운트다운이 끝나는 순간)
  // 기록하므로, 타이머를 맞추려고 마이크 on/off를 따로 동기화할 필요는
  // 없다 — 다만 상대가 방금 끝낸 턴에서 실제로 얼마나 썼는지는 로컬
  // 벽시계 추정만으로는 알 수 없어서(내 쪽 카운트다운 시작 시점이 상대와
  // 완전히 같지 않고, 오차가 턴마다 누적됨), turn-pass에 실린 usedSeconds를
  // 그대로 반영한다.
  //
  // 의존성은 반드시 [incomingTurn]만 — currentTurnIndex를 넣으면, 아래
  // setStep이 currentTurnIndex를 바꾸고(내 턴을 스스로 끝냈을 때도 같은 값이
  // 바뀜) 그게 다시 이 effect를 재실행시켜서 incomingTurn.type이 여전히
  // "turn-pass"인 걸 보고 setStep을 또 호출하는 무한 연쇄가 생긴다(step이
  // TOTAL_STEPS-1까지 한 번에 튀어버림 — 실제로 겪은 버그). "지금 끝난
  // 쪽이 누구인지"는 렌더마다 갱신되는 ref로만 읽는다.
  //
  // setStep과 setCountdown(3)을 같은 렌더에서 같이 호출한다 — 예전엔
  // countdown 리셋을 "step이 바뀌면"을 감지하는 별도 effect에 맡겼는데,
  // 그러면 step은 이미 새 값인데 countdown은 아직 지난 턴의 null(카운트
  // 다운 끝난 상태)인 렌더가 한 번 끼어서, 그 틈에 isMyTurnNow가 잠깐
  // true가 돼(3,2,1이 뜨기도 전에) 다음 턴이 활성화된 것처럼 보이는
  // 버그가 있었다.
  useEffect(() => {
    if (incomingTurn?.type !== "turn-pass") return;
    const finishedSide = currentTurnIndexRef.current;
    if (finishedSide === 0) setProUsedSeconds(incomingTurn.usedSeconds);
    else setConUsedSeconds(incomingTurn.usedSeconds);
    // endTurn()은 발언을 끝낸 자기 쪽에서 turnStartedAtRef를 null로 리셋하지만,
    // 이 effect는 "다음에 말할 차례가 된" 반대쪽 브라우저에서 실행되는 경로라
    // 여기서도 리셋해줘야 한다 — 안 하면 지난 턴 시작 시각이 남아 있어서,
    // 다음 턴 카운트다운이 도는 동안 이미 그만큼 흐른 것처럼 타이머가
    // 먼저 줄어들다가 카운트다운이 끝나는 순간 정상값으로 튀는 버그가 생김.
    turnStartedAtRef.current = null;
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
    setCountdown(3);
  }, [incomingTurn]);

  const sideUsedBase = currentTurnIndex === 0 ? proUsedSeconds : conUsedSeconds;
  const currentElapsedSeconds =
    turnStartedAtRef.current !== null
      ? (now - turnStartedAtRef.current) / 1000
      : 0;
  const currentRemainingSeconds = Math.max(
    0,
    TURN_SECONDS - sideUsedBase - currentElapsedSeconds,
  );

  const endTurn = useCallback(() => {
    if (!isMyTurnNow) return;

    if (micOn) toggleMic();

    const finishedStep = step;
    const finishedSide = currentTurnIndex;
    const finishedPhase = currentPhase;
    // now는 1초 간격 setInterval로만 갱신되는 state라 버튼을 누른 실제
    // 순간과 최대 999ms까지 어긋난다 — 여기서 실제로 얼마나 썼는지 확정할
    // 땐 그 오차 없는 Date.now()를 직접 써야 한다("살짝 늘어나 보이는" 원인
    // 이었음). 화면에 매초 흐르는 currentElapsedSeconds/currentRemainingSeconds는
    // now 기반이어도 됨 — 어차피 1초마다 다시 그려지는 표시값이라.
    const preciseElapsedSeconds =
      turnStartedAtRef.current !== null
        ? (Date.now() - turnStartedAtRef.current) / 1000
        : 0;
    const totalUsed = sideUsedBase + preciseElapsedSeconds;
    if (finishedSide === 0) setProUsedSeconds(totalUsed);
    else setConUsedSeconds(totalUsed);
    turnStartedAtRef.current = null;
    onTurnEndRef.current?.(finishedStep, finishedSide, finishedPhase);

    if (finishedStep >= TOTAL_STEPS - 1) {
      onDebateEnd();
    } else {
      setStep(finishedStep + 1);
      setCountdown(3);
      sendTurn({ type: "turn-pass", usedSeconds: totalUsed });
    }
  }, [
    isMyTurnNow,
    step,
    currentTurnIndex,
    currentPhase,
    sideUsedBase,
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
    currentTurnIndex === 1
      ? currentRemainingSeconds
      : Math.max(0, TURN_SECONDS - conUsedSeconds);

  return {
    countdown,
    currentTurnIndex,
    currentPhase,
    isMyTurnNow,
    proRemainingSeconds,
    conRemainingSeconds,
    endTurn,
  };
}
