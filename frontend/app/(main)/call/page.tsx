"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AudioPlayer, AudioRecorder } from "@/lib/audio";
import { VoiceWebSocket } from "@/lib/websocket";
import Waveform from "@/components/call/Waveform";
import Subtitle from "@/components/call/Subtitle";
import PermissionGate from "@/components/PermissionGate";

interface Message {
  role: "user" | "ai";
  text: string;
}

function CallScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const conversationId = params.get("conversation_id");

  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [connError, setConnError] = useState(false);

  const wsRef = useRef<VoiceWebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current);
    recorderRef.current?.stopRecording();
    playerRef.current?.destroy();
    recorderRef.current = null;
    playerRef.current = null;
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const player = new AudioPlayer();
    const ws = new VoiceWebSocket();
    playerRef.current = player;
    wsRef.current = ws;

    ws.onTranscript = (role, text) =>
      setMessages((prev) => [...prev, { role, text }]);

    ws.onAudio = async (bytes) => {
      setAiSpeaking(true);
      await player.playChunk(bytes);
      setAiSpeaking(false);
    };

    ws.onCallEnd = () => {
      cleanup();
      router.push(`/card/${conversationId}`);
    };

    ws.onError = (code) => console.error("WS error:", code);
    ws.onConnectionError = () => setConnError(true);

    ws.connect(sessionId);

    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);

    return () => {
      ws.end();
      cleanup();
    };
  }, [sessionId]);

  async function handleRecordStart() {
    if (isRecording) return;
    const recorder = new AudioRecorder();
    recorderRef.current = recorder;
    recorder.onChunk = (chunk, isFinal) =>
      wsRef.current?.sendAudioChunk(chunk, isFinal);
    try {
      await recorder.startRecording();
      setIsRecording(true);
    } catch {
      alert("마이크 권한이 필요해요. 설정에서 허용해주세요.");
    }
  }

  function handleRecordStop() {
    recorderRef.current?.stopRecording();
    recorderRef.current = null;
    setIsRecording(false);
  }

  function handleEndCall() {
    wsRef.current?.end();
    cleanup();
    router.push(`/card/${conversationId}`);
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (connError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-8" style={{ backgroundColor: "#2D4A3E" }}>
        <span className="text-5xl">📵</span>
        <p className="text-white text-lg font-semibold text-center">연결이 끊어졌어요</p>
        <p className="text-white/50 text-sm text-center">네트워크 상태를 확인하고 다시 시도해주세요.</p>
        <button
          onClick={() => router.push("/home")}
          className="mt-4 px-8 py-3 rounded-[12px] bg-white/10 text-white text-sm"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "#2D4A3E" }}>
      {/* 상단 타이머 */}
      <div className="flex items-center justify-center pt-14 pb-4">
        <span className="text-white/60 text-sm font-mono">{fmt(elapsed)} 경과</span>
      </div>

      {/* 파형 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <Waveform playerRef={playerRef} isRecording={isRecording} aiSpeaking={aiSpeaking} />
        <p className="text-white/60 text-sm">
          {aiSpeaking
            ? "AI가 말하는 중…"
            : isRecording
            ? "듣고 있어요…"
            : "버튼을 누르고 말해보세요"}
        </p>
      </div>

      {/* 자막 */}
      {showSubtitle && <Subtitle messages={messages} />}

      {/* 하단 컨트롤 */}
      <div className="px-8 pb-12 pt-2 flex items-center justify-between">
        {/* 자막 토글 */}
        <button
          onClick={() => setShowSubtitle((v) => !v)}
          className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
        >
          <span className="text-white/60 text-[10px] font-medium">{showSubtitle ? "자막 끄기" : "자막 켜기"}</span>
        </button>

        {/* 말하기 (push-to-talk) */}
        <button
          onPointerDown={handleRecordStart}
          onPointerUp={handleRecordStop}
          onPointerLeave={handleRecordStop}
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform active:scale-90"
          style={{ backgroundColor: isRecording ? "#E57373" : "white" }}
        >
          🎙️
        </button>

        {/* 통화 종료 */}
        <button
          onClick={handleEndCall}
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: "#E57373" }}
        >
          📵
        </button>
      </div>
    </div>
  );
}

export default function CallPage() {
  return (
    <PermissionGate>
      <Suspense fallback={<div className="fixed inset-0 bg-[#2D4A3E] flex items-center justify-center"><span className="text-white">연결 중…</span></div>}>
        <CallScreen />
      </Suspense>
    </PermissionGate>
  );
}
