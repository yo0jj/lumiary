"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 로그인 시도
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError) {
      router.push("/home");
      return;
    }

    // 로그인 실패 → 신규 가입 시도
    if (signInError.message.includes("Invalid login credentials")) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (!signUpError) {
        router.push("/onboarding");
        return;
      }
      setError(signUpError.message.includes("already registered")
        ? "비밀번호가 틀렸어요."
        : "가입에 실패했어요. 다시 시도해주세요.");
    } else {
      setError("로그인에 실패했어요. 다시 시도해주세요.");
    }

    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: "#F8F5F0" }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">여보세요 👋</h1>
          <p className="text-[#6B6B6B]">이메일과 비밀번호로 시작해요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-[10px]"
          />
          <Input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12 rounded-[10px]"
          />
          {error && <p className="text-sm text-[#E57373]">{error}</p>}
          <Button
            type="submit"
            disabled={!email || !password || loading}
            className="w-full h-12 rounded-btn text-white font-semibold"
            style={{ backgroundColor: "#2D4A3E" }}
          >
            {loading ? "확인 중..." : "시작하기"}
          </Button>
        </form>

        <p className="text-xs text-center text-[#ABABAB]">
          처음이면 자동으로 가입돼요.
        </p>
      </div>
    </main>
  );
}
