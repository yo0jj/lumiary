"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import DailyCard from "@/components/cards/DailyCard";

export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => { setConversation(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleRate(rating: number, tags: string[], comment: string) {
    await api.patch(`/conversations/${id}/rating`, { rating, tags, comment });
    setConversation((prev: any) => ({ ...prev, rating, rating_tags: tags }));
  }

  async function handleActionItemDone(itemId: string) {
    await api.patch(`/action-items/${itemId}`, { status: "done" });
    setConversation((prev: any) => ({
      ...prev,
      action_item: { ...prev.action_item, status: "done" },
    }));
  }

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#F8F5F0" }}
      >
        <div className="text-3xl animate-bounce">✨</div>
        <p className="text-[#6B6B6B] text-sm">대화를 정리하고 있어요…</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#F8F5F0" }}>
        <div className="text-center space-y-3">
          <p className="text-[#6B6B6B]">카드를 불러올 수 없어요.</p>
          <button onClick={() => router.push("/home")} className="text-[#2D4A3E] text-sm font-medium">
            홈으로 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: "#F8F5F0" }}>
      <div
        className="sticky top-0 z-10 flex items-center px-5 py-4"
        style={{ backgroundColor: "#F8F5F0" }}
      >
        <button
          onClick={() => router.push("/home")}
          className="text-[#2D4A3E] font-medium text-sm"
        >
          ← 홈
        </button>
      </div>
      <DailyCard
        conversation={conversation}
        onRate={handleRate}
        onActionItemDone={handleActionItemDone}
      />
    </div>
  );
}
