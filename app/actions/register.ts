"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  validateFile,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/validation/register";

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
  const raw = {
    name: String(formData.get("name") ?? ""),
    ownerEmail: String(formData.get("ownerEmail") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    category: String(formData.get("category") ?? ""),
    address: String(formData.get("address") ?? ""),
    openingTime: (formData.get("openingTime") as string | null) || null,
    closingTime: (formData.get("closingTime") as string | null) || null,
    priceRange: String(formData.get("priceRange") ?? "moderate"),
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
    opening_time: parsed2.data.openingTime,
    closing_time: parsed2.data.closingTime,
    price_range: parsed2.data.priceRange,
    description: parsed2.data.about || null,
    certifications: parsed2.data.certifications,
    languages: parsed2.data.languages,
    photo_url: photoUrl,
    biz_reg_no: parsed3.data.bizRegNo,
    sns_url: parsed3.data.snsUrl || null,
    status: "pending",
    plan: "free",
  });

  if (insertError) {
    /* PII 없는 메시지만 로깅 */
    console.error("restaurant insert failed:", insertError.code);
    return { ok: false, error: "submitFailed" };
  }

  /* TODO(작업 8 마무리): RESEND_API_KEY 채워지면 확인 이메일 발송 */
  return { ok: true };
}
