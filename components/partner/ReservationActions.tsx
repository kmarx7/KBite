"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { respondReservation } from "@/app/actions/reservations";

/** pending 예약에 대한 수락/거절 — 처리 후 손님에게 자동 이메일 */
export default function ReservationActions({
  reservationId,
}: {
  reservationId: string;
}) {
  const t = useTranslations("partner");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const respond = (action: "confirm" | "decline") => {
    if (isPending) return;
    startTransition(async () => {
      await respondReservation(reservationId, action);
      router.refresh();
    });
  };

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => respond("confirm")}
        className="rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-extrabold text-[#15803D] disabled:opacity-50"
      >
        {t("resAccept")}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => respond("decline")}
        className="rounded-full bg-[#FEE2E2] px-3 py-1 text-[11px] font-extrabold text-[#B91C1C] disabled:opacity-50"
      >
        {t("resDecline")}
      </button>
    </div>
  );
}
