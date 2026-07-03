"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconLockCog } from "@tabler/icons-react";
import { partnerUpdatePassword } from "@/app/actions/partner";

const inputClass =
  "w-full rounded-xl border border-[#FFD4B8] bg-white px-3 py-3 text-[14px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none";

/** 이메일의 재설정 링크(recovery 세션)로 도달하는 새 비밀번호 설정 화면 */
export default function PartnerResetPage() {
  const t = useTranslations("partner");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    const formData = new FormData(e.currentTarget);

    if (formData.get("password") !== formData.get("passwordConfirm")) {
      setError("passwordMismatch");
      return;
    }

    startTransition(async () => {
      const result = await partnerUpdatePassword(formData);
      if (!result.ok) {
        setError(result.error ?? "resetExpired");
        return;
      }
      /* 파트너·소비자 공용 재설정 — 공통 착지점은 프로필 */
      router.push("/profile");
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE8D6]">
        <IconLockCog size={26} color="#FF6B35" />
      </span>
      <h1 className="mb-5 text-[18px] font-extrabold text-[#1A0800]">
        {t("resetTitle")}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <label className="sr-only" htmlFor="reset-password">
          {t("newPassword")}
        </label>
        <input
          id="reset-password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder={t("newPassword")}
          required
          minLength={8}
          className={inputClass}
        />
        <label className="sr-only" htmlFor="reset-password-confirm">
          {t("newPasswordConfirm")}
        </label>
        <input
          id="reset-password-confirm"
          type="password"
          name="passwordConfirm"
          autoComplete="new-password"
          placeholder={t("newPasswordConfirm")}
          required
          minLength={8}
          className={inputClass}
        />
        {error && (
          <p className="text-[12px] font-bold text-[#B91C1C]">
            {t(error)}
            {error === "resetExpired" && (
              <>
                {" "}
                <Link href="/partner/login" className="underline">
                  {t("backToLogin")}
                </Link>
              </>
            )}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl py-3 text-[14px] font-extrabold text-white disabled:opacity-60"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {t("resetSubmit")}
        </button>
      </form>
    </div>
  );
}
