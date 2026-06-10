"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconX } from "@tabler/icons-react";
import type { Certification, PriceRange } from "@/types";

export type SortOption = "nearest" | "rating" | "open" | "newest";

export interface FilterState {
  sort: SortOption;
  certifications: Certification[];
  priceRanges: PriceRange[];
}

export const DEFAULT_FILTER: FilterState = {
  sort: "nearest",
  certifications: [],
  priceRanges: [],
};

/** 적용된 필터 개수 (정렬 기본값 제외) */
export function countActiveFilters(f: FilterState): number {
  return (
    f.certifications.length +
    f.priceRanges.length +
    (f.sort !== "nearest" ? 1 : 0)
  );
}

const SORT_KEYS: Record<SortOption, string> = {
  nearest: "nearest",
  rating: "highestRated",
  open: "openNowFirst",
  newest: "newestListed",
};

const CERTS: Certification[] = ["halal", "vegan", "kosher", "gf", "dairy-free"];
const PRICES: { value: PriceRange; key: string }[] = [
  { value: "budget", key: "priceBudget" },
  { value: "moderate", key: "priceModerate" },
  { value: "upscale", key: "priceUpscale" },
];

interface FilterSortSheetProps {
  open: boolean;
  value: FilterState;
  onApply: (value: FilterState) => void;
  onClose: () => void;
}

export default function FilterSortSheet({
  open,
  ...props
}: FilterSortSheetProps) {
  /* 닫혀 있으면 언마운트 — 열릴 때마다 draft가 현재 값으로 초기화됨 */
  if (!open) return null;
  return <SheetContent {...props} />;
}

function SheetContent({
  value,
  onApply,
  onClose,
}: Omit<FilterSortSheetProps, "open">) {
  const t = useTranslations("filterSheet");
  const tc = useTranslations("certifications");
  const tCommon = useTranslations("common");
  const [draft, setDraft] = useState<FilterState>(value);

  const toggleCert = (cert: Certification) =>
    setDraft((d) => ({
      ...d,
      certifications: d.certifications.includes(cert)
        ? d.certifications.filter((c) => c !== cert)
        : [...d.certifications, cert],
    }));

  const togglePrice = (price: PriceRange) =>
    setDraft((d) => ({
      ...d,
      priceRanges: d.priceRanges.includes(price)
        ? d.priceRanges.filter((p) => p !== price)
        : [...d.priceRanges, price],
    }));

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label={t("title")}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-[#FFFAF5] p-5 pb-8 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#FFD4B8]" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-[#1A0800]">
            {t("title")}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <IconX size={18} color="#8A6040" />
          </button>
        </div>

        {/* 정렬 — 단일 선택 */}
        <p className="mb-2 text-[12px] font-bold text-[#8A6040]">
          {t("sortBy")}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(SORT_KEYS) as SortOption[]).map((sort) => {
            const active = draft.sort === sort;
            return (
              <button
                key={sort}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, sort }))}
                className="rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
                style={
                  active
                    ? { backgroundColor: "#FF6B35", color: "#FFFFFF" }
                    : {
                        backgroundColor: "#FFFFFF",
                        color: "#8A6040",
                        border: "1px solid #FFD4B8",
                      }
                }
              >
                {t(SORT_KEYS[sort])}
              </button>
            );
          })}
        </div>

        {/* 식이 인증 — 중복 선택 */}
        <p className="mb-2 text-[12px] font-bold text-[#8A6040]">
          {t("dietary")}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {CERTS.map((cert) => {
            const active = draft.certifications.includes(cert);
            return (
              <button
                key={cert}
                type="button"
                onClick={() => toggleCert(cert)}
                aria-pressed={active}
                className="rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors"
                style={
                  active
                    ? { backgroundColor: "#15803D", color: "#FFFFFF" }
                    : {
                        backgroundColor: "#FFFFFF",
                        color: "#8A6040",
                        border: "1px solid #FFD4B8",
                      }
                }
              >
                {tc(cert)}
              </button>
            );
          })}
        </div>

        {/* 가격대 — 중복 선택 */}
        <p className="mb-2 text-[12px] font-bold text-[#8A6040]">
          {t("priceRange")}
        </p>
        <div className="mb-6 flex gap-2">
          {PRICES.map(({ value: price, key }) => {
            const active = draft.priceRanges.includes(price);
            return (
              <button
                key={price}
                type="button"
                onClick={() => togglePrice(price)}
                aria-pressed={active}
                className="flex-1 rounded-xl py-2 text-[13px] font-bold transition-colors"
                style={
                  active
                    ? { backgroundColor: "#FF6B35", color: "#FFFFFF" }
                    : {
                        backgroundColor: "#FFFFFF",
                        color: "#8A6040",
                        border: "1px solid #FFD4B8",
                      }
                }
              >
                {t(key)}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft(DEFAULT_FILTER)}
            className="flex-1 rounded-xl border border-[#FFD4B8] bg-white py-3 text-[14px] font-bold text-[#8A6040]"
          >
            {tCommon("resetAll")}
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex-[2] rounded-xl py-3 text-[14px] font-extrabold text-white"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {tCommon("apply")}
          </button>
        </div>
      </div>
    </>
  );
}
