"use client";

import { useState } from "react";

const EMOTION_EMOJI: Record<string, string> = {
  기쁨: "😊", 슬픔: "😢", 화남: "😤", 지침: "😮‍💨", 설렘: "🤩",
  불안: "😰", 평온: "😌", 외로움: "🥺", 감사: "🙏", 허탈: "😶",
  피곤: "😴", 뿌듯: "😌", 무기력: "😶‍🌫️",
};

const RATING_CHIPS = ["솔직했어요", "편했어요", "어색했어요", "질문이 좋았어요", "또 받고 싶어요"];

interface ActionItem {
  id: string;
  content: string;
  status: string;
}

interface Conversation {
  id: string;
  called_at: string;
  emotion?: string;
  emotion_intensity?: number;
  summary?: string;
  keywords?: string[];
  key_scene?: string;
  hidden_desire?: string;
  ai_comment?: string;
  rating?: number;
  rating_tags?: string[];
  action_item?: ActionItem;
  transcript?: { role: string; text: string }[];
}

interface Props {
  conversation: Conversation;
  onRate: (rating: number, tags: string[], comment: string) => Promise<void>;
  onActionItemDone: (itemId: string) => Promise<void>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[16px] p-5 ${className}`}
      style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
    >
      {children}
    </div>
  );
}

export default function DailyCard({ conversation: c, onRate, onActionItemDone }: Props) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(c.rating ?? 0);
  const [selectedChips, setSelectedChips] = useState<string[]>(c.rating_tags ?? []);
  const [comment, setComment] = useState("");
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [ratingSaved, setRatingSaved] = useState(!!c.rating);
  const [actionDone, setActionDone] = useState(c.action_item?.status === "done");

  const dt = new Date(c.called_at);
  const DAY = ["일", "월", "화", "수", "목", "금", "토"];
  const dateStr = `${dt.getMonth() + 1}월 ${dt.getDate()}일 ${DAY[dt.getDay()]}요일`;
  const emoji = EMOTION_EMOJI[c.emotion ?? ""] ?? "💭";

  async function saveRating() {
    if (ratingSaved || selectedRating === 0) return;
    await onRate(selectedRating, selectedChips, comment);
    setRatingSaved(true);
  }

  async function handleActionDone() {
    if (!c.action_item || actionDone) return;
    await onActionItemDone(c.action_item.id);
    setActionDone(true);
  }

  return (
    <div className="px-5 space-y-4">
      {/* 날짜 헤더 */}
      <div className="flex items-center justify-between py-1">
        <span className="text-[#6B6B6B] text-sm">{dateStr}</span>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: "#4A7C6F" }}
        >
          오늘의 렌즈
        </span>
      </div>

      {/* 감정 카드 */}
      {c.emotion && (
        <Card className="flex items-center gap-4">
          <span className="text-4xl">{emoji}</span>
          <div>
            <p className="text-[#1A1A1A] font-semibold text-lg">{c.emotion}</p>
            {c.emotion_intensity && (
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: n <= c.emotion_intensity! ? "#2D4A3E" : "#E8E8E8" }}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 요약 */}
      {c.summary && (
        <Card>
          <p className="text-[#1A1A1A] text-base leading-relaxed">{c.summary}</p>
        </Card>
      )}

      {/* 키워드 */}
      {!!c.keywords?.length && (
        <div className="flex flex-wrap gap-2">
          {c.keywords.map((k) => (
            <span
              key={k}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#FDF7E3", color: "#2D4A3E", border: "1px solid #F2C94C" }}
            >
              #{k}
            </span>
          ))}
        </div>
      )}

      {/* 핵심 장면 + 숨은 의미 */}
      {(c.key_scene || c.hidden_desire) && (
        <Card className="space-y-3">
          {c.key_scene && (
            <div>
              <p className="text-xs text-[#ABABAB] mb-1">오늘 가장 오래 남은 순간</p>
              <p className="text-[#1A1A1A] text-sm leading-relaxed">{c.key_scene}</p>
            </div>
          )}
          {c.hidden_desire && (
            <div>
              <p className="text-xs text-[#ABABAB] mb-1">그 뒤에 있던 마음</p>
              <p className="text-[#1A1A1A] text-sm leading-relaxed">{c.hidden_desire}</p>
            </div>
          )}
        </Card>
      )}

      {/* AI 코멘트 */}
      {c.ai_comment && (
        <div
          className="rounded-[16px] p-5"
          style={{ backgroundColor: "#EFF5F2", borderLeft: "3px solid #2D4A3E" }}
        >
          <p className="text-xs text-[#4A7C6F] font-medium mb-1">여보세요가 본 오늘의 나</p>
          <p className="text-[#1A1A1A] text-sm italic leading-relaxed">{c.ai_comment}</p>
        </div>
      )}

      {/* 실천 아이템 */}
      {c.action_item && (
        <Card>
          <p className="text-xs text-[#ABABAB] mb-3">내일의 아주 작은 실험</p>
          <button onClick={handleActionDone} className="flex items-start gap-3 w-full text-left">
            <div
              className="w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors"
              style={{
                borderColor: actionDone ? "#2D4A3E" : "#CCCCCC",
                backgroundColor: actionDone ? "#2D4A3E" : "transparent",
              }}
            >
              {actionDone && <span className="text-white text-xs leading-none">✓</span>}
            </div>
            <div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: actionDone ? "#ABABAB" : "#1A1A1A", textDecoration: actionDone ? "line-through" : "none" }}
              >
                {c.action_item.content}
              </p>
              {!actionDone && <p className="text-xs text-[#ABABAB] mt-1">오늘 대화에서 함께 정했어요</p>}
            </div>
          </button>
        </Card>
      )}

      {/* 별점 평가 */}
      <Card className="space-y-4">
        <p className="text-sm font-semibold text-[#1A1A1A]">오늘 대화 어떠셨나요?</p>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              disabled={ratingSaved}
              onMouseEnter={() => !ratingSaved && setHoveredStar(n)}
              onMouseLeave={() => !ratingSaved && setHoveredStar(0)}
              onClick={() => !ratingSaved && setSelectedRating(n)}
              className="text-2xl transition-transform hover:scale-110"
              style={{ color: n <= (hoveredStar || selectedRating) ? "#F2C94C" : "#E0E0E0" }}
            >
              ★
            </button>
          ))}
        </div>

        {selectedRating > 0 && !ratingSaved && (
          <>
            <div className="flex flex-wrap gap-2">
              {RATING_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() =>
                    setSelectedChips((prev) =>
                      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
                    )
                  }
                  className="px-3 py-1 rounded-full text-xs border transition-colors"
                  style={{
                    backgroundColor: selectedChips.includes(chip) ? "#2D4A3E" : "transparent",
                    color: selectedChips.includes(chip) ? "white" : "#6B6B6B",
                    borderColor: selectedChips.includes(chip) ? "#2D4A3E" : "#DDDDDD",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              onClick={saveRating}
              className="w-full h-10 rounded-[10px] text-white text-sm font-semibold"
              style={{ backgroundColor: "#2D4A3E" }}
            >
              저장
            </button>
          </>
        )}

        {ratingSaved && (
          <p className="text-xs text-[#ABABAB] text-center">평가해주셔서 감사해요 ✨</p>
        )}
      </Card>

      {/* 대화 내용 */}
      {!!c.transcript?.length && (
        <div
          className="rounded-[16px] overflow-hidden"
          style={{ backgroundColor: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          <button
            onClick={() => setTranscriptOpen((v) => !v)}
            className="w-full px-5 py-4 flex items-center justify-between text-sm font-medium text-[#1A1A1A]"
          >
            <span>대화 내용 보기</span>
            <span className="text-[#ABABAB]">{transcriptOpen ? "▲ 접기" : "▼ 펼치기"}</span>
          </button>
          {transcriptOpen && (
            <div className="px-5 pb-5 space-y-3 border-t border-[#F5F5F5]">
              {c.transcript.map((t, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: t.role === "ai" ? "#1A1A1A" : "#6B6B6B" }}>
                  <span className="font-medium mr-1">{t.role === "ai" ? "AI" : "나"}</span>
                  {t.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
