"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
  onNext: (data: { nickname: string }) => void;
}

export default function Step1Nickname({ onNext }: Props) {
  const [nickname, setNickname] = useState("");

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-8">
      <Progress value={25} className="mb-10 h-1" />

      <div className="flex-1 space-y-3">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">어떻게 불러드릴까요?</h1>
        <p className="text-[16px] text-[#6B6B6B]">AI가 전화에서 이 이름을 불러요.</p>

        <div className="pt-6">
          <Input
            placeholder="이름 또는 별명"
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-12 rounded-[10px] text-base"
            autoFocus
          />
        </div>
      </div>

      <Button
        disabled={nickname.trim().length < 1}
        onClick={() => onNext({ nickname: nickname.trim() })}
        className="w-full h-12 rounded-btn text-white font-semibold text-base"
        style={{ backgroundColor: "#2D4A3E" }}
      >
        다음
      </Button>
    </div>
  );
}
