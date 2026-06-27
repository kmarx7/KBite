"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  restaurantId: string;
}

export default function CancelSubscriptionButton({ restaurantId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (
      !confirm(
        "구독을 취소하면 현재 결제 기간이 끝날 때까지는 혜택이 유지됩니다. 취소하시겠습니까?",
      )
    )
      return;
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
      {loading ? "처리 중..." : "구독 취소"}
    </button>
  );
}
