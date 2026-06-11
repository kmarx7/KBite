"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconHeart } from "@tabler/icons-react";
import type { RestaurantListItem } from "@/types";
import { DEFAULT_LOCATION, haversineKm, isOpenNow } from "@/lib/utils";
import { useSavedIds } from "@/lib/saved";
import RestaurantCard from "@/components/restaurant/RestaurantCard";
import LanguageButton from "@/components/ui/LanguageButton";
import TabBar from "@/components/ui/TabBar";

export default function SavedScreen({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  const t = useTranslations("saved");
  const savedIds = useSavedIds();
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  const origin = myLocation ?? DEFAULT_LOCATION;
  /* 찜한 순서 유지 */
  const saved = savedIds
    .map((id) => restaurants.find((r) => r.id === id))
    .filter((r): r is RestaurantListItem => r !== undefined);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-4 py-2.5">
        <h1 className="text-[19px] font-extrabold text-[#1A0800]">
          {t("title")}
        </h1>
        <span className="text-[13px] font-bold text-[#FF6B35]">
          {saved.length > 0 && saved.length}
        </span>
        <div className="ms-auto">
          <LanguageButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {saved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8D6]">
              <IconHeart size={26} color="#FF6B35" />
            </span>
            <p className="text-[15px] font-extrabold text-[#1A0800]">
              {t("empty")}
            </p>
            <p className="max-w-xs text-[12px] leading-relaxed text-[#8A6040]">
              {t("emptyDesc")}
            </p>
            <Link
              href="/"
              className="mt-1 rounded-xl px-5 py-3 text-[13px] font-extrabold text-white"
              style={{ backgroundColor: "#FF6B35" }}
            >
              {t("explore")}
            </Link>
          </div>
        ) : (
          saved.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              distanceKm={haversineKm(origin, r)}
              isOpen={isOpenNow(r.opening_time, r.closing_time)}
            />
          ))
        )}
      </main>

      <TabBar active="saved" />
    </div>
  );
}
