import { getTranslations } from "next-intl/server";
import type { MenuItem } from "@/types";

export default async function MenuList({ items }: { items: MenuItem[] }) {
  const t = await getTranslations("detail");

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-[15px] font-extrabold text-[#1A0800]">
        {t("popularMenu")}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-3 rounded-2xl border border-[#FFE8D6] bg-white p-3"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF5EE] text-xl"
              aria-hidden
            >
              {item.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-[#1A0800]">
                {item.name}
              </p>
              <p className="truncate text-[11px] text-[#8A6040]">
                {item.description}
              </p>
            </div>
            <span className="shrink-0 text-[13px] font-extrabold text-[#FF6B35]">
              ₩{item.price.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
