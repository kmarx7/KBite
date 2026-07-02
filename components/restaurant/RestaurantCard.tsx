"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconStarFilled } from "@tabler/icons-react";
import { CATEGORIES, type RestaurantListItem } from "@/types";
import { formatPriceDisplay } from "@/lib/price";
import { PLAN_FEATURES } from "@/lib/features";
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
  const { color, emoji } = CATEGORIES[r.category];

  return (
    <Link
      href={`/restaurant/${r.id}`}
      className="flex overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow active:shadow-md"
    >
      {/* 왼쪽 패널 — 사진 있으면 이미지, 없으면 카테고리 그라디언트 + 이모지 */}
      <div className="relative flex w-[76px] shrink-0 items-center justify-center overflow-hidden">
        {r.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.photo_url}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${color}2e 0%, ${color}0f 100%)`,
            }}
          />
        )}
        {!r.photo_url && (
          <span className="relative text-[32px]" aria-hidden>
            {r.cover_emoji}
          </span>
        )}
      </div>

      {/* 오른쪽 콘텐츠 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pe-3 ps-3">
        {/* 이름 + 오픈 dot */}
        <div className="flex items-center gap-2">
          {/* 색약 사용자용 이중 부호화: 영업 중 = 채움, 마감 = 빈 원 */}
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={
              isOpen
                ? { backgroundColor: "#22C55E" }
                : { border: "1.5px solid #EF4444" }
            }
            aria-label={isOpen ? tc("openNow") : tc("closed")}
          />
          <h3 className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-tight text-[#1A0800]">
            {r.name}
          </h3>
        </div>

        {/* 카테고리 + 거리 */}
        <p className="text-[12px] font-semibold text-[#8A6040]">
          <span aria-hidden>{emoji}</span> {t(r.category)}&ensp;·&ensp;
          {distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)}km
        </p>

        {/* 평점 + 리뷰 수 + 가격 + 인증 뱃지 */}
        <div className="flex items-center gap-2">
          {r.avg_rating > 0 && (
            <span className="flex items-center gap-0.5 text-[12px] font-bold text-[#1A0800]">
              <IconStarFilled size={11} color="#F59E0B" />
              {r.avg_rating}
            </span>
          )}
          {r.review_count > 0 && (
            <span className="text-[11px] text-[#B07040]">
              {tc("reviews", { count: r.review_count })}
            </span>
          )}
          {(r.price_range != null ||
            r.price_min != null ||
            r.price_max != null) && (
            <span className="text-[11px] font-bold text-[#8A6040]">
              {formatPriceDisplay(
                r.price_currency,
                r.price_min,
                r.price_max,
                r.price_range,
              )}
            </span>
          )}
          {PLAN_FEATURES[r.plan].certBadgeEnabled && (
            <span className="ms-auto flex gap-1">
              {r.certifications.slice(0, 3).map((cert) => (
                <CertBadge key={cert} cert={cert} variant="compact" />
              ))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
