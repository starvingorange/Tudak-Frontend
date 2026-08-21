// No TURN server configured — calls between peers behind restrictive NATs
// (e.g. some corporate networks) may fail to connect. Known limitation.
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export type DebateControlMessage =
  | { type: "reaction"; sticker: string }
  | { type: "end" }
  | { type: "leave" }
  // 턴 타이머는 눌러서 말하기(마이크 on/off)로만 흐른다 — "말하기 시작"/"말하기
  // 멈춤(그때까지 쓴 시간)"을 상대에게 이벤트로 알려주면, 상대는 자기 로컬
  // 시계로 같은 카운트다운을 그대로 재현한다(초 단위로 계속 핑퐁하지 않음).
  | { type: "speak-start" }
  | { type: "speak-pause"; usedSeconds: number }
  // 발언자가 "발언 종료"를 누르거나 시간을 다 썼을 때, 다음 사람(찬성→반대)
  // 으로 턴을 넘긴다는 뜻 — 마지막 턴(반대) 종료는 기존 "end"를 그대로 씀.
  | { type: "turn-pass" };

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
      parsed?.type === "speak-pause" &&
      typeof parsed.usedSeconds === "number"
    ) {
      return parsed;
    }
    if (
      parsed?.type === "end" ||
      parsed?.type === "leave" ||
      parsed?.type === "speak-start" ||
      parsed?.type === "turn-pass"
    ) {
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
