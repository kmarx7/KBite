"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { CATEGORIES, type Category, type Certification } from "@/types";
import { TRACK_EVENTS, track } from "@/lib/analytics";
import CertBadge from "@/components/ui/CertBadge";

interface DetailCoverProps {
  restaurantId: string;
  category: Category;
  certifications: Certification[];
  coverEmoji: string;
  photoUrl?: string | null;
}

export default function DetailCover({
  restaurantId,
  category,
  certifications,
  coverEmoji,
  photoUrl,
}: DetailCoverProps) {
  const t = useTranslations("categories");
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="relative flex h-[190px] items-center justify-center overflow-hidden"
      style={{
        background: photoUrl
          ? undefined
          : `linear-gradient(135deg, ${CATEGORIES[category].color}33, #FFE8D6)`,
      }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="text-6xl" aria-hidden>
          {coverEmoji}
        </span>
      )}
      {/* 하단 그라데이션 오버레이 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

      {/* 카테고리 pill — 좌상단 */}
      <span
        className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white"
        style={{ backgroundColor: CATEGORIES[category].color }}
      >
        {CATEGORIES[category].emoji} {t(category)}
      </span>

      {/* 인증 pill — 우상단 */}
      <div className="absolute end-3 top-3 flex flex-col items-end gap-1">
        {certifications.map((cert) => (
          <CertBadge key={cert} cert={cert} />
        ))}
      </div>

      {/* 찜 버튼 — 우하단 */}
      <button
        type="button"
        onClick={() =>
          setLiked((v) => {
            if (!v)
              track(TRACK_EVENTS.RESTAURANT_SAVE, { restaurantId, category });
            return !v;
          })
        }
        aria-pressed={liked}
        aria-label="Save restaurant"
        className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
      >
        {liked ? (
          <IconHeartFilled size={18} color="#FF6B35" />
        ) : (
          <IconHeart size={18} color="#8A6040" />
        )}
      </button>
    </div>
  );
}
