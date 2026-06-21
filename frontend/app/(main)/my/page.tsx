"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import BottomTabBar from "@/components/BottomTabBar";

interface UserStats {
  total_conversations: number;
  streak_days: number;
  average_rating: number | null;
  action_completion_rate: number | null;
}

interface UserData {
  nickname: string;
  created_at?: string;
  stats: UserStats;
}

const SETTINGS = [
  { href: "/settings/time", label: "전화 시간 설정" },
  { href: "/settings/voice", label: "AI 목소리 톤" },
  { href: "/settings/nickname", label: "호칭 변경" },
];

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    api.get("/users/me")
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {});
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const stats = user?.stats;

  return (
    <div className="min-h-screen pb-24 pt-12 px-5" style={{ backgroundColor: "#F8F5F0" }}>
      <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-8">마이</h1>

      {/* 프로필 */}
      <div
        className="rounded-[16px] p-5 flex items-center gap-4 mb-5"
        style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: "#2D4A3E" }}
        >
          {user?.nickname?.charAt(0) ?? "?"}
        </div>
        <div>
          <p className="text-[#1A1A1A] font-semibold text-lg">{user?.nickname ?? "…"}님</p>
          {stats?.streak_days ? (
            <p className="text-sm text-[#6B6B6B]">나를 만난 날 {stats.streak_days}일째</p>
          ) : null}
        </div>
      </div>

      {/* 통계 */}
      <div
        className="rounded-[16px] p-5 mb-5"
        style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <p className="text-xs text-[#ABABAB] font-medium mb-4 uppercase tracking-wide">통계</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "총 대화", value: stats?.total_conversations ?? 0, unit: "회" },
            { label: "연속", value: stats?.streak_days ?? 0, unit: "일" },
            { label: "평균 별점", value: stats?.average_rating?.toFixed(1) ?? "–", unit: "★" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold text-[#1A1A1A]">
                {value}<span className="text-sm font-normal text-[#6B6B6B] ml-0.5">{unit}</span>
              </p>
              <p className="text-xs text-[#ABABAB] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {stats?.action_completion_rate != null && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-[#6B6B6B]">실천 달성률</p>
              <p className="text-xs font-semibold text-[#2D4A3E]">
                {Math.round(stats.action_completion_rate * 100)}%
              </p>
            </div>
            <div className="h-2 rounded-full bg-[#F0F0F0] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round(stats.action_completion_rate * 100)}%`,
                  backgroundColor: "#2D4A3E",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 설정 */}
      <div
        className="rounded-[16px] overflow-hidden mb-5"
        style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        {SETTINGS.map(({ href, label }, i) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm text-[#1A1A1A]"
            style={{ borderBottom: i < SETTINGS.length - 1 ? "1px solid #F5F5F5" : undefined }}
          >
            {label}
            <span className="text-[#ABABAB]">→</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-3 text-sm text-[#ABABAB] text-center"
      >
        로그아웃
      </button>

      <BottomTabBar />
    </div>
  );
}
