"use client";

import { useState, useTransition } from "react";
import { IconLock } from "@tabler/icons-react";
import { adminLogin } from "@/app/actions/admin";

/* 내부 운영자용 페이지 — 다국어 미적용 */
export default function AdminLoginPage() {
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await adminLogin(formData);
      /* 성공 시 redirect로 이 코드는 실행되지 않음 */
      if (result && !result.ok) setFailed(true);
    });
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE8D6]">
        <IconLock size={22} color="#FF6B35" />
      </span>
      <h1 className="text-[18px] font-extrabold text-[#1A0800]">
        KBite 관리자
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="관리자 비밀번호"
          required
          className="w-full rounded-xl border border-[#FFD4B8] bg-white px-3 py-3 text-[14px] font-semibold text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none"
        />
        {failed && (
          <p className="text-[12px] font-bold text-[#B91C1C]">
            비밀번호가 올바르지 않습니다
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl py-3 text-[14px] font-extrabold text-white disabled:opacity-60"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {isPending ? "확인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}
