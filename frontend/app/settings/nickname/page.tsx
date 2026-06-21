"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NicknameSettingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!nickname.trim()) return;
    setSaving(true);
    try {
      await api.patch("/users/me", { nickname: nickname.trim() });
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

      <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-2">호칭 변경</h1>
      <p className="text-sm text-[#6B6B6B] mb-8">AI가 전화에서 이 이름을 불러요.</p>

      <div
        className="rounded-[16px] px-4 py-3 mb-8"
        style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="이름 또는 별명"
          maxLength={20}
          className="w-full text-lg text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#ABABAB]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || nickname.trim().length === 0}
        className="w-full h-12 rounded-[12px] text-white font-semibold disabled:opacity-50"
        style={{ backgroundColor: saved ? "#66BB6A" : "#2D4A3E" }}
      >
        {saved ? "저장됐어요 ✓" : saving ? "저장 중…" : "저장"}
      </button>
    </div>
  );
}
