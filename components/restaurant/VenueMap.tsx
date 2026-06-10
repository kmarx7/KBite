import { getTranslations } from "next-intl/server";
import { IconMapPin } from "@tabler/icons-react";

interface VenueMapProps {
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
}

/* 카카오맵 미니 지도는 작업 6에서 연결 — 그 전까지 주소 카드로 표시 */
export default async function VenueMap({
  address,
  distanceKm,
}: VenueMapProps) {
  const t = await getTranslations("detail");

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-[15px] font-extrabold text-[#1A0800]">
        {t("location")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
        <div className="flex h-24 items-center justify-center bg-[#FFF5EE]">
          <p className="flex items-center gap-1 text-[11px] font-semibold text-[#B07040]">
            <IconMapPin size={14} color="#FF6B35" />
            {t("mapPlaceholder")}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#1A0800]">
            {address}
          </p>
          <span className="shrink-0 text-[11px] font-bold text-[#FF6B35]">
            {t("distanceAway", { distance: `${distanceKm}km` })}
          </span>
        </div>
      </div>
    </section>
  );
}
