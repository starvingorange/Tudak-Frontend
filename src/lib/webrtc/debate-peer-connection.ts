// No TURN server configured — calls between peers behind restrictive NATs
// (e.g. some corporate networks) may fail to connect. Known limitation.
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

/** 녹음된 한 턴의 업로드 결과 — `step`은 use-debate-turns.ts의 0..5 턴
 * 인덱스와 동일해서, 방장이 양쪽 키를 받은 뒤 그대로 정렬해 합칠 수 있다. */
export interface RecordingKeyEntry {
  step: number;
  s3ObjectKey: string;
}

export type DebateControlMessage =
  | { type: "reaction"; sticker: string }
  | { type: "end" }
  | { type: "leave" }
  // 발언자가 "발언 종료"를 누르거나 시간을 다 썼을 때, 다음 사람(찬성→반대)
  // 으로 턴을 넘긴다는 뜻 — 마지막 턴(반대) 종료는 기존 "end"를 그대로 씀.
  // usedSeconds는 방금 끝난 발언자가 그 턴까지 실제로 쓴 누적 시간 — 상대는
  // 자기 로컬 시계로 카운트다운을 재현하므로, 이 값 없이는 상대 쪽 화면의
  // "내(발언자) 남은 시간"이 다음 내 턴부터 어긋난다. turn-pass 하나에
  // 실어 보내는 이유는 두 메시지로 나누면(예: 별도 speak-pause) 리액트가
  // 연달아 온 두 setState를 한 배치로 묶어 앞 메시지를 통째로 씹을 수
  // 있어서다.
  | { type: "turn-pass"; usedSeconds: number }
  // 게스트가 토론 종료 후 자기 몫(3턴)의 s3ObjectKey를 방장에게 한 번에
  // 보낼 때 씀 — 방장은 이걸 받아 자기 몫과 합쳐 finishDebate를 호출한다.
  | { type: "recording-keys"; keys: RecordingKeyEntry[] }
  // finishDebate는 방장만 호출하므로 pollId도 방장만 안다 — 게스트도 결과
  // 페이지에서 같은 poll을 보게 하려고 방장이 이걸로 한 번 전달한다.
  | { type: "poll-ready"; pollId: number };

export interface DebatePeerConnectionHandlers {
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
  onTrack?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onControlMessage?: (message: DebateControlMessage) => void;
}

const CONTROL_CHANNEL_LABEL = "control";

function parseControlMessage(data: string): DebateControlMessage | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed?.type === "reaction" && typeof parsed.sticker === "string") {
      return parsed;
    }
    if (
      parsed?.type === "turn-pass" &&
      typeof parsed.usedSeconds === "number"
    ) {
      return parsed;
    }
    if (parsed?.type === "end" || parsed?.type === "leave") {
      return parsed;
    }
    if (
      parsed?.type === "recording-keys" &&
      Array.isArray(parsed.keys) &&
      parsed.keys.every(
        (entry: unknown) =>
          typeof (entry as RecordingKeyEntry)?.step === "number" &&
          typeof (entry as RecordingKeyEntry)?.s3ObjectKey === "string",
      )
    ) {
      return parsed;
    }
    if (parsed?.type === "poll-ready" && typeof parsed.pollId === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Thin, framework-agnostic wrapper around a single `RTCPeerConnection` for
 * one opponent — mirrors `debate-room-socket-client.ts`'s style. Doesn't
 * touch the WebSocket itself; the caller (`use-debate-audio-call.ts`) relays
 * `onIceCandidate`/offer/answer payloads over the existing WS signal channel
 * and feeds incoming ones back in via `handleOffer`/`handleAnswer`/
 * `addIceCandidate`.
 */
export class DebatePeerConnection {
  private readonly pc: RTCPeerConnection;
  private readonly handlers: DebatePeerConnectionHandlers;
  private controlChannel: RTCDataChannel | null = null;

  constructor(
    localStream: MediaStream,
    isCaller: boolean,
    handlers: DebatePeerConnectionHandlers = {},
  ) {
    this.handlers = handlers;
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    for (const track of localStream.getTracks()) {
      this.pc.addTrack(track, localStream);
    }

    // Whoever calls `createDataChannel` first is the side whose SDP offer
    // carries the m=application negotiation — that's why this is gated on
    // `isCaller` (the same side that later calls `createOffer`). The other
    // side just receives the same channel via `ondatachannel`.
    if (isCaller) {
      this.setUpControlChannel(
        this.pc.createDataChannel(CONTROL_CHANNEL_LABEL),
      );
    } else {
      this.pc.ondatachannel = (event) => {
        if (event.channel.label === CONTROL_CHANNEL_LABEL) {
          this.setUpControlChannel(event.channel);
        }
      };
    }

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.handlers.onIceCandidate?.(event.candidate.toJSON());
      }
    };
    this.pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) this.handlers.onTrack?.(stream);
    };
    this.pc.onconnectionstatechange = () => {
      this.handlers.onConnectionStateChange?.(this.pc.connectionState);
    };
  }

  private setUpControlChannel(channel: RTCDataChannel): void {
    this.controlChannel = channel;
    channel.onmessage = (event) => {
      const message = parseControlMessage(event.data);
      if (message) this.handlers.onControlMessage?.(message);
    };
  }

  /** Sends a control message (reaction sticker, end, leave) straight to the
   * opponent over the P2P data channel — no server round-trip, so this fails
   * silently (returns `false`) until the channel is actually open. */
  sendControlMessage(message: DebateControlMessage): boolean {
    if (this.controlChannel?.readyState !== "open") return false;
    this.controlChannel.send(JSON.stringify(message));
    return true;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(
    sdp: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit> {
    await this.pc.setRemoteDescription(sdp);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    await this.pc.setRemoteDescription(sdp);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.pc.addIceCandidate(candidate);
    } catch (error) {
      console.warn("[webrtc] failed to add ICE candidate", error);
    }
  }

  close(): void {
    this.pc.close();
  }
}
