"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
  onNext: (data: { voice_tone: string }) => void;
  onBack: () => void;
}

const TONES = [
  { id: "calm", emoji: "🌿", label: "차분한", desc: "편안하고 조용한" },
  { id: "bright", emoji: "☀️", label: "명랑한", desc: "밝고 에너지 있는" },
  { id: "plain", emoji: "🪨", label: "담백한", desc: "군더더기 없는" },
];

export default function Step2Voice({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState("calm");

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-8">
      <div className="flex items-center mb-10 gap-3">
        <button onClick={onBack} className="text-[#6B6B6B] text-sm">← 뒤로</button>
        <Progress value={50} className="flex-1 h-1" />
      </div>

      <div className="flex-1 space-y-3">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">AI 목소리를 골라주세요</h1>
        <p className="text-[16px] text-[#6B6B6B]">나중에 언제든 바꿀 수 있어요.</p>

        <div className="pt-6 space-y-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelected(tone.id)}
              className={`w-full flex items-center justify-between p-4 rounded-card border-2 text-left transition-colors ${
                selected === tone.id
                  ? "border-[#2D4A3E] bg-[#2D4A3E]/5"
                  : "border-[#E5E5E5] bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tone.emoji}</span>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{tone.label}</p>
                  <p className="text-sm text-[#6B6B6B]">{tone.desc}</p>
                </div>
              </div>
              <span className="text-xs text-[#ABABAB]">미리 듣기</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onNext({ voice_tone: selected })}
        className="w-full h-12 rounded-btn text-white font-semibold text-base"
        style={{ backgroundColor: "#2D4A3E" }}
      >
        다음
      </Button>
    </div>
  );
}
