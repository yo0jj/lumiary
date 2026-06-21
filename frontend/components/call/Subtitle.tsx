"use client";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface Props {
  messages: Message[];
}

export default function Subtitle({ messages }: Props) {
  const recent = messages.slice(-2);

  return (
    <div className="px-6 mb-4 min-h-[64px] flex flex-col justify-end space-y-1.5">
      {recent.map((m, i) => (
        <p
          key={i}
          className="text-sm leading-snug"
          style={{ color: m.role === "ai" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}
        >
          <span className="font-medium mr-1">{m.role === "ai" ? "AI" : "나"}:</span>
          {m.text}
        </p>
      ))}
    </div>
  );
}
