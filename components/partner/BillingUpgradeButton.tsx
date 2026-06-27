"use client";

import { useState } from "react";

interface Props {
  restaurantId: string;
  plan: "basic" | "premium";
  planLabel: string;
  price: number;
  restaurantName: string;
  userEmail: string;
}

export default function BillingUpgradeButton({
  restaurantId,
  plan,
  planLabel,
  price,
  restaurantName,
  userEmail,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { loadTossPayments } = await import(
        "@tosspayments/tosspayments-sdk"
      );
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!,
      );
      const payment = tossPayments.payment({ customerKey: restaurantId });
      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: `${window.location.origin}/partner/restaurant/${restaurantId}/billing/success?plan=${plan}`,
        failUrl: `${window.location.origin}/partner/restaurant/${restaurantId}/billing/fail`,
        customerEmail: userEmail,
        customerName: restaurantName,
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[13px] font-extrabold text-white disabled:opacity-60"
      style={{ backgroundColor: "#FF6B35" }}
    >
      {loading
        ? "처리 중..."
        : `${planLabel} 플랜으로 업그레이드 (₩${price.toLocaleString()}/월)`}
    </button>
  );
}
