"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconX, IconLock } from "@tabler/icons-react";
import { track, TRACK_EVENTS } from "@/lib/analytics";
import type { Plan } from "@/types";

interface UpgradeModalProps {
  requiredPlan: Exclude<Plan, "free">;
  restaurantId: string;
  onDismiss: () => void;
}

const PLAN_LABEL: Record<Exclude<Plan, "free">, string> = {
  basic: "Basic",
  premium: "Premium",
};

export default function UpgradeModal({
  requiredPlan,
  restaurantId,
  onDismiss,
}: UpgradeModalProps) {
  const t = useTranslations("pricing");

  useEffect(() => {
    track(TRACK_EVENTS.PREMIUM_VIEW, { requiredPlan, restaurantId });
  }, [requiredPlan, restaurantId]);

  function handleCta() {
    track(TRACK_EVENTS.PREMIUM_CLICK, { requiredPlan, restaurantId });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        {/* 닫기 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EC]">
            <IconLock size={20} color="#FF6B35" />
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5EDE0]"
          >
            <IconX size={14} color="#8A6040" />
          </button>
        </div>

        <h2 className="text-[18px] font-extrabold text-[#1A0800]">
          {t("upgradeModalTitle")}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-[#8A6040]">
          {t("upgradeModalDesc", { plan: PLAN_LABEL[requiredPlan] })}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/partner/restaurant/${restaurantId}/billing`}
            onClick={handleCta}
            className="flex items-center justify-center rounded-2xl py-3 text-[14px] font-extrabold text-white"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {t("upgradeModalCta")}
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-2xl border border-[#FFD4B8] py-3 text-[13px] font-bold text-[#8A6040]"
          >
            {t("upgradeModalDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
