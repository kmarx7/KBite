"use client";

import { useTranslations } from "next-intl";
import { IconCheck, IconSparkles } from "@tabler/icons-react";

interface StepButtonProps {
  currentStep: 1 | 2 | 3;
  onNext: () => void;
  onPrev: () => void;
}

/** 등록 화면 하단 고정 영역 — 진행률 바 + Back/Next 버튼 */
export default function StepButton({
  currentStep,
  onNext,
  onPrev,
}: StepButtonProps) {
  const t = useTranslations("common");
  const tr = useTranslations("register");
  const isLast = currentStep === 3;
  const progress = (currentStep / 3) * 100;

  return (
    <div className="border-t border-[#FFE8D6] bg-[#FFFAF5] px-4 pb-6 pt-3">
      {/* ProgressBar: 33% → 66% → 100% */}
      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-[#FFE8D6]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: "#FF6B35",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div className="flex gap-2">
        {/* 1단계: display:none 금지 — visibility:hidden으로 자리 유지 */}
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 rounded-xl border border-[#FFD4B8] bg-white py-3 text-[14px] font-bold text-[#8A6040]"
          style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-extrabold text-white"
          style={{ backgroundColor: "#FF6B35" }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
            {isLast ? (
              <IconSparkles size={12} stroke={2.5} />
            ) : (
              <IconCheck size={12} stroke={3} />
            )}
          </span>
          <span>{isLast ? t("submit") : t("next")}</span>
          <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold">
            {tr("stepOf", { current: currentStep, total: 3 })}
          </span>
        </button>
      </div>
    </div>
  );
}
