"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconStarFilled } from "@tabler/icons-react";
import { CATEGORIES, type RestaurantListItem } from "@/types";
import CertBadge from "@/components/ui/CertBadge";

interface RestaurantCardProps {
  restaurant: RestaurantListItem;
  distanceKm: number;
  isOpen: boolean;
}

export default function RestaurantCard({
  restaurant: r,
  distanceKm,
  isOpen,
}: RestaurantCardProps) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");

  return (
    <Link
      href={`/restaurant/${r.id}`}
      className="flex gap-3 rounded-2xl border border-[#FFE8D6] bg-white p-3 transition-shadow active:shadow-md"
    >
      {/* 썸네일 + 거리 배지 */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${CATEGORIES[r.category].color}1A` }}
          aria-hidden
        >
          {r.cover_emoji}
        </span>
        <span className="rounded-full bg-[#FFF5EE] px-1.5 py-0.5 text-[9px] font-extrabold text-[#CC4400]">
          {distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)}km
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-extrabold"
          style={{ color: CATEGORIES[r.category].color }}
        >
          {CATEGORIES[r.category].emoji} {t(r.category)}
        </p>
        <div className="flex items-center gap-1.5">
          <h3 className="min-w-0 truncate text-[14px] font-bold text-[#1A0800]">
            {r.name}
          </h3>
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold"
            style={
              isOpen
                ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                : { backgroundColor: "#FEE2E2", color: "#B91C1C" }
            }
          >
            {isOpen ? tc("openNow") : tc("closed")}
          </span>
        </div>
        {r.cuisine && (
          <p className="truncate text-[11px] text-[#8A6040]">{r.cuisine}</p>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-[#1A0800]">
            <IconStarFilled size={10} color="#F59E0B" />
            {r.avg_rating > 0 ? r.avg_rating : "—"}
          </span>
          <span className="text-[10px] text-[#B07040]">
            {tc("reviews", { count: r.review_count })}
          </span>
          <span className="ms-auto flex gap-1">
            {r.certifications.slice(0, 3).map((cert) => (
              <CertBadge key={cert} cert={cert} variant="compact" />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
