"use client";

import { useTranslations } from "next-intl";
import { IconCheck } from "@tabler/icons-react";

const STEP_KEYS = ["stepBasic", "stepDetail", "stepVerify"] as const;

export default function StepIndicator({
  currentStep,
}: {
  currentStep: 1 | 2 | 3;
}) {
  const t = useTranslations("register");

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      {STEP_KEYS.map((key, i) => {
        const step = i + 1;
        const done = step < currentStep;
        const active = step === currentStep;
        return (
          <div key={key} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className="h-0.5 w-6 rounded-full"
                style={{ backgroundColor: done || active ? "#FF6B35" : "#FFE8D6" }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold"
                style={
                  done || active
                    ? { backgroundColor: "#FF6B35", color: "#FFFFFF" }
                    : {
                        backgroundColor: "#FFFFFF",
                        color: "#C0A080",
                        border: "1px solid #FFD4B8",
                      }
                }
              >
                {done ? <IconCheck size={12} stroke={3} /> : step}
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: active ? "#FF6B35" : done ? "#8A6040" : "#C0A080" }}
              >
                {t(key)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
