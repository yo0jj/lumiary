"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/onboarding` },
    });

    if (error) {
      setError("이메일 전송에 실패했어요. 다시 시도해주세요.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">메일함을 확인해주세요 📬</h1>
          <p className="text-[#6B6B6B]">
            <strong>{email}</strong>으로 로그인 링크를 보냈어요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">여보세요 👋</h1>
          <p className="text-[#6B6B6B]">이메일로 시작해요. 비밀번호 없이 로그인돼요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-[10px]"
          />
          {error && <p className="text-sm text-[#E57373]">{error}</p>}
          <Button
            type="submit"
            disabled={!email || loading}
            className="w-full h-12 rounded-btn text-white font-semibold"
            style={{ backgroundColor: "#2D4A3E" }}
          >
            {loading ? "전송 중..." : "로그인 링크 받기"}
          </Button>
        </form>
      </div>
    </main>
  );
}
