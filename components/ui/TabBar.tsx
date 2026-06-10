"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IconCompass,
  IconHeart,
  IconBell,
  IconUser,
} from "@tabler/icons-react";

type Tab = "explore" | "saved" | "alerts" | "profile";

const TABS: { key: Tab; Icon: typeof IconCompass; href: string | null }[] = [
  { key: "explore", Icon: IconCompass, href: "/" },
  /* saved/alerts/profile 라우트는 추후 작업에서 추가 — 그 전까지 비활성 */
  { key: "saved", Icon: IconHeart, href: null },
  { key: "alerts", Icon: IconBell, href: null },
  { key: "profile", Icon: IconUser, href: null },
];

export default function TabBar({ active }: { active: Tab }) {
  const t = useTranslations("tabs");

  return (
    <nav className="sticky bottom-0 z-30 flex border-t border-[#FFE8D6] bg-[#FFFAF5] pb-4 pt-2">
      {TABS.map(({ key, Icon, href }) => {
        const isActive = key === active;
        const color = isActive ? "#FF6B35" : "#C0A080";
        const inner = (
          <>
            <Icon size={20} stroke={isActive ? 2.5 : 2} color={color} />
            <span
              className="text-[10px] font-bold"
              style={{ color }}
            >
              {t(key)}
            </span>
          </>
        );
        return href ? (
          <Link
            key={key}
            href={href}
            className="flex flex-1 flex-col items-center gap-0.5"
          >
            {inner}
          </Link>
        ) : (
          <span
            key={key}
            aria-disabled
            className="flex flex-1 cursor-default flex-col items-center gap-0.5 opacity-60"
          >
            {inner}
          </span>
        );
      })}
    </nav>
  );
}
