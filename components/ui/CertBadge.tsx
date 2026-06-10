"use client";

import { useTranslations } from "next-intl";
import type { Certification } from "@/types";

const CERT_STYLES: Record<
  Certification,
  { mark: string; bg: string; text: string; border: string }
> = {
  halal: { mark: "✓", bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
  vegan: { mark: "🌿", bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
  kosher: { mark: "✡", bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" },
  gf: { mark: "GF", bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" },
  "dairy-free": { mark: "🥛", bg: "#F3E8FF", text: "#7E22CE", border: "#D8B4FE" },
};

interface CertBadgeProps {
  cert: Certification;
  /** compact: 마크만 표시 (카드용), full: 마크 + 라벨 (상세용) */
  variant?: "compact" | "full";
}

export default function CertBadge({ cert, variant = "full" }: CertBadgeProps) {
  const t = useTranslations("certifications");
  const s = CERT_STYLES[cert];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      title={t(cert)}
    >
      <span aria-hidden>{s.mark}</span>
      {variant === "full" && <span>{t(cert)}</span>}
    </span>
  );
}
