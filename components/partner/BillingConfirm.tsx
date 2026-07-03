"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { confirmBillingAuth } from "@/app/actions/billing";

interface Props {
  restaurantId: string;
  authKey: string;
  customerKey: string;
  plan: "basic" | "premium";
}

type Phase =
  | { state: "processing" }
  | { state: "done"; amount?: number }
  | { state: "error"; messageKey: string; detail?: string };

/** 카드 등록 리다이렉트 착지 후 결제 확정을 1회 호출 — GET 렌더 부수효과 제거 */
export default function BillingConfirm({
  restaurantId,
  authKey,
  customerKey,
  plan,
}: Props) {
  const t = useTranslations("partner");
  const [phase, setPhase] = useState<Phase>({ state: "processing" });
  const startedRef = useRef(false);

  useEffect(() => {
    /* StrictMode 이중 실행 가드 — 서버 측 orderId 선기록이 최종 방어선 */
    if (startedRef.current) return;
    startedRef.current = true;
    void confirmBillingAuth({ restaurantId, authKey, customerKey, plan }).then(
      (result) => {
        setPhase(
          result.ok
            ? { state: "done", amount: result.amount }
            : {
                state: "error",
                messageKey: result.error ?? "paymentError",
                detail: result.errorDetail,
              },
        );
      },
    );
  }, [restaurantId, authKey, customerKey, plan]);

  const ok = phase.state === "done";
  const processing = phase.state === "processing";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#FFFAF5] p-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-[28px] font-extrabold"
        style={
          processing
            ? { backgroundColor: "#FFE8D6", color: "#CC4400" }
            : ok
              ? { backgroundColor: "#DCFCE7", color: "#15803D" }
              : { backgroundColor: "#FEE2E2", color: "#B91C1C" }
        }
      >
        {processing ? "…" : ok ? "✓" : "✕"}
      </div>

      <p className="text-[20px] font-extrabold text-[#1A0800]">
        {processing
          ? t("billingProcessing")
          : ok
            ? t("billingDone")
            : t("billingFailed")}
      </p>

      {processing && (
        <p className="max-w-xs text-[13px] text-[#8A6040]">
          {t("billingProcessingDesc")}
        </p>
      )}
      {phase.state === "done" && (
        <p className="text-[13px] text-[#8A6040]">
          {plan === "basic" ? t("planBasic") : t("planPremium")}
          {phase.amount != null && (
            <>
              {" "}
              · ₩{phase.amount.toLocaleString()}
              {t("planPerMonth")}
            </>
          )}
        </p>
      )}
      {phase.state === "error" && (
        <p className="max-w-xs text-[13px] text-[#8A6040]">
          {t(phase.messageKey)}
          {phase.detail && <> — {phase.detail}</>}
        </p>
      )}

      {!processing && (
        <Link
          href={`/partner/restaurant/${restaurantId}/billing`}
          className="mt-4 rounded-2xl bg-[#FF6B35] px-6 py-3 text-[14px] font-extrabold text-white"
        >
          {ok ? t("billingGoManage") : t("billingGoBack")}
        </Link>
      )}
    </div>
  );
}
