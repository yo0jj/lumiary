"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "홈", icon: "🏠" },
  { href: "/history", label: "기록", icon: "📋" },
  { href: "/my", label: "마이", icon: "👤" },
] as const;

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto border-t flex"
      style={{ backgroundColor: "white", borderColor: "#F0F0F0" }}
    >
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="flex-1 flex flex-col items-center py-3 gap-0.5"
          >
            <span className="text-[22px]">{t.icon}</span>
            <span
              className="text-[11px] font-medium"
              style={{ color: active ? "#2D4A3E" : "#ABABAB" }}
            >
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
