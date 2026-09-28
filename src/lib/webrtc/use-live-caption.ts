"use client";

import { useCallback, useEffect, useRef } from "react";

// 표준 lib.dom.d.ts에는 아직 Web Speech API 타입이 없어서, 여기서 실제로
// 쓰는 부분만 최소한으로 선언한다 — `any` 대신.
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseLiveCaptionOptions {
  /** 내가 찬성이면 0, 반대면 1, 아직 모르면 null — 이 턴이 내 몫인지 가려서
   * 상대 턴에는 인식을 돌리지 않는다(상대 쪽 자막은 상대 브라우저가 대신
   * 돌려서 P2P로 넘겨준다). */
  mySide: 0 | 1 | null;
  /** 인식 결과가 나올 때마다(중간/최종 모두) 호출 — text는 이 턴에서
   * 지금까지 인식된 전체 문장(누적), isFinal은 방금 반영된 조각이
   * 확정본인지. */
  onResult: (step: number, side: 0 | 1, text: string, isFinal: boolean) => void;
}

export interface UseLiveCaptionResult {
  /** 마이크가 켜지고 내 턴일 때 호출 — 브라우저가 Web Speech API를 지원
   * 안 하면 아무 일도 안 함. 같은 턴(step) 안에서 마이크를 껐다 다시 켜서
   * 재호출되는 경우, 지금까지 인식된 텍스트를 버리지 않고 이어서 쌓는다 —
   * step이 실제로 바뀔 때만 새로 시작한다. */
  startTurn: (step: number, side: 0 | 1) => void;
  /** 마이크가 꺼지거나 턴이 끝날 때 호출 — 지금까지 이 턴에서 인식된
   * 전체 텍스트(화면에 떠 있던 마지막 자막과 동일)를 반환한다. 턴 종료
   * 시 이 반환값을 `stopRecordingTurn`의 sttText로 그대로 넘겨써서
   * finishDebate 요청의 `voiceDataList[].sttText`를 채운다. */
  stopTurn: (step: number, side: 0 | 1) => string;
  /** 이 브라우저가 실시간 자막을 지원하는지 — Safari/Firefox 데스크톱 등
   * 일부 브라우저에서 false일 수 있음. */
  isSupported: boolean;
}

export function useLiveCaption({
  mySide,
  onResult,
}: UseLiveCaptionOptions): UseLiveCaptionResult {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // finalTextRef: 브라우저가 "확정(final)"으로 표시한 조각만 누적 — 다음
  // onresult에서 그 위에 새 interim을 이어붙이는 베이스로 쓰인다.
  // liveTextRef: final + 지금 이 순간의 interim을 합친, 화면에 실제로
  // 보이는 최신 전체 텍스트 — stopTurn이 반환하는 값은 항상 이쪽이다.
  //
  // 처음엔 stopTurn이 finalTextRef만 반환했는데, Chrome은 말을 끊지 않고
  // 쭉 이어 말하면 턴이 끝나 recognition.stop()이 불릴 때까지 단 한 번도
  // isFinal이 안 뜨는 경우가 흔하다 — 그러면 화면엔 자막이 잘 보였는데도
  // finalTextRef가 계속 빈 문자열이라 sttText가 통째로 빠져 나가서
  // finishDebate가 400(빈 sttText로 유효성 검증 실패)을 내는 버그가 있었다.
  // liveTextRef는 interim 여부와 무관하게 매 onresult마다 갱신되므로 이
  // 레이스가 없다.
  const finalTextRef = useRef("");
  const liveTextRef = useRef("");
  const activeStepRef = useRef<number | null>(null);
  const shouldListenRef = useRef(false);

  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const isSupported = getSpeechRecognitionConstructor() !== null;

  const startTurn = useCallback(
    (step: number, side: 0 | 1) => {
      const Ctor = getSpeechRecognitionConstructor();
      if (side !== mySide || !Ctor) return;

      // 진짜 새 턴일 때만 누적 텍스트를 비운다 — 같은 턴 안에서 마이크를
      // 껐다 켠 재시작(startTurn이 다시 불림)은 지금까지 쌓인 텍스트를
      // 그대로 이어간다.
      if (activeStepRef.current !== step) {
        finalTextRef.current = "";
        liveTextRef.current = "";
        activeStepRef.current = step;
      }
      shouldListenRef.current = true;

      const recognition = new Ctor();
      recognition.lang = "ko-KR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const chunk = result[0]?.transcript ?? "";
          if (result.isFinal) finalTextRef.current += chunk;
          else interim += chunk;
        }
        const text = (finalTextRef.current + interim).trim();
        liveTextRef.current = text;
        if (activeStepRef.current !== null) {
          onResultRef.current(
            activeStepRef.current,
            side,
            text,
            interim === "",
          );
        }
      };
      recognition.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        console.warn("[live-caption] recognition error", event.error);
      };
      // continuous로 켜놔도 브라우저가(특히 Chrome) 무음이 좀 이어지면
      // 세션을 자체 종료하는 경우가 있어 — 아직 내 턴이면 바로 다시
      // 시작해서 끊김 없이 이어지게 한다.
      recognition.onend = () => {
        if (!shouldListenRef.current) return;
        try {
          recognition.start();
        } catch {
          // 이미 시작 중인 세션과 겹쳐 호출된 경우 — 다음 onend에서 재시도.
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    },
    [mySide],
  );

  const stopTurn = useCallback(
    (_step: number, side: 0 | 1): string => {
      if (side !== mySide) return "";
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      // activeStepRef/finalTextRef/liveTextRef는 일부러 안 비운다 —
      // 마이크를 잠깐 껐다가 같은 턴 안에서 다시 켜면(startTurn 재호출)
      // 이어서 쌓여야 하기 때문. 진짜 다음 턴이 시작되면 startTurn이
      // step 변화를 보고 알아서 리셋한다.
      return liveTextRef.current;
    },
    [mySide],
  );

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return { startTurn, stopTurn, isSupported };
}
