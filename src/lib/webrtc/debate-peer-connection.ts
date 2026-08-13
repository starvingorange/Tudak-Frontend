// No TURN server configured — calls between peers behind restrictive NATs
// (e.g. some corporate networks) may fail to connect. Known limitation.
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export interface DebatePeerConnectionHandlers {
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
  onTrack?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
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

  constructor(
    localStream: MediaStream,
    handlers: DebatePeerConnectionHandlers = {},
  ) {
    this.handlers = handlers;
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    for (const track of localStream.getTracks()) {
      this.pc.addTrack(track, localStream);
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
