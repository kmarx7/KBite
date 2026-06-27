"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { MenuItemRow, Plan } from "@/types";
import { addMenuItem, deleteMenuItem } from "@/app/actions/partner";

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";
const labelClass = "mb-1 block text-[11px] font-bold text-[#8A6040]";

const EMPTY_FORM = { name: "", description: "", price: "", emoji: "🍽️" };

export default function MenuManager({
  restaurantId,
  plan,
  initialItems,
}: {
  restaurantId: string;
  plan: Plan;
  initialItems: MenuItemRow[];
}) {
  const t = useTranslations("partner");
  const [items, setItems] = useState<MenuItemRow[]>(initialItems);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (plan === "free") {
    return (
      <div className="rounded-2xl border border-[#FFE8D6] bg-[#FFF5EE] p-4 text-center">
        <p className="text-[13px] font-bold text-[#8A6040]">
          🔒 {t("menuLockedBasic")}
        </p>
      </div>
    );
  }

  const handleAdd = () => {
    if (isPending) return;
    setError(null);
    const payload = new FormData();
    payload.set("name", form.name.trim());
    payload.set("description", form.description.trim());
    payload.set("price", form.price || "0");
    payload.set("emoji", form.emoji.trim() || "🍽️");

    startTransition(async () => {
      const result = await addMenuItem(restaurantId, payload);
      if (result.ok) {
        setForm(EMPTY_FORM);
        /* optimistic update은 생략 — server revalidation이 목록 갱신 */
      } else {
        setError(result.error ?? "saveFailed");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (isPending) return;
    setItems((prev) => prev.filter((m) => m.id !== id));
    startTransition(async () => {
      const result = await deleteMenuItem(id, restaurantId);
      if (!result.ok) {
        /* 실패하면 목록 복원 */
        setItems(initialItems);
        setError(result.error ?? "saveFailed");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 기존 아이템 목록 */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-[#FFE8D6] bg-white p-3"
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-[#1A0800]">
                  {item.name}
                </p>
                {item.description && (
                  <p className="truncate text-[11px] text-[#8A6040]">
                    {item.description}
                  </p>
                )}
                <p className="text-[11px] font-bold text-[#FF6B35]">
                  ₩{item.price.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={isPending}
                className="shrink-0 rounded-lg bg-[#FEE2E2] px-2 py-1 text-[11px] font-bold text-[#B91C1C] disabled:opacity-50"
              >
                {t("delete")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 추가 폼 */}
      <div className="rounded-2xl border border-[#FFE8D6] bg-white p-4">
        <p className="mb-3 text-[12px] font-extrabold text-[#1A0800]">
          {t("addMenuItem")}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div style={{ width: 64 }}>
              <label className={labelClass}>이모지</label>
              <input
                className={inputClass}
                value={form.emoji}
                maxLength={4}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>{t("menuName")} *</label>
              <input
                className={inputClass}
                placeholder={t("menuNamePlaceholder")}
                value={form.name}
                maxLength={100}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("menuDescription")}</label>
            <input
              className={inputClass}
              placeholder={t("menuDescriptionPlaceholder")}
              value={form.description}
              maxLength={300}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>{t("menuPrice")} (₩)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              min={0}
              max={1000000}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
        </div>

        {error && (
          <p className="mt-2 text-[11px] font-bold text-[#B91C1C]">{error}</p>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !form.name.trim()}
          className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-extrabold text-white disabled:opacity-50"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {isPending ? "..." : t("addMenuItemSubmit")}
        </button>
      </div>
    </div>
  );
}
