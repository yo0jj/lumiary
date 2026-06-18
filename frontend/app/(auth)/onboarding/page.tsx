"use client";

import { useState } from "react";
import Step1Nickname from "./steps/Step1Nickname";
import Step2Voice from "./steps/Step2Voice";
import Step3Time from "./steps/Step3Time";
import Step4FirstCall from "./steps/Step4FirstCall";

interface OnboardData {
  nickname: string;
  voice_tone: string;
  call_time: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardData>>({
    voice_tone: "calm",
    call_time: "22:00",
  });

  function next(patch: Partial<OnboardData>) {
    setData((prev) => ({ ...prev, ...patch }));
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  if (step === 1) return <Step1Nickname onNext={(d) => next(d)} />;
  if (step === 2) return <Step2Voice onNext={(d) => next(d)} onBack={back} />;
  if (step === 3) return <Step3Time onNext={(d) => next(d)} onBack={back} />;
  if (step === 4)
    return (
      <Step4FirstCall
        data={data as OnboardData}
        onBack={back}
      />
    );

  return null;
}
