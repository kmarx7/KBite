"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  restaurantId: string;
}

export default function CancelSubscriptionButton({ restaurantId }: Props) {
  const t = useTranslations("partner");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm(t("cancelConfirm"))) return;
    setLoading(true);
    const res = await fetch("/api/billing/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="w-full rounded-2xl border border-[#FECACA] bg-[#FEE2E2] py-3 text-[13px] font-extrabold text-[#B91C1C] disabled:opacity-50"
    >
      {loading ? t("billingWorking") : t("planCancel")}
    </button>
  );
}
