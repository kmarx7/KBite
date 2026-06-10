"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconChevronLeft, IconSparkles } from "@tabler/icons-react";
import type { Category, Certification, Language, PriceRange } from "@/types";
import StepIndicator from "@/components/register/StepIndicator";
import CategoryGrid from "@/components/register/CategoryGrid";
import CertToggle from "@/components/register/CertToggle";
import LangToggle from "@/components/register/LangToggle";
import UploadBox from "@/components/register/UploadBox";
import StepButton from "@/components/ui/StepButton";
import DateTimeButton from "@/components/ui/DateTimeButton";
import { validateStep, ALLOWED_DOC_TYPES } from "@/lib/validation/register";
import { registerRestaurant } from "@/app/actions/register";

interface RegisterForm {
  name: string;
  ownerEmail: string;
  phone: string;
  category: Category | null;
  address: string;
  openingTime: string | null;
  closingTime: string | null;
  priceRange: PriceRange;
  about: string;
  certifications: Certification[];
  languages: Language[];
  photo: File | null;
  bizRegNo: string;
  certFile: File | null;
  snsUrl: string;
}

const INITIAL_FORM: RegisterForm = {
  name: "",
  ownerEmail: "",
  phone: "",
  category: null,
  address: "",
  openingTime: null,
  closingTime: null,
  priceRange: "moderate",
  about: "",
  certifications: [],
  languages: [],
  photo: null,
  bizRegNo: "",
  certFile: null,
  snsUrl: "",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";

const labelClass = "mb-1 block text-[11px] font-bold text-[#8A6040]";

export default function RegisterPage() {
  const t = useTranslations("register");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNext = () => {
    /* zod 스키마 검증 — 작업 2에서 서버 측에 동일 스키마 재사용 */
    const errorKey = validateStep(step, form);
    if (errorKey) {
      setError(errorKey);
      return;
    }
    setError(null);
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }
    if (isPending) return;
    /* 서버 액션이 zod 재검증 + status:pending/plan:free 강제 후 DB 저장 */
    const payload = new FormData();
    payload.set("name", form.name);
    payload.set("ownerEmail", form.ownerEmail);
    payload.set("phone", form.phone);
    payload.set("category", form.category ?? "");
    payload.set("address", form.address);
    if (form.openingTime) payload.set("openingTime", form.openingTime);
    if (form.closingTime) payload.set("closingTime", form.closingTime);
    payload.set("priceRange", form.priceRange);
    payload.set("about", form.about);
    form.certifications.forEach((c) => payload.append("certifications", c));
    form.languages.forEach((l) => payload.append("languages", l));
    payload.set("bizRegNo", form.bizRegNo);
    payload.set("snsUrl", form.snsUrl);
    if (form.photo) payload.set("photo", form.photo);

    startTransition(async () => {
      const result = await registerRestaurant(payload);
      if (result.ok) setSubmitted(true);
      else setError(result.error ?? "submitFailed");
    });
  };

  const handlePrev = () => {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  if (submitted) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8D6]">
          <IconSparkles size={26} color="#FF6B35" />
        </span>
        <h1 className="text-[19px] font-extrabold text-[#1A0800]">
          {t("submitted")}
        </h1>
        <p className="max-w-xs text-[13px] leading-relaxed text-[#8A6040]">
          {t("submittedDesc")}
        </p>
        <Link
          href="/"
          className="mt-2 rounded-xl px-5 py-3 text-[14px] font-extrabold text-white"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {t("backToExplore")}
        </Link>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* NavBar */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5]/95 px-3 py-2 backdrop-blur">
        <Link href="/" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#1A0800]">
          {t("title")}
        </h1>
      </header>

      <StepIndicator currentStep={step} />

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-extrabold text-[#1A0800]">
              {t("basicInfo")}
            </h2>
            <div>
              <label className={labelClass} htmlFor="reg-name">
                {t("restaurantName")} *
              </label>
              <input
                id="reg-name"
                className={inputClass}
                placeholder={t("restaurantNamePlaceholder")}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-email">
                {t("ownerEmail")} *
              </label>
              <input
                id="reg-email"
                type="email"
                className={inputClass}
                placeholder="owner@example.com"
                value={form.ownerEmail}
                onChange={(e) => set("ownerEmail", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-phone">
                {t("phoneNumber")}
              </label>
              <input
                id="reg-phone"
                type="tel"
                className={inputClass}
                placeholder="02-1234-5678"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <span className={labelClass}>{t("category")} *</span>
              <CategoryGrid
                value={form.category}
                onChange={(cat) => set("category", cat)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-extrabold text-[#1A0800]">
              {t("restaurantDetail")}
            </h2>
            <div>
              <label className={labelClass} htmlFor="reg-address">
                {t("address")} *
              </label>
              <input
                id="reg-address"
                className={inputClass}
                placeholder={t("addressPlaceholder")}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            {/* 2열 그리드 — min-width:0 필수 */}
            <div className="grid grid-cols-2 gap-2">
              <DateTimeButton
                label={t("openingTime")}
                value={form.openingTime}
                onChange={(time) => set("openingTime", time)}
              />
              <DateTimeButton
                label={t("closingTime")}
                value={form.closingTime}
                onChange={(time) => set("closingTime", time)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-price">
                {t("priceRange")}
              </label>
              <select
                id="reg-price"
                className={inputClass}
                value={form.priceRange}
                onChange={(e) =>
                  set("priceRange", e.target.value as PriceRange)
                }
              >
                <option value="budget">₩</option>
                <option value="moderate">₩₩</option>
                <option value="upscale">₩₩₩</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-about">
                {t("about")}
              </label>
              <textarea
                id="reg-about"
                rows={3}
                className={inputClass}
                placeholder={t("aboutPlaceholder")}
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
              />
            </div>
            <div>
              <span className={labelClass}>{t("dietaryCertifications")}</span>
              <CertToggle
                value={form.certifications}
                onChange={(certs) => set("certifications", certs)}
              />
            </div>
            <div>
              <span className={labelClass}>{t("languagesSpoken")}</span>
              <LangToggle
                value={form.languages}
                onChange={(langs) => set("languages", langs)}
              />
            </div>
            <div>
              <span className={labelClass}>{t("restaurantPhoto")}</span>
              <UploadBox
                label={t("uploadPhoto")}
                value={form.photo}
                onChange={(file) => set("photo", file)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-extrabold text-[#1A0800]">
              {t("verification")}
            </h2>
            <div>
              <label className={labelClass} htmlFor="reg-bizno">
                {t("businessRegNo")} *
              </label>
              <input
                id="reg-bizno"
                className={inputClass}
                placeholder="000-00-00000"
                value={form.bizRegNo}
                onChange={(e) => set("bizRegNo", e.target.value)}
              />
            </div>
            <div>
              <span className={labelClass}>{t("halalCertificate")}</span>
              <UploadBox
                label={t("uploadCertificate")}
                accept="image/*,.pdf"
                allowedTypes={ALLOWED_DOC_TYPES}
                value={form.certFile}
                onChange={(file) => set("certFile", file)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-sns">
                {t("websiteSns")}
              </label>
              <input
                id="reg-sns"
                type="url"
                className={inputClass}
                placeholder="https://instagram.com/..."
                value={form.snsUrl}
                onChange={(e) => set("snsUrl", e.target.value)}
              />
            </div>
            <p className="rounded-xl bg-[#FFF5EE] p-3 text-[11px] leading-relaxed text-[#8A6040]">
              {t("verifyNotice")}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-[12px] font-bold text-[#B91C1C]">
            {t(error)}
          </p>
        )}
      </main>

      <StepButton currentStep={step} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}
