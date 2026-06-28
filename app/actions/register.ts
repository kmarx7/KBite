"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  validateFile,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/validation/register";
import { priceRangeFromMinMax } from "@/lib/price";
import { sendRegistrationConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";

export interface RegisterResult {
  ok: boolean;
  /** 실패 시 i18n 키 (register 네임스페이스) */
  error?: string;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

/**
 * 식당 등록 — 보안 경계는 여기다 (클라이언트 검증은 UX용).
 * - 모든 필드 zod 재검증
 * - 파일 크기·MIME 서버 재검증, 파일명은 서버에서 생성 (클라이언트 파일명 불신)
 * - status='pending', plan='free' 서버 강제
 */
export async function registerRestaurant(
  formData: FormData,
): Promise<RegisterResult> {
  const rl = await checkRateLimit("register");
  if (!rl.ok) return { ok: false, error: "rateLimited" };

  /* 약관 동의 — 서버에서도 강제 */
  if (formData.get("consent") !== "true") {
    return { ok: false, error: "consentRequired" };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    ownerEmail: String(formData.get("ownerEmail") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    category: String(formData.get("category") ?? ""),
    address: String(formData.get("address") ?? ""),
    openingTime: (formData.get("openingTime") as string | null) || null,
    closingTime: (formData.get("closingTime") as string | null) || null,
    priceCurrency: String(formData.get("priceCurrency") ?? "KRW"),
    priceMin: formData.get("priceMin") ?? "",
    priceMax: formData.get("priceMax") ?? "",
    about: String(formData.get("about") ?? ""),
    certifications: formData.getAll("certifications").map(String),
    languages: formData.getAll("languages").map(String),
    bizRegNo: String(formData.get("bizRegNo") ?? ""),
    snsUrl: String(formData.get("snsUrl") ?? ""),
  };

  const parsed1 = step1Schema.safeParse(raw);
  const parsed2 = step2Schema.safeParse(raw);
  const parsed3 = step3Schema.safeParse(raw);
  const failed = [parsed1, parsed2, parsed3].find((p) => !p.success);
  if (failed && !failed.success) {
    return {
      ok: false,
      error: failed.error.issues[0]?.message ?? "requiredField",
    };
  }
  if (!parsed1.success || !parsed2.success || !parsed3.success) {
    return { ok: false, error: "requiredField" };
  }

  const supabase = createAdminClient();

  /* 로그인된 사용자면 owner_id 자동 연결 */
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  const ownerId = user?.id ?? null;

  /* 사진 업로드 — 서버에서 크기·타입 재검증 후 랜덤 파일명으로 저장 */
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const fileError = validateFile(photo, ALLOWED_IMAGE_TYPES);
    if (fileError) return { ok: false, error: fileError };

    const ext = EXT_BY_MIME[photo.type] ?? "jpg";
    const path = `${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("restaurant-photos")
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) {
      console.error("photo upload failed:", uploadError.message);
      return { ok: false, error: "submitFailed" };
    }
    photoUrl = supabase.storage.from("restaurant-photos").getPublicUrl(path)
      .data.publicUrl;
  }

  const { error: insertError } = await supabase.from("restaurants").insert({
    name: parsed1.data.name,
    owner_email: parsed1.data.ownerEmail,
    phone: parsed1.data.phone || null,
    category: parsed1.data.category,
    address: parsed2.data.address,
    lat: 37.534,
    lng: 126.9948,
    opening_time: parsed2.data.openingTime,
    closing_time: parsed2.data.closingTime,
    price_currency: parsed2.data.priceCurrency,
    price_min: parsed2.data.priceMin,
    price_max: parsed2.data.priceMax,
    price_range: priceRangeFromMinMax(parsed2.data.priceCurrency, parsed2.data.priceMin, parsed2.data.priceMax),
    description: parsed2.data.about || null,
    certifications: parsed2.data.certifications,
    languages: parsed2.data.languages,
    photo_url: photoUrl,
    biz_reg_no: parsed3.data.bizRegNo,
    sns_url: parsed3.data.snsUrl || null,
    owner_id: ownerId,
    status: "pending",
    plan: "free",
  });

  if (insertError) {
    /* PII 없는 메시지만 로깅 */
    console.error("restaurant insert failed:", insertError.code);
    return { ok: false, error: "submitFailed" };
  }

  /* 등록 접수 확인 이메일 — 실패해도 등록은 성공으로 처리 */
  try {
    await sendRegistrationConfirmation({
      to: parsed1.data.ownerEmail,
      restaurantName: parsed1.data.name,
    });
  } catch {
    /* 이메일 실패가 등록을 막지 않음 */
  }

  return { ok: true };
}
