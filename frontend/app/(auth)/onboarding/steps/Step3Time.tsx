"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
  onNext: (data: { call_time: string }) => void;
  onBack: () => void;
}

const PRESETS = [
  { label: "퇴근 후 🌆", time: "19:00" },
  { label: "저녁 후 🍽️", time: "20:00" },
  { label: "잠들기 전 🌙", time: "22:00" },
  { label: "자정 전 ✨", time: "23:30" },
];

const HOURS = Array.from({ length: 19 }, (_, i) => String(i + 6).padStart(2, "0")); // 06~24
const MINUTES = ["00", "30"];

export default function Step3Time({ onNext, onBack }: Props) {
  const [hour, setHour] = useState("22");
  const [minute, setMinute] = useState("00");

  const callTime = `${hour}:${minute}`;

  function applyPreset(time: string) {
    const [h, m] = time.split(":");
    setHour(h);
    setMinute(m);
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-8">
      <div className="flex items-center mb-10 gap-3">
        <button onClick={onBack} className="text-[#6B6B6B] text-sm">← 뒤로</button>
        <Progress value={75} className="flex-1 h-1" />
      </div>

      <div className="flex-1 space-y-3">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">언제 전화 드릴까요?</h1>
        <p className="text-[16px] text-[#6B6B6B]">매일 이 시간에 AI가 알림을 보내요.</p>

        {/* 추천 칩 */}
        <div className="pt-4 flex gap-2 overflow-x-auto pb-2">
          {PRESETS.map((p) => (
            <button
              key={p.time}
              onClick={() => applyPreset(p.time)}
              className={`flex-shrink-0 px-4 py-2 rounded-pill text-sm font-medium border transition-colors ${
                callTime === p.time
                  ? "bg-[#2D4A3E] text-white border-[#2D4A3E]"
                  : "bg-white text-[#1A1A1A] border-[#E5E5E5]"
              }`}
            >
              {p.label} {p.time}
            </button>
          ))}
        </div>

        {/* 시간 선택 */}
        <div className="pt-4 flex items-center justify-center gap-4">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="text-3xl font-bold text-[#1A1A1A] bg-transparent border-none outline-none cursor-pointer"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-3xl font-bold text-[#1A1A1A]">:</span>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="text-3xl font-bold text-[#1A1A1A] bg-transparent border-none outline-none cursor-pointer"
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={() => onNext({ call_time: callTime })}
        className="w-full h-12 rounded-btn text-white font-semibold text-base"
        style={{ backgroundColor: "#2D4A3E" }}
      >
        다음
      </Button>
    </div>
  );
}
