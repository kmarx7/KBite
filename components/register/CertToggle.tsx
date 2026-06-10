"use client";

import { useTranslations } from "next-intl";
import type { Certification } from "@/types";

const CERTS: Certification[] = ["halal", "vegan", "kosher", "gf", "dairy-free"];

interface CertToggleProps {
  value: Certification[];
  onChange: (certs: Certification[]) => void;
}

export default function CertToggle({ value, onChange }: CertToggleProps) {
  const t = useTranslations("certifications");

  const toggle = (cert: Certification) =>
    onChange(
      value.includes(cert)
        ? value.filter((c) => c !== cert)
        : [...value, cert],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {CERTS.map((cert) => {
        const active = value.includes(cert);
        return (
          <button
            key={cert}
            type="button"
            onClick={() => toggle(cert)}
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
            {t(cert)}
          </button>
        );
      })}
    </div>
  );
}
