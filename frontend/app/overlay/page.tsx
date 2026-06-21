"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Stage = "incoming" | "select_length";

interface Duration {
  key: string;
  label: string;
  desc: string;
  recommended?: boolean;
}

const DURATIONS: Duration[] = [
  { key: "1min", label: "⚡ 1분", desc: "빠르게 한 가지만" },
  { key: "3min", label: "💬 3분", desc: "편하게 수다 떨기", recommended: true },
  { key: "7min", label: "🌊 7분", desc: "오늘을 깊이 탐색" },
];

export default function OverlayPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("incoming");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSnooze() {
    try {
      await api.post("/schedule/snooze", {});
    } catch {}
    router.push("/home");
  }

  async function handleSelectDuration(callLength: string) {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/conversations/start", { call_length: callLength });
      if (!res.ok) throw new Error("start failed");
      const data = await res.json();
      router.push(`/call?session_id=${data.session_id}&conversation_id=${data.conversation_id}`);
    } catch {
      setError("연결에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between pb-12 pt-20 px-6 z-50"
      style={{ background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)" }}
    >
      {stage === "incoming" ? (
        <>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {/* 파동 아바타 */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <div className="absolute w-36 h-36 rounded-full bg-white/5 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-white/8 animate-ping [animation-delay:0.3s]" />
              <div className="w-24 h-24 rounded-full bg-[#2D4A3E] flex items-center justify-center text-5xl z-10">
                📞
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-white text-[32px] font-bold tracking-tight">여보세요</h1>
              <p className="text-white/80 text-lg">안녕하세요 😊</p>
              <p className="text-white/50 text-sm">오늘 하루 이야기 들으러 왔어요</p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => setStage("select_length")}
              className="w-full h-14 rounded-[12px] font-semibold text-lg text-white transition-opacity active:opacity-80"
              style={{ backgroundColor: "#2D4A3E" }}
            >
              받기 📞
            </button>
            <button
              onClick={handleSnooze}
              className="w-full h-12 rounded-[12px] font-medium text-white/60 border border-white/20"
            >
              나중에
            </button>
            <p className="text-center text-white/30 text-xs">나중에를 누르면 1시간 후 다시 알려드려요</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
            <h2 className="text-white text-xl font-semibold text-center">
              오늘은 얼마나 이야기할까요?
            </h2>

            {error && <p className="text-[#E57373] text-sm text-center">{error}</p>}

            <div className="w-full space-y-3">
              {DURATIONS.map((d) => (
                <button
                  key={d.key}
                  disabled={loading}
                  onClick={() => handleSelectDuration(d.key)}
                  className="w-full h-16 rounded-[12px] flex items-center justify-between px-5 border transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: d.recommended ? "rgba(45,74,62,0.5)" : "rgba(255,255,255,0.05)",
                    borderColor: d.recommended ? "#4A7C6F" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <span className="text-white font-medium text-base">{d.label}</span>
                  <span className="text-white/50 text-sm">
                    {d.desc}
                    {d.recommended ? " ✨" : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStage("incoming")}
            className="text-white/40 text-sm"
          >
            ← 돌아가기
          </button>
        </>
      )}
    </div>
  );
}
