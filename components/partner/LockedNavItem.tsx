"use client";

import { useState } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import UpgradeModal from "@/components/partner/UpgradeModal";
import type { Plan } from "@/types";
import type { ReactNode } from "react";

interface LockedNavItemProps {
  restaurantId: string;
  requiredPlan: Exclude<Plan, "free">;
  icon: ReactNode;
  label: string;
  badgeLabel: string;
}

export default function LockedNavItem({
  restaurantId,
  requiredPlan,
  icon,
  label,
  badgeLabel,
}: LockedNavItemProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-[#FFE8D6] bg-white px-4 py-3 text-left"
      >
        {icon}
        <span className="flex-1 text-[13px] font-bold text-[#1A0800]">
          {label}
        </span>
        <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[9px] font-extrabold text-[#D97706]">
          {badgeLabel}
        </span>
        <IconChevronRight size={15} color="#C0A080" />
      </button>
      {showModal && (
        <UpgradeModal
          requiredPlan={requiredPlan}
          restaurantId={restaurantId}
          onDismiss={() => setShowModal(false)}
        />
      )}
    </>
  );
}
