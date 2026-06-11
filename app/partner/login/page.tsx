"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconBuildingStore, IconChevronLeft } from "@tabler/icons-react";
import { partnerLogin, partnerSignUp } from "@/app/actions/partner";
import { TRACK_EVENTS, track } from "@/lib/analytics";

const inputClass =
  "w-full rounded-xl border border-[#FFD4B8] bg-white px-3 py-3 text-[14px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";

export default function PartnerLoginPage() {
  const t = useTranslations("partner");
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setNotice(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
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
            {t(mode)}
          </button>
        </form>
      </main>
    </div>
  );
}
