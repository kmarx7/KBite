import { getTranslations } from "next-intl/server";
import type { Category } from "@/types";
import VenueMapView from "@/components/map/VenueMapView";

interface VenueMapProps {
  name: string;
  category: Category;
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
}

export default async function VenueMap({
  name,
  category,
  address,
  distanceKm,
  lat,
  lng,
}: VenueMapProps) {
  const t = await getTranslations("detail");

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-[15px] font-extrabold text-[#1A0800]">
        {t("location")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-[#FFE8D6] bg-white">
        <VenueMapView name={name} category={category} lat={lat} lng={lng} />
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
