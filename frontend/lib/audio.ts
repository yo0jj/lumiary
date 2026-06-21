"use client";

// -----------------------------------------------------------------------
// AudioRecorder
// MediaRecorder API로 마이크를 250ms 청크 단위로 스트리밍.
// onChunk(chunk, isFinal) — isFinal은 stopRecording() 호출 시 마지막 청크에 true.
// -----------------------------------------------------------------------
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private stopping = false;

  onChunk: ((chunk: ArrayBuffer, isFinal: boolean) => void) | null = null;

  async startRecording(): Promise<void> {
    this.stopping = false;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && this.onChunk) {
        const buffer = await event.data.arrayBuffer();
        this.onChunk(buffer, this.stopping);
      }
    };

    this.mediaRecorder.start(250);
  }

  stopRecording(): void {
    this.stopping = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.mediaRecorder = null;
    this.stream = null;
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

// -----------------------------------------------------------------------
// AudioPlayer
// Web Audio API로 MP3 bytes를 순차 재생 (내부 큐잉).
// -----------------------------------------------------------------------
export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private queue: ArrayBuffer[] = [];
  private playing = false;

  private ctx(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      this.audioCtx = new AudioContext();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;
      this.analyserNode.connect(this.audioCtx.destination);
    }
    return this.audioCtx;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  async playChunk(audioBytes: ArrayBuffer): Promise<void> {
    this.queue.push(audioBytes);
    if (!this.playing) {
      await this.drain();
    }
  }

  private async drain(): Promise<void> {
    this.playing = true;
    while (this.queue.length > 0) {
      const bytes = this.queue.shift()!;
      try {
        const ctx = this.ctx();
        const buffer = await ctx.decodeAudioData(bytes.slice(0));
        await new Promise<void>((resolve) => {
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.analyserNode!);
          source.onended = () => resolve();
          source.start();
        });
      } catch {
        // 재생 실패한 청크는 건너뜀
      }
    }
    this.playing = false;
  }

  destroy(): void {
    this.audioCtx?.close();
    this.audioCtx = null;
    this.analyserNode = null;
    this.queue = [];
    this.playing = false;
  }
}
