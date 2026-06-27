export type PriceCurrency = "KRW" | "USD";

export interface PriceOption {
  min: number | null;
  max: number | null;
  label: string;
  priceRange: "budget" | "moderate" | "upscale";
}

export const PRICE_OPTIONS: Record<PriceCurrency, readonly PriceOption[]> = {
  KRW: [
    { min: null, max: 10000, label: "~₩10,000", priceRange: "budget" },
    { min: 10000, max: 30000, label: "₩10,000~30,000", priceRange: "budget" },
    { min: 30000, max: 50000, label: "₩30,000~50,000", priceRange: "moderate" },
    { min: 50000, max: null, label: "₩50,000~", priceRange: "upscale" },
  ],
  USD: [
    { min: null, max: 10, label: "~$10", priceRange: "budget" },
    { min: 10, max: 30, label: "$10~$30", priceRange: "budget" },
    { min: 30, max: 50, label: "$30~$50", priceRange: "moderate" },
    { min: 50, max: null, label: "$50~", priceRange: "upscale" },
  ],
};

export function formatPriceDisplay(
  currency: PriceCurrency | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  priceRange: "budget" | "moderate" | "upscale" | null | undefined,
): string {
  if (currency && (min != null || max != null)) {
    const sym = currency === "KRW" ? "₩" : "$";
    const fmt = (n: number) =>
      currency === "KRW" ? n.toLocaleString("ko-KR") : String(n);
    if (min != null && max != null) return `${sym}${fmt(min)}~${fmt(max)}`;
    if (min != null) return `${sym}${fmt(min)}~`;
    return `~${sym}${fmt(max!)}`;
  }
  if (priceRange === "budget") return "₩";
  if (priceRange === "moderate") return "₩₩";
  if (priceRange === "upscale") return "₩₩₩";
  return "";
}

/** price_range 기반으로 기본 옵션 인덱스를 역추론 (구 데이터 호환) */
export function inferPriceOptionIdx(
  currency: PriceCurrency,
  min: number | null,
  max: number | null,
  priceRange: "budget" | "moderate" | "upscale" | null,
): number {
  const opts = PRICE_OPTIONS[currency];
  const byValues = opts.findIndex((o) => o.min === min && o.max === max);
  if (byValues >= 0) return byValues;
  if (priceRange === "upscale") return 3;
  if (priceRange === "moderate") return 2;
  return 1;
}
