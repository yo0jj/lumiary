"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const RECOMMEND = [
  { label: "퇴근 후 🌆", time: "19:00" },
  { label: "저녁 후 🍽️", time: "20:00" },
  { label: "잠들기 전 🌙", time: "22:00" },
  { label: "자정 전 ✨", time: "23:30" },
];

export default function TimeSettingPage() {
  const router = useRouter();
  const [time, setTime] = useState("22:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch("/users/me", { call_time: time });
      setSaved(true);
      setTimeout(() => router.push("/my"), 800);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-5 pt-12 pb-8" style={{ backgroundColor: "#F8F5F0" }}>
      <button onClick={() => router.back()} className="text-[#2D4A3E] font-medium text-sm mb-8 block">
        ← 뒤로
      </button>

      <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-2">전화 시간 설정</h1>
      <p className="text-sm text-[#6B6B6B] mb-8">매일 이 시간에 AI가 알림을 보내요.</p>

      {/* 추천 시간 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {RECOMMEND.map((r) => (
          <button
            key={r.time}
            onClick={() => setTime(r.time)}
            className="px-3 py-1.5 rounded-full text-sm border transition-colors"
            style={{
              backgroundColor: time === r.time ? "#2D4A3E" : "white",
              color: time === r.time ? "white" : "#6B6B6B",
              borderColor: time === r.time ? "#2D4A3E" : "#E0E0E0",
            }}
          >
            {r.label} {r.time}
          </button>
        ))}
      </div>

      {/* 시간 입력 */}
      <div
        className="rounded-[16px] p-5 mb-8"
        style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <label className="text-xs text-[#ABABAB] mb-2 block">직접 입력</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full text-[28px] font-bold text-[#1A1A1A] bg-transparent outline-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-[12px] text-white font-semibold text-base"
        style={{ backgroundColor: saved ? "#66BB6A" : "#2D4A3E" }}
      >
        {saved ? "저장됐어요 ✓" : saving ? "저장 중…" : "저장"}
      </button>
    </div>
  );
}
