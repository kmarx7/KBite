"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IconBrandGoogleFilled,
  IconChevronLeft,
  IconUserCircle,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import {
  consumerLogin,
  consumerSignUp,
  consumerRequestPasswordReset,
} from "@/app/actions/account";
import { syncSavedWithServer } from "@/lib/saved";

const inputClass =
  "w-full rounded-xl border border-[#FFD4B8] bg-white px-3 py-3 text-[14px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";

/** 내부 경로만 허용 — open redirect 방지 */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/profile";
}

export default function ConsumerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGoogle = async () => {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    /* provider 미설정 등 — 리다이렉트 전에 실패한 경우만 도달 */
    if (oauthError) setError("googleUnavailable");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setNotice(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "reset") {
        await consumerRequestPasswordReset(formData);
        setNotice("resetSent");
        setMode("login");
        return;
      }

      const result =
        mode === "login"
          ? await consumerLogin(formData)
          : await consumerSignUp(formData);

      if (!result.ok) {
        setError(result.error ?? "loginFailed");
        return;
      }
      if (result.needsEmailConfirm) {
        setNotice("emailConfirmSent");
        setMode("login");
        return;
      }
      /* 기기에 쌓인 찜을 계정과 병합 후 이동 */
      await syncSavedWithServer();
      router.push(next);
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
          {t("title")}
        </h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8D6]">
          <IconUserCircle size={28} color="#FF6B35" />
        </span>
        <h2 className="mb-1 text-[18px] font-extrabold text-[#1A0800]">
          {mode === "reset" ? t("resetTitle") : t("welcome")}
        </h2>
        <p className="mb-5 max-w-xs text-center text-[12px] leading-relaxed text-[#8A6040]">
          {mode === "reset" ? t("resetDesc") : t("welcomeDesc")}
        </p>

        {mode !== "reset" && (
          <>
            {/* Google 로그인 */}
            <button
              type="button"
              onClick={handleGoogle}
              className="mb-3 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-[#FFD4B8] bg-white py-3 text-[14px] font-bold text-[#1A0800]"
            >
              <IconBrandGoogleFilled size={16} />
              {t("continueWithGoogle")}
            </button>

            <div className="mb-3 flex w-full max-w-xs items-center gap-3">
              <span className="h-px flex-1 bg-[#FFE8D6]" />
              <span className="text-[11px] font-semibold text-[#C0A080]">
                {t("or")}
              </span>
              <span className="h-px flex-1 bg-[#FFE8D6]" />
            </div>

            {/* 로그인 / 가입 전환 */}
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
          </>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xs flex-col gap-3"
        >
          <label className="sr-only" htmlFor="account-email">
            {t("email")}
          </label>
          <input
            id="account-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("email")}
            required
            className={inputClass}
          />
          {mode !== "reset" && (
            <>
              <label className="sr-only" htmlFor="account-password">
                {t("password")}
              </label>
              <input
                id="account-password"
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
            </>
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

          {/* 가입 동의 고지 — 개인정보보호법·약관 표시 의무 */}
          {mode === "signup" && (
            <p className="text-center text-[11px] leading-relaxed text-[#8A6040]">
              {t.rich("signupConsent", {
                terms: (chunks) => (
                  <Link
                    href="/policy/terms"
                    target="_blank"
                    className="font-bold underline"
                  >
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link
                    href="/policy/privacy"
                    target="_blank"
                    className="font-bold underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}

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

        {/* 사장님 탈출구 — 잘못 들어온 사장님을 파트너 센터로 */}
        <p className="mt-6 text-[12px] font-semibold text-[#8A6040]">
          {t("partnerCta")}{" "}
          <Link
            href="/partner/login"
            className="font-bold text-[#CC4400] underline underline-offset-2"
          >
            {t("partnerCtaLink")}
          </Link>
        </p>
      </main>
    </div>
  );
}
