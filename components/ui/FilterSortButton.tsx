"use client";

import { useTranslations } from "next-intl";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";

interface FilterSortProps {
  /** 활성 필터 개수 — 0보다 크면 오렌지 배지 표시 */
  activeCount: number;
  /** 현재 정렬 기준 라벨 (i18n 처리된 문자열) */
  currentSort: string;
  onOpen: () => void;
}

export default function FilterSortButton({
  activeCount,
  currentSort,
  onOpen,
}: FilterSortProps) {
  const t = useTranslations("home");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative flex items-center gap-1.5 rounded-full border border-[#FFD4B8] bg-white px-3 py-1.5 text-[12px] font-bold text-[#8A6040] shadow-sm"
    >
      <IconAdjustmentsHorizontal size={14} stroke={2.5} color="#FF6B35" />
      <span>{t("filterSort")}</span>
      <span className="text-[#B07040]">· {currentSort}</span>
      {activeCount > 0 && (
        <span
          className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {activeCount}
        </span>
      )}
    </button>
  );
}
