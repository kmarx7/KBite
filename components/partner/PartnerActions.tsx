"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconLink, IconLogout } from "@tabler/icons-react";
import { claimRestaurant, partnerLogout } from "@/app/actions/partner";

export function ClaimButton({ id }: { id: string }) {
  const t = useTranslations("partner");
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await claimRestaurant(id);
            if (result.ok) router.refresh();
            else setFailed(true);
          })
        }
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-white disabled:opacity-50"
        style={{ backgroundColor: "#FF6B35" }}
      >
        <IconLink size={12} stroke={2.5} /> {t("claim")}
      </button>
      {failed && (
        <span className="text-[10px] font-bold text-[#B91C1C]">
          {t("claimFailed")}
        </span>
      )}
    </div>
  );
}

export function LogoutButton() {
  const t = useTranslations("partner");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await partnerLogout();
          router.push("/partner/login");
          router.refresh();
        })
      }
      className="flex items-center gap-1 rounded-full border border-[#FFD4B8] bg-white px-3 py-1.5 text-[11px] font-bold text-[#8A6040] disabled:opacity-50"
    >
      <IconLogout size={12} /> {t("logout")}
    </button>
  );
}
