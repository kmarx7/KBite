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

export type PriceSteps = {
  min: ReadonlyArray<number | null>;
  max: ReadonlyArray<number | null>;
};

export const PRICE_STEPS: Record<PriceCurrency, PriceSteps> = {
  KRW: {
    min: [null, 5000, 10000, 15000, 20000, 30000, 50000, 70000, 100000],
    max: [5000, 10000, 15000, 20000, 30000, 50000, 70000, 100000, null],
  },
  USD: {
    min: [null, 5, 10, 15, 20, 30, 50, 100],
    max: [5, 10, 15, 20, 30, 50, 100, null],
  },
};

function formatStepValue(currency: PriceCurrency, val: number): string {
  if (currency === "KRW") return `₩${val.toLocaleString("ko-KR")}`;
  return `$${val}`;
}

export function getPriceMinItems(currency: PriceCurrency): string[] {
  return PRICE_STEPS[currency].min.map((v) =>
    v === null ? "없음" : formatStepValue(currency, v),
  );
}

export function getPriceMaxItems(currency: PriceCurrency): string[] {
  return PRICE_STEPS[currency].max.map((v) =>
    v === null ? "∞" : formatStepValue(currency, v),
  );
}

export function findMinStepIdx(currency: PriceCurrency, val: number | null): number {
  if (val === null) return 0;
  const steps = PRICE_STEPS[currency].min;
  const exact = steps.findIndex((s) => s === val);
  if (exact >= 0) return exact;
  let bestIdx = 1;
  let bestDist = Infinity;
  for (let i = 1; i < steps.length; i++) {
    const s = steps[i];
    if (s == null) continue;
    const d = Math.abs(s - val);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return bestIdx;
}

export function findMaxStepIdx(currency: PriceCurrency, val: number | null): number {
  const steps = PRICE_STEPS[currency].max;
  if (val === null) return steps.length - 1;
  const exact = steps.findIndex((s) => s === val);
  if (exact >= 0) return exact;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i];
    if (s == null) continue;
    const d = Math.abs(s - val);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return bestIdx;
}

export function priceRangeFromMinMax(
  currency: PriceCurrency,
  min: number | null,
  max: number | null,
): "budget" | "moderate" | "upscale" {
  if (max === null) {
    const m = min ?? 0;
    if (currency === "KRW") return m >= 30000 ? "upscale" : "moderate";
    return m >= 30 ? "upscale" : "moderate";
  }
  if (currency === "KRW") {
    if (max >= 50000) return "upscale";
    if (max >= 30000) return "moderate";
    return "budget";
  }
  if (max >= 50) return "upscale";
  if (max >= 30) return "moderate";
  return "budget";
}

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

