"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconBuildingStore, IconChevronLeft } from "@tabler/icons-react";
import {
  partnerLogin,
  partnerSignUp,
  partnerRequestPasswordReset,
} from "@/app/actions/partner";
import { TRACK_EVENTS, track } from "@/lib/analytics";
import { formatBizRegNo } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-[#FFD4B8] bg-white px-3 py-3 text-[14px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";

export default function PartnerLoginPage() {
  return (
    <Suspense fallback={null}>
      <PartnerLoginInner />
    </Suspense>
  );
}

function PartnerLoginInner() {
  const t = useTranslations("partner");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  /* /auth/confirm에서 만료 링크로 되돌아온 경우 안내 */
  const [error, setError] = useState<string | null>(() =>
    searchParams.get("error") === "resetExpired" ? "resetExpired" : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [bizRegNo, setBizRegNo] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setNotice(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "reset") {
        await partnerRequestPasswordReset(formData);
        /* 계정 존재 여부 무관 동일 안내 (열거 방지) */
        setNotice("resetSent");
        setMode("login");
        return;
      }

      const result =
        mode === "login"
          ? await partnerLogin(formData)
          : await partnerSignUp(formData);

      if (!result.ok) {
        setError(result.error ?? "loginFailed");
        return;
      }
      if (result.needsEmailConfirm) {
        setNotice("emailConfirmSent");
        setMode("login");
        return;
      }
      if (mode === "signup") track(TRACK_EVENTS.PARTNER_SIGNUP);
      router.push("/partner");
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5] px-3 py-2">
        <Link href="/profile" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#1A0800]">
          {t("loginTitle")}
        </h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8D6]">
          <IconBuildingStore size={26} color="#FF6B35" />
        </span>
        <h2 className="mb-5 text-[18px] font-extrabold text-[#1A0800]">
          {t("title")}
        </h2>

        {/* 로그인 / 가입 전환 (재설정 모드에서는 숨김) */}
        {mode !== "reset" && (
        <div className="mb-4 flex w-full max-w-xs rounded-xl border border-[#FFD4B8] bg-white p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className="flex-1 rounded-lg py-2 text-[13px] font-bold transition-colors"
              style={
                mode === m
                  ? { backgroundColor: "#FF6B35", color: "#FFFFFF" }
                  : { color: "#8A6040" }
              }
            >
              {t(m)}
            </button>
          ))}
        </div>
        )}

        {mode === "reset" && (
          <p className="mb-4 max-w-xs text-center text-[12px] leading-relaxed text-[#8A6040]">
            {t("resetDesc")}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xs flex-col gap-3"
        >
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("email")}
            required
            className={inputClass}
          />
          {mode !== "reset" && (
            <input
              type="password"
              name="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder={t("password")}
              required
              minLength={8}
              className={inputClass}
            />
          )}
          {mode === "signup" && (
            <input
              name="bizRegNo"
              value={bizRegNo}
              onChange={(e) => setBizRegNo(formatBizRegNo(e.target.value))}
              placeholder={t("bizRegNoPlaceholder")}
              required
              className={inputClass}
            />
          )}
          {error && (
            <p className="text-[12px] font-bold text-[#B91C1C]">{t(error)}</p>
          )}
          {notice && (
            <p className="rounded-xl bg-[#DCFCE7] p-3 text-[12px] font-bold text-[#15803D]">
              {t(notice)}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl py-3 text-[14px] font-extrabold text-white disabled:opacity-60"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {mode === "reset" ? t("resetSend") : t(mode)}
          </button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setError(null);
                setNotice(null);
              }}
              className="text-[12px] font-semibold text-[#8A6040] underline underline-offset-2"
            >
              {t("forgotPassword")}
            </button>
          )}
          {mode === "reset" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="text-[12px] font-semibold text-[#8A6040] underline underline-offset-2"
            >
              {t("backToLogin")}
            </button>
          )}
        </form>
      </main>
    </div>
  );
}
