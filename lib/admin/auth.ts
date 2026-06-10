import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * 관리자 세션 — MVP 단계의 단일 운영자용.
 * ADMIN_SECRET(.env.local) 비밀번호 → HMAC 서명된 만료부 쿠키.
 * Supabase Auth 기반 역할 시스템 도입 시 교체 예정.
 */

const COOKIE_NAME = "KBITE_ADMIN_SESSION";
const SESSION_HOURS = 12;

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SECRET is missing or too short (min 16 chars)");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** 로그인 비밀번호 검증 — 타이밍 공격 방지 비교 */
export function verifyAdminPassword(input: string): boolean {
  return safeEqual(input, getSecret());
}

export async function createAdminSession(): Promise<void> {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expires);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** 세션 유효성 — 모든 관리자 페이지·액션이 호출해야 한다 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const payload = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return safeEqual(signature, sign(payload));
}
