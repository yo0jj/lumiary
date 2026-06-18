import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "여보세요",
  description: "매일 AI가 안부 전화를 걸어 데일리 카드를 만들어드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "Pretendard, sans-serif", backgroundColor: "#F8F5F0" }}>
        {children}
      </body>
    </html>
  );
}
