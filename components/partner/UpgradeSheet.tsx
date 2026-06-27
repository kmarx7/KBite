"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { TRACK_EVENTS, track } from "@/lib/analytics";

interface UpgradeSheetProps {
  restaurantId: string;
  requiredPlan: "basic" | "premium";
  open: boolean;
  onClose: () => void;
}

export default function UpgradeSheet({
  restaurantId,
  requiredPlan,
  open,
  onClose,
}: UpgradeSheetProps) {
  const t = useTranslations("pricing");
  const tp = useTranslations("partner");

  if (!open) return null;

  const planLabel =
    requiredPlan === "basic" ? tp("planBasic") : tp("planPremium");

  const billingHref = `/partner/restaurant/${restaurantId}/billing`;

  const handleCta = () => {
    track(TRACK_EVENTS.PREMIUM_CLICK, { requiredPlan, restaurantId });
    onClose();
  };

  return (
    /* 백드롭 */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      {/* 시트 */}
      <div
        className="w-full max-w-lg rounded-t-3xl bg-[#FFFAF5] px-5 pb-8 pt-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#FFD4B8]" />

        <p className="mb-1 text-[18px] font-extrabold text-[#1A0800]">
          {t("upgradeModalTitle")}
        </p>
        <p className="mb-5 text-[13px] leading-relaxed text-[#8A6040]">
          {t("upgradeModalDesc", { plan: planLabel })}
        </p>

        <Link
          href={billingHref}
          onClick={handleCta}
          className="flex items-center justify-center rounded-2xl py-3 text-[14px] font-extrabold text-white"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {t("upgradeModalCta")}
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-[#FFD4B8] py-3 text-[13px] font-bold text-[#8A6040]"
        >
          {t("upgradeModalDismiss")}
        </button>
      </div>
    </div>
  );
}
