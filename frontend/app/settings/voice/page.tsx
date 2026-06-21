"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const VOICES = [
  { key: "calm", emoji: "🌿", label: "차분한", desc: "편안하고 조용한" },
  { key: "bright", emoji: "☀️", label: "명랑한", desc: "밝고 에너지 있는" },
  { key: "plain", emoji: "🪨", label: "담백한", desc: "군더더기 없는" },
] as const;

export default function VoiceSettingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("calm");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch("/users/me", { voice_tone: selected });
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

      <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-2">AI 목소리 톤</h1>
      <p className="text-sm text-[#6B6B6B] mb-8">나중에 언제든 바꿀 수 있어요.</p>

      <div className="space-y-3 mb-8">
        {VOICES.map((v) => (
          <button
            key={v.key}
            onClick={() => setSelected(v.key)}
            className="w-full rounded-[16px] p-4 flex items-center gap-4 border-2 transition-all"
            style={{
              backgroundColor: selected === v.key ? "#EFF5F2" : "white",
              borderColor: selected === v.key ? "#2D4A3E" : "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-2xl">{v.emoji}</span>
            <div className="flex-1 text-left">
              <p className="text-[#1A1A1A] font-semibold">{v.label}</p>
              <p className="text-sm text-[#6B6B6B]">{v.desc}</p>
            </div>
            {selected === v.key && <span className="text-[#2D4A3E] font-bold">✓</span>}
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-[12px] text-white font-semibold"
        style={{ backgroundColor: saved ? "#66BB6A" : "#2D4A3E" }}
      >
        {saved ? "저장됐어요 ✓" : saving ? "저장 중…" : "저장"}
      </button>
    </div>
  );
}
