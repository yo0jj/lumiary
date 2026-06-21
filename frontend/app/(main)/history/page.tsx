"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import BottomTabBar from "@/components/BottomTabBar";

type Filter = "all" | "week" | "month";

interface Conversation {
  id: string;
  called_at: string;
  emotion?: string;
  summary?: string;
  keywords?: string[];
  rating?: number;
  action_item?: { content: string; status: string };
}

const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "week", label: "이번 주" },
  { key: "month", label: "이번 달" },
];

function filterByPeriod(list: Conversation[], filter: Filter) {
  if (filter === "all") return list;
  const now = new Date();
  const cutoff = new Date(now);
  if (filter === "week") cutoff.setDate(now.getDate() - 7);
  if (filter === "month") cutoff.setMonth(now.getMonth() - 1);
  return list.filter((c) => new Date(c.called_at) >= cutoff);
}

function groupByMonth(list: Conversation[]) {
  const groups: Record<string, Conversation[]> = {};
  for (const c of list) {
    const d = new Date(c.called_at);
    const key = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    (groups[key] ??= []).push(c);
  }
  return Object.entries(groups);
}

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/conversations?limit=50")
      .then((r) => r.json())
      .then((data) => { setConversations(data.conversations ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filterByPeriod(conversations, filter);
  const grouped = groupByMonth(filtered);

  return (
    <div className="min-h-screen pb-24 pt-12" style={{ backgroundColor: "#F8F5F0" }}>
      {/* 헤더 */}
      <div className="px-5 mb-6">
        <h1 className="text-[22px] font-bold text-[#1A1A1A]">기록</h1>
      </div>

      {/* 필터 */}
      <div className="px-5 mb-5 flex gap-2">
        {FILTER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: filter === key ? "#2D4A3E" : "white",
              color: filter === key ? "white" : "#6B6B6B",
              border: `1px solid ${filter === key ? "#2D4A3E" : "#E0E0E0"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[16px] h-24 animate-pulse" style={{ backgroundColor: "#E8E8E8" }} />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-2">
          <p className="text-[#ABABAB] text-sm">아직 대화 기록이 없어요</p>
          <p className="text-[#ABABAB] text-xs">첫 전화를 기다려보세요 😊</p>
        </div>
      ) : (
        <div className="px-5 space-y-6">
          {grouped.map(([month, items]) => (
            <div key={month}>
              <p className="text-xs font-semibold text-[#ABABAB] mb-3 uppercase tracking-wide">{month}</p>
              <div className="space-y-3">
                {items.map((c) => {
                  const d = new Date(c.called_at);
                  const DAY = ["일", "월", "화", "수", "목", "금", "토"];
                  return (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/card/${c.id}`)}
                      className="w-full text-left rounded-[16px] p-4"
                      style={{ backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-[#ABABAB]">
                          {d.getMonth() + 1}/{d.getDate()} {DAY[d.getDay()]}
                          {" · "}
                          {d.getHours()}:{String(d.getMinutes()).padStart(2, "0")}
                        </span>
                        {c.rating && (
                          <span className="text-xs text-[#F2C94C]">{"★".repeat(c.rating)}</span>
                        )}
                      </div>

                      {!!c.keywords?.length && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {c.keywords.slice(0, 3).map((k) => (
                            <span key={k} className="text-xs text-[#4A7C6F]">#{k}</span>
                          ))}
                        </div>
                      )}

                      {c.summary ? (
                        <p className="text-sm text-[#1A1A1A] line-clamp-2">{c.summary}</p>
                      ) : (
                        <p className="text-xs text-[#ABABAB] italic">짧게 끝난 대화예요</p>
                      )}

                      {c.action_item && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-xs">{c.action_item.status === "done" ? "✅" : "☐"}</span>
                          <span className="text-xs text-[#6B6B6B] line-clamp-1">{c.action_item.content}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomTabBar />
    </div>
  );
}
