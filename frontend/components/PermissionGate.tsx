"use client";

import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

type PermState = "idle" | "checking" | "granted" | "denied";

export default function PermissionGate({ children }: Props) {
  const [state, setState] = useState<PermState>("idle");

  useEffect(() => {
    // 마이크 권한 지원 여부 확인
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("denied");
      return;
    }

    setState("checking");
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((result) => {
        setState(result.state === "denied" ? "denied" : "granted");
        result.onchange = () => {
          setState(result.state === "denied" ? "denied" : "granted");
        };
      })
      .catch(() => setState("granted")); // 권한 API 미지원 브라우저는 허용으로 처리
  }, []);

  if (state === "denied") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 px-8 bg-[#F8F5F0]">
        <span className="text-5xl">🎙️</span>
        <h2 className="text-lg font-bold text-[#1A1A1A] text-center">
          마이크 권한이 필요해요
        </h2>
        <p className="text-sm text-[#6B6B6B] text-center leading-relaxed">
          여보세요는 음성으로 대화해요.
          <br />
          브라우저 설정에서 마이크 권한을 허용해주세요.
        </p>
        <button
          onClick={() => {
            // 권한 재요청 시도
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then(() => setState("granted"))
              .catch(() => {});
          }}
          className="px-8 py-3 rounded-[12px] text-white text-sm font-semibold"
          style={{ backgroundColor: "#2D4A3E" }}
        >
          다시 허용하기
        </button>
      </div>
    );
  }

  // checking 상태에서도 children 표시 (실제 요청은 통화 시작 시)
  return <>{children}</>;
}
