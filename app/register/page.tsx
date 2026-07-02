"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconChevronLeft, IconSparkles } from "@tabler/icons-react";
import type { Category, Certification, Language, PriceCurrency } from "@/types";
import {
  PRICE_STEPS,
  getPriceMinItems,
  getPriceMaxItems,
  findMinStepIdx,
  findMaxStepIdx,
} from "@/lib/price";
import WheelPicker from "@/components/ui/WheelPicker";
import StepIndicator from "@/components/register/StepIndicator";
import AddressSearch from "@/components/register/AddressSearch";
import CategoryGrid from "@/components/register/CategoryGrid";
import CertToggle from "@/components/register/CertToggle";
import LangToggle from "@/components/register/LangToggle";
import UploadBox from "@/components/register/UploadBox";
import StepButton from "@/components/ui/StepButton";
import DateTimeButton from "@/components/ui/DateTimeButton";
import {
  validateStepFields,
  ALLOWED_DOC_TYPES,
} from "@/lib/validation/register";
import { registerRestaurant } from "@/app/actions/register";
import { TRACK_EVENTS, track } from "@/lib/analytics";
import { formatPhone, formatBizRegNo } from "@/lib/utils";

interface RegisterForm {
  name: string;
  ownerEmail: string;
  phone: string;
  category: Category | null;
  address: string;
  addressDetail: string;
  lat: number | null;
  lng: number | null;
  openingTime: string | null;
  closingTime: string | null;
  priceCurrency: PriceCurrency;
  priceMin: number | null;
  priceMax: number | null;
  about: string;
  certifications: Certification[];
  languages: Language[];
  photo: File | null;
  bizRegNo: string;
  certFile: File | null;
  snsUrl: string;
  consent: boolean;
}

const INITIAL_FORM: RegisterForm = {
  name: "",
  ownerEmail: "",
  phone: "",
  category: null,
  address: "",
  addressDetail: "",
  lat: null,
  lng: null,
  openingTime: null,
  closingTime: null,
  priceCurrency: "KRW",
  priceMin: 10000,
  priceMax: 30000,
  about: "",
  certifications: [],
  languages: [],
  photo: null,
  bizRegNo: "",
  certFile: null,
  snsUrl: "",
  consent: false,
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";

const labelClass = "mb-1 block text-[11px] font-bold text-[#8A6040]";

/* 작성 중 이탈 대비 임시저장 — 파일(photo/certFile)은 직렬화 불가라 제외 */
const DRAFT_KEY = "kbite.registerDraft.v1";

type DraftData = Omit<RegisterForm, "photo" | "certFile"> & {
  step: 1 | 2 | 3;
};

function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

export default function RegisterPage() {
  const t = useTranslations("register");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [snsNone, setSnsNone] = useState(true);

  const set = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors({});
  };

  /* 마운트 시 드래프트 복원 (비동기 — 하이드레이션 이후) */
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const draft = loadDraft();
      if (!draft) return;
      const { step: draftStep, ...fields } = draft;
      setForm((f) => ({ ...f, ...fields }));
      setStep(draftStep);
      setSnsNone(!fields.snsUrl);
      setDraftRestored(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* 입력할 때마다 드래프트 저장 (디바운스) */
  useEffect(() => {
    if (submitted) return;
    const id = setTimeout(() => {
      const { photo: _photo, certFile: _certFile, ...rest } = form;
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...rest, step }));
      } catch {
        /* 저장 공간 부족 등 — 드래프트는 편의 기능이라 무시 */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [form, step, submitted]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm(INITIAL_FORM);
    setStep(1);
    setSnsNone(true);
    setDraftRestored(false);
    setError(null);
    setFieldErrors({});
  };

  const handleNext = () => {
    /* zod 스키마 검증 (필드 단위) — 서버 측에서 동일 스키마 재검증 */
    const errors = validateStepFields(step, form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(null);
      return;
    }
    /* 주소는 검색으로 선택해야 좌표가 확정됨 — 좌표 없으면 지도에 못 올림 */
    if (step === 2 && (form.lat == null || form.lng == null)) {
      setError("addressSearchRequired");
      return;
    }
    setError(null);
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }
    if (isPending) return;
    if (!form.consent) {
      setError("consentRequired");
      return;
    }
    /* 서버 액션이 zod 재검증 + status:pending/plan:free 강제 후 DB 저장 */
    const payload = new FormData();
    payload.set("name", form.name);
    payload.set("ownerEmail", form.ownerEmail);
    payload.set("phone", form.phone);
    payload.set("category", form.category ?? "");
    payload.set(
      "address",
      form.addressDetail
        ? `${form.address}, ${form.addressDetail}`
        : form.address,
    );
    payload.set("lat", form.lat != null ? String(form.lat) : "");
    payload.set("lng", form.lng != null ? String(form.lng) : "");
    if (form.openingTime) payload.set("openingTime", form.openingTime);
    if (form.closingTime) payload.set("closingTime", form.closingTime);
    payload.set("priceCurrency", form.priceCurrency);
    payload.set("priceMin", form.priceMin != null ? String(form.priceMin) : "");
    payload.set("priceMax", form.priceMax != null ? String(form.priceMax) : "");
    payload.set("about", form.about);
    form.certifications.forEach((c) => payload.append("certifications", c));
    form.languages.forEach((l) => payload.append("languages", l));
    payload.set("bizRegNo", form.bizRegNo);
    payload.set("snsUrl", form.snsUrl);
    payload.set("consent", String(form.consent));
    if (form.photo) payload.set("photo", form.photo);
    if (form.certFile) payload.set("certFile", form.certFile);

    startTransition(async () => {
      const result = await registerRestaurant(payload);
      if (result.ok) {
        track(TRACK_EVENTS.RESTAURANT_REGISTERED, {
          category: form.category ?? "",
        });
        localStorage.removeItem(DRAFT_KEY);
        setSubmitted(true);
      } else {
        setError(result.error ?? "submitFailed");
      }
    });
  };

  const handlePrev = () => {
    setError(null);
    setFieldErrors({});
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const fieldError = (field: string) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-[11px] font-bold text-[#B91C1C]" role="alert">
        {t(fieldErrors[field])}
      </p>
    ) : null;

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
        {draftRestored && (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-[#FFF5EE] px-3 py-2">
            <p className="text-[11px] font-semibold text-[#8A6040]">
              {t("draftRestored")}
            </p>
            <button
              type="button"
              onClick={clearDraft}
              className="shrink-0 text-[11px] font-bold text-[#CC4400] underline underline-offset-2"
            >
              {t("draftClear")}
            </button>
          </div>
        )}
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
                aria-invalid={!!fieldErrors.name}
              />
              {fieldError("name")}
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
                aria-invalid={!!fieldErrors.ownerEmail}
              />
              {fieldError("ownerEmail")}
              {/* 이 이메일이 파트너 센터 로그인·소유권 연결의 열쇠 */}
              <p className="mt-1 text-[11px] leading-relaxed text-[#B07040]">
                {t("ownerEmailHint")}
              </p>
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
                onChange={(e) => set("phone", formatPhone(e.target.value))}
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldError("phone")}
            </div>
            <div>
              <span className={labelClass}>{t("category")} *</span>
              <CategoryGrid
                value={form.category}
                onChange={(cat) => set("category", cat)}
              />
              {fieldError("category")}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[16px] font-extrabold text-[#1A0800]">
              {t("restaurantDetail")}
            </h2>
            <div>
              <span className={labelClass}>{t("address")} *</span>
              <AddressSearch
                value={{ address: form.address, lat: form.lat, lng: form.lng }}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    address: v.address,
                    lat: v.lat,
                    lng: v.lng,
                  }))
                }
              />
              {form.address && (
                <input
                  id="reg-address-detail"
                  className={`${inputClass} mt-2`}
                  placeholder={t("addressDetailPlaceholder")}
                  value={form.addressDetail}
                  onChange={(e) => set("addressDetail", e.target.value)}
                  maxLength={100}
                />
              )}
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
              <span className={labelClass}>{t("priceRange")}</span>
              <div className="mb-2 flex gap-2">
                {(["KRW", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      set("priceCurrency", c);
                      set("priceMin", c === "KRW" ? 10000 : 10);
                      set("priceMax", c === "KRW" ? 30000 : 30);
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
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <WheelPicker
                    label="최소"
                    items={getPriceMinItems(form.priceCurrency)}
                    selectedIndex={findMinStepIdx(form.priceCurrency, form.priceMin)}
                    onChange={(idx) =>
                      set("priceMin", PRICE_STEPS[form.priceCurrency].min[idx] ?? null)
                    }
                  />
                </div>
                <span className="mb-6 text-[16px] font-bold text-[#B07040]">~</span>
                <div className="flex-1">
                  <WheelPicker
                    label="최대"
                    items={getPriceMaxItems(form.priceCurrency)}
                    selectedIndex={findMaxStepIdx(form.priceCurrency, form.priceMax)}
                    onChange={(idx) =>
                      set("priceMax", PRICE_STEPS[form.priceCurrency].max[idx] ?? null)
                    }
                  />
                </div>
              </div>
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
                onChange={(e) => set("bizRegNo", formatBizRegNo(e.target.value))}
                aria-invalid={!!fieldErrors.bizRegNo}
              />
              {fieldError("bizRegNo")}
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
              <span className={labelClass}>{t("websiteSns")}</span>
              <div className="mb-2 flex gap-2">
                {([true, false] as const).map((isNone) => (
                  <button
                    key={String(isNone)}
                    type="button"
                    onClick={() => {
                      setSnsNone(isNone);
                      if (isNone) set("snsUrl", "");
                    }}
                    className={`flex-1 rounded-xl py-2 text-[12px] font-extrabold transition-colors ${
                      snsNone === isNone
                        ? "bg-[#FF6B35] text-white"
                        : "bg-[#FFF5EE] text-[#8A6040]"
                    }`}
                  >
                    {isNone ? t("snsNone") : t("snsEnter")}
                  </button>
                ))}
              </div>
              {!snsNone && (
                <input
                  id="reg-sns"
                  type="url"
                  className={inputClass}
                  placeholder="https://instagram.com/..."
                  value={form.snsUrl}
                  onChange={(e) => set("snsUrl", e.target.value)}
                />
              )}
            </div>
            <p className="rounded-xl bg-[#FFF5EE] p-3 text-[11px] leading-relaxed text-[#8A6040]">
              {t("verifyNotice")}
            </p>
            {/* 약관 동의 — 필수 */}
            <label className="flex items-start gap-2 rounded-xl border border-[#FFD4B8] bg-white p-3">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#FF6B35]"
              />
              <span className="text-[11px] leading-relaxed text-[#8A6040]">
                {t.rich("consent", {
                  terms: (chunks) => (
                    <Link
                      href="/policy/terms"
                      target="_blank"
                      className="font-bold text-[#FF6B35] underline"
                    >
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link
                      href="/policy/privacy"
                      target="_blank"
                      className="font-bold text-[#FF6B35] underline"
                    >
                      {chunks}
                    </Link>
                  ),
                  partner: (chunks) => (
                    <Link
                      href="/policy/partner"
                      target="_blank"
                      className="font-bold text-[#FF6B35] underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>
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
