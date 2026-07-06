"use client";

import { useTranslations } from "next-intl";
import { IconNavigation } from "@tabler/icons-react";
import { TRACK_EVENTS, track } from "@/lib/analytics";

interface DetailCTAProps {
  restaurantId: string;
  name: string;
  lat: number;
  lng: number;
  startingPrice: number | null;
  bookingUrl: string | null;
}

export default function DetailCTA({
  restaurantId,
  name,
  lat,
  lng,
  startingPrice,
  bookingUrl,
}: DetailCTAProps) {
  const t = useTranslations("detail");

  return (
    <div className="sticky bottom-0 z-30 flex items-center gap-2 border-t border-[#FFE8D6] bg-[#FFFAF5] px-4 py-3">
      <p className="min-w-0 flex-1 text-[12px] font-bold text-[#8A6040]">
        {startingPrice !== null &&
          t("startingFrom", { price: `₩${startingPrice.toLocaleString()}` })}
      </p>
      <a
        href={`https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          track(TRACK_EVENTS.DIRECTIONS_CLICK, { restaurantId })
        }
        className="flex shrink-0 items-center gap-1 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-bold text-[#CC4400]"
      >
        <IconNavigation size={14} />
        {t("directions")}
      </a>
      {/* 예약 URL 있으면 외부 링크, 없으면 인앱 예약 요청 폼으로 스크롤 */}
      <a
        href={bookingUrl ?? "#reserve-request"}
        target={bookingUrl ? "_blank" : undefined}
        rel={bookingUrl ? "noopener noreferrer" : undefined}
        onClick={() =>
          track(TRACK_EVENTS.RESERVE_CLICK, {
            restaurantId,
            hasBookingUrl: Boolean(bookingUrl),
          })
        }
        className="shrink-0 rounded-xl px-5 py-2.5 text-[13px] font-extrabold text-white"
        style={{ backgroundColor: "#FF6B35" }}
      >
        {t("reserve")}
      </a>
    </div>
  );
}
