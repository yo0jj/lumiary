"use client";

import { useEffect, useRef } from "react";
import type { AudioPlayer } from "@/lib/audio";

interface Props {
  playerRef: React.RefObject<AudioPlayer | null>;
  isRecording: boolean;
  aiSpeaking: boolean;
}

const BAR_COUNT = 20;

export default function Waveform({ playerRef, isRecording, aiSpeaking }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;

    function draw() {
      if (!canvas || !ctx) return;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const gap = 5;
      const barW = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const amplitudes: number[] = [];

      const analyser = playerRef.current?.getAnalyser() ?? null;

      if (analyser && aiSpeaking) {
        // 실제 Chirp 3 오디오 주파수 데이터
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < BAR_COUNT; i++) {
          // bin 1부터 사용 (0번은 DC 성분)
          const bin = 1 + Math.floor((i / BAR_COUNT) * Math.min(20, dataArray.length - 1));
          amplitudes.push(dataArray[bin] / 255);
        }
      } else if (isRecording) {
        // 마이크 녹음 중: 느린 부드러운 펄스
        for (let i = 0; i < BAR_COUNT; i++) {
          const phase = (tick / 30 + i / BAR_COUNT) * Math.PI * 2;
          amplitudes.push(0.08 + 0.18 * Math.abs(Math.sin(phase)));
        }
      } else {
        // 대기 중: 거의 평탄
        for (let i = 0; i < BAR_COUNT; i++) {
          amplitudes.push(0.04);
        }
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const amp = amplitudes[i];
        // 감마 보정으로 낮은 값도 시각적으로 표현
        const barH = Math.max(4, Math.pow(amp, 0.55) * h * 0.9);
        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        const alpha = aiSpeaking
          ? 0.35 + 0.65 * amp
          : isRecording
          ? 0.3 + 0.4 * amp
          : 0.2;

        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW / 2);
        ctx.fill();
      }

      tick++;
      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isRecording, aiSpeaking, playerRef]);

  return <canvas ref={canvasRef} width={320} height={120} className="w-[320px] h-[120px]" />;
}
