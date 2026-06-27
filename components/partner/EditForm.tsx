"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { Certification, Language, Plan, PriceCurrency } from "@/types";
import { PRICE_OPTIONS } from "@/lib/price";
import { PLAN_FEATURES } from "@/lib/features";
import { updateRestaurant } from "@/app/actions/partner";
import CertToggle from "@/components/register/CertToggle";
import LangToggle from "@/components/register/LangToggle";
import UploadBox from "@/components/register/UploadBox";
import DateTimeButton from "@/components/ui/DateTimeButton";
import UpgradeSheet from "@/components/partner/UpgradeSheet";
import { formatPhone } from "@/lib/utils";

export interface EditableRestaurant {
  id: string;
  name: string;
  phone: string;
  address: string;
  openingTime: string | null;
  closingTime: string | null;
  priceCurrency: PriceCurrency;
  priceOptionIdx: number;
  about: string;
  certifications: Certification[];
  languages: Language[];
  bookingUrl: string;
  snsUrl: string;
  photoUrl: string | null;
  plan: Plan;
}

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";
const labelClass = "mb-1 block text-[11px] font-bold text-[#8A6040]";

/* 액션이 돌려주는 에러 키 → 네임스페이스 매핑 */
const COMMON_ERRORS = new Set(["fileTooLarge", "fileType"]);
const REGISTER_ERRORS = new Set(["requiredField", "invalidUrl"]);

export default function EditForm({
  restaurant,
}: {
  restaurant: EditableRestaurant;
}) {
  const t = useTranslations("partner");
  const tr = useTranslations("register");
  const tc = useTranslations("common");
  const [form, setForm] = useState(restaurant);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const set = <K extends keyof EditableRestaurant>(
    key: K,
    value: EditableRestaurant[K],
  ) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const errorText = (key: string) => {
    if (COMMON_ERRORS.has(key)) return tc(key, { size: 5 });
    if (REGISTER_ERRORS.has(key)) return tr(key);
    return t(key);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);

    const payload = new FormData();
    payload.set("name", form.name);
    payload.set("phone", form.phone);
    payload.set("address", form.address);
    if (form.openingTime) payload.set("openingTime", form.openingTime);
    if (form.closingTime) payload.set("closingTime", form.closingTime);
    payload.set("priceCurrency", form.priceCurrency);
    payload.set("priceOptionIdx", String(form.priceOptionIdx));
    payload.set("about", form.about);
    form.certifications.forEach((c) => payload.append("certifications", c));
    form.languages.forEach((l) => payload.append("languages", l));
    payload.set("bookingUrl", form.bookingUrl);
    payload.set("snsUrl", form.snsUrl);
    if (photo) payload.set("photo", photo);

    startTransition(async () => {
      const result = await updateRestaurant(restaurant.id, payload);
      if (result.ok) {
        setSaved(true);
        setPhoto(null);
      } else {
        setError(result.error ?? "saveFailed");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-4"
    >
      <div>
        <label className={labelClass} htmlFor="edit-name">
          {tr("restaurantName")} *
        </label>
        <input
          id="edit-name"
          className={inputClass}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="edit-phone">
          {tr("phoneNumber")}
        </label>
        <input
          id="edit-phone"
          type="tel"
          className={inputClass}
          value={form.phone}
          onChange={(e) => set("phone", formatPhone(e.target.value))}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="edit-address">
          {tr("address")} *
        </label>
        <input
          id="edit-address"
          className={inputClass}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>
      {/* 2열 그리드 — min-width:0 필수 */}
      <div className="grid grid-cols-2 gap-2">
        <DateTimeButton
          label={tr("openingTime")}
          value={form.openingTime}
          onChange={(time) => set("openingTime", time)}
        />
        <DateTimeButton
          label={tr("closingTime")}
          value={form.closingTime}
          onChange={(time) => set("closingTime", time)}
        />
      </div>
      <div>
        <span className={labelClass}>{tr("priceRange")}</span>
        <div className="mb-2 flex gap-2">
          {(["KRW", "USD"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                set("priceCurrency", c);
                set("priceOptionIdx", 1);
              }}
              className={`flex-1 rounded-xl py-2 text-[12px] font-extrabold transition-colors ${
                form.priceCurrency === c
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#FFF5EE] text-[#8A6040]"
              }`}
            >
              {c === "KRW" ? "₩ 원화" : "$ 달러"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRICE_OPTIONS[form.priceCurrency].map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => set("priceOptionIdx", i)}
              className={`rounded-xl py-2.5 text-[12px] font-bold transition-colors ${
                form.priceOptionIdx === i
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#FFF5EE] text-[#8A6040]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="edit-about">
          {tr("about")}
        </label>
        <textarea
          id="edit-about"
          rows={3}
          className={inputClass}
          value={form.about}
          onChange={(e) => set("about", e.target.value)}
        />
      </div>
      <div>
        <span className={labelClass}>{tr("dietaryCertifications")}</span>
        <CertToggle
          value={form.certifications}
          onChange={(certs) => set("certifications", certs)}
        />
      </div>
      <div>
        <span className={labelClass}>{tr("languagesSpoken")}</span>
        <LangToggle
          value={form.languages}
          onChange={(langs) => set("languages", langs)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="edit-booking">
          Reservation URL
        </label>
        <input
          id="edit-booking"
          type="url"
          className={inputClass}
          placeholder="https://..."
          value={form.bookingUrl}
          onChange={(e) => set("bookingUrl", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="edit-sns">
          {tr("websiteSns")}
        </label>
        <input
          id="edit-sns"
          type="url"
          className={inputClass}
          placeholder="https://instagram.com/..."
          value={form.snsUrl}
          onChange={(e) => set("snsUrl", e.target.value)}
        />
      </div>
      <div>
        <span className={labelClass}>{tr("restaurantPhoto")}</span>
        <p className="mb-1.5 text-[10px] text-[#B07040]">
          {`${form.photoUrl || photo ? 1 : 0} / ${PLAN_FEATURES[restaurant.plan].maxPhotos}`}
          {restaurant.plan === "free" && (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="ms-1 font-bold text-[#FF6B35] underline-offset-2 hover:underline"
            >
              · {t("upgradeForMorePhotos")}
            </button>
          )}
        </p>
        {form.photoUrl && !photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.photoUrl}
            alt=""
            className="mb-2 h-32 w-full rounded-2xl border border-[#FFE8D6] object-cover"
          />
        )}
        <UploadBox
          label={tr("uploadPhoto")}
          value={photo}
          onChange={(file) => {
            setSaved(false);
            setPhoto(file);
          }}
        />
      </div>

      {error && (
        <p className="text-[12px] font-bold text-[#B91C1C]">
          {errorText(error)}
        </p>
      )}
      {saved && (
        <p className="rounded-xl bg-[#DCFCE7] p-3 text-[12px] font-bold text-[#15803D]">
          {t("saved")}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mb-6 rounded-xl py-3 text-[14px] font-extrabold text-white disabled:opacity-60"
        style={{ backgroundColor: "#FF6B35" }}
      >
        {t("save")}
      </button>

      <UpgradeSheet
        restaurantId={restaurant.id}
        requiredPlan="basic"
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </form>
  );
}
