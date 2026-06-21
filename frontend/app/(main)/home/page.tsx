"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import BottomTabBar from "@/components/BottomTabBar";

interface NextSchedule {
  next_call_at: string | null;
  minutes_remaining: number | null;
}

interface RecentCard {
  id: string;
  called_at: string;
  emotion?: string;
  summary?: string;
  keywords?: string[];
  rating?: number;
}

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("사용자");
  const [streak, setStreak] = useState(0);
  const [schedule, setSchedule] = useState<NextSchedule | null>(null);
  const [recentCard, setRecentCard] = useState<RecentCard | null>(null);

  useEffect(() => {
    api.get("/users/me")
      .then((r) => r.json())
      .then((data) => {
        setNickname(data.nickname ?? "사용자");
        setStreak(data.stats?.streak_days ?? 0);
      })
      .catch(() => {});

    api.get("/schedule/next")
      .then((r) => r.json())
      .then((data) => setSchedule(data))
      .catch(() => {});

    api.get("/conversations?limit=1")
      .then((r) => r.json())
      .then((data) => setRecentCard(data.conversations?.[0] ?? null))
      .catch(() => {});
  }, []);

  function formatCallTime(iso: string | null) {
    if (!iso) return null;
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    return `오후 ${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen pb-24 px-5 pt-12" style={{ backgroundColor: "#F8F5F0" }}>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">
          안녕하세요, {nickname}님 👋
        </h1>
        {streak > 0 && (
          <p className="text-sm text-[#6B6B6B] mt-1">나를 만난 날 {streak}일째</p>
        )}
      </div>

      {/* 오늘 상태 카드 */}
      <div
        className="rounded-[16px] p-5 mb-6"
        style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        {schedule?.next_call_at ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📞</span>
              <p className="text-[#1A1A1A] font-semibold">
                오늘 {formatCallTime(schedule.next_call_at)}에 전화 드릴게요
              </p>
            </div>
            {schedule.minutes_remaining !== null && schedule.minutes_remaining > 0 && (
              <p className="text-sm text-[#6B6B6B]">{schedule.minutes_remaining}분 후</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <p className="text-[#6B6B6B] text-sm">오늘 전화 예정 없어요</p>
          </div>
        )}

        {/* 수동 통화 시작 버튼 */}
        <button
          onClick={() => router.push("/overlay")}
          className="mt-4 w-full h-10 rounded-[10px] text-white text-sm font-semibold"
          style={{ backgroundColor: "#2D4A3E" }}
        >
          지금 통화하기
        </button>
      </div>

      {/* 최근 대화 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#1A1A1A]">최근 대화</h2>
          <button
            onClick={() => router.push("/history")}
            className="text-sm text-[#4A7C6F] font-medium"
          >
            전체 보기 →
          </button>
        </div>

        {recentCard ? (
          <button
            onClick={() => router.push(`/card/${recentCard.id}`)}
            className="w-full text-left"
          >
            <div
              className="rounded-[16px] p-5"
              style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
            >
              <p className="text-xs text-[#ABABAB] mb-2">
                {new Date(recentCard.called_at).toLocaleDateString("ko-KR", {
                  month: "long", day: "numeric", weekday: "short",
                })}
              </p>
              {recentCard.emotion && (
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">{recentCard.emotion}</p>
              )}
              {recentCard.summary ? (
                <p className="text-sm text-[#6B6B6B] line-clamp-2">{recentCard.summary}</p>
              ) : (
                <p className="text-sm text-[#ABABAB] italic">짧게 끝난 대화예요</p>
              )}
              {!!recentCard.keywords?.length && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {recentCard.keywords.slice(0, 3).map((k) => (
                    <span
                      key={k}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#FDF7E3", color: "#2D4A3E" }}
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ) : (
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
          >
            <p className="text-[#ABABAB] text-sm">아직 대화 기록이 없어요</p>
            <p className="text-[#ABABAB] text-xs mt-1">첫 전화를 기다려보세요 😊</p>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
