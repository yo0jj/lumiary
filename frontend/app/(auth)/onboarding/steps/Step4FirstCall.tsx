"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface OnboardData {
  nickname: string;
  voice_tone: string;
  call_time: string;
}

interface Props {
  data: OnboardData;
  onBack: () => void;
}

export default function Step4FirstCall({ data, onBack }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getUser();
      const email = session.user?.email ?? data.nickname + "@temp.com";

      const res = await api.post("/auth/onboard", {
        name: data.nickname,
        nickname: data.nickname,
        call_time: data.call_time,
        timezone: "Asia/Seoul",
        voice_tone: data.voice_tone,
      });

      if (!res.ok) throw new Error("onboard failed");

      // Phase 2 전까지는 바로 홈으로 이동
      router.push("/home");
    } catch {
      setError("시작에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-8">
      <div className="flex items-center mb-10 gap-3">
        <button onClick={onBack} className="text-[#6B6B6B] text-sm">← 뒤로</button>
        <Progress value={100} className="flex-1 h-1" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="text-6xl">📞</div>
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">
          처음 만났으니 가볍게 인사해요 👋
        </h1>
        <p className="text-[16px] text-[#6B6B6B]">
          딱 하나만 물어볼게요.<br />
          누르면 <strong>{data.nickname}</strong>님과의 첫 대화가 시작돼요.
        </p>
        {error && <p className="text-sm text-[#E57373]">{error}</p>}
      </div>

      <Button
        onClick={handleStart}
        disabled={loading}
        className="w-full h-12 rounded-btn text-white font-semibold text-base"
        style={{ backgroundColor: "#2D4A3E" }}
      >
        {loading ? "시작하는 중..." : "첫 대화 시작하기"}
      </Button>
    </div>
  );
}
