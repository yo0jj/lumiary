"use client";

// ws:// or wss:// URL — NEXT_PUBLIC_API_URL에서 http→ws 치환
const WS_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  .replace(/^http/, "ws");

// -----------------------------------------------------------------------
// VoiceWebSocket
// PRD §10 메시지 프로토콜을 래핑하는 클라이언트.
//
// 사용법:
//   const ws = new VoiceWebSocket();
//   ws.onTranscript = (role, text) => ...
//   ws.onAudio     = (bytes) => audioPlayer.playChunk(bytes)
//   ws.onCallEnd   = (summary) => router.push(`/card/${id}`)
//   ws.connect(sessionId);
//   ws.sendAudioChunk(buffer, false);  // 청크 전송 (중간)
//   ws.sendAudioChunk(buffer, true);   // 마지막 청크 (STT 트리거)
//   ws.end();                          // 통화 종료
// -----------------------------------------------------------------------
export class VoiceWebSocket {
  private ws: WebSocket | null = null;

  onTranscript: ((role: "user" | "ai", text: string) => void) | null = null;
  onAudio: ((bytes: ArrayBuffer) => void) | null = null;
  onCallEnd: ((summary: string) => void) | null = null;
  onError: ((code: string) => void) | null = null;
  onConnectionError: (() => void) | null = null;

  connect(sessionId: string): void {
    this.ws = new WebSocket(`${WS_BASE}/ws/conversation/${sessionId}`);
    this.ws.onmessage = (event: MessageEvent) => this.handleMessage(event);
    this.ws.onerror = () => this.onConnectionError?.();
    this.ws.onclose = (event: CloseEvent) => {
      if (event.code !== 1000) this.onConnectionError?.();
    };
  }

  private handleMessage(event: MessageEvent): void {
    const data = JSON.parse(event.data as string);

    switch (data.type) {
      case "transcript":
        this.onTranscript?.(data.role as "user" | "ai", data.text as string);
        break;

      case "audio": {
        const binary = atob(data.data as string);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        this.onAudio?.(bytes.buffer);
        break;
      }

      case "call_end":
        this.onCallEnd?.((data.summary as string) ?? "");
        break;

      case "error":
        this.onError?.((data.code as string) ?? "unknown");
        break;
    }
  }

  sendAudioChunk(chunk: ArrayBuffer, isFinal: boolean): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // ArrayBuffer → base64
    const bytes = new Uint8Array(chunk);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    this.ws.send(
      JSON.stringify({ type: "audio_chunk", data: btoa(binary), is_final: isFinal })
    );
  }

  end(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "end" }));
    }
    this.ws?.close();
    this.ws = null;
  }
}
