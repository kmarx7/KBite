"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  step2Schema,
  validateFile,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/validation/register";
import { priceRangeFromMinMax } from "@/lib/price";

export interface PartnerResult {
  ok: boolean;
  /** i18n 키 (partner 네임스페이스) */
  error?: string;
  /** 회원가입 후 이메일 확인이 필요한 경우 */
  needsEmailConfirm?: boolean;
}

const credentialsSchema = z.object({
  email: z.string().trim().email("invalidEmail").max(254),
  password: z.string().min(8, "passwordMin").max(72),
});

const signupSchema = credentialsSchema.extend({
  bizRegNo: z
    .string()
    .trim()
    .regex(/^\d{3}-\d{2}-\d{5}$/, "invalidBizNo"),
});

/* ───────────── 가입 / 로그인 / 로그아웃 ───────────── */

export async function partnerSignUp(
  formData: FormData,
): Promise<PartnerResult> {
  const parsed = signupSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    bizRegNo: String(formData.get("bizRegNo") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { biz_reg_no: parsed.data.bizRegNo, role: "partner" },
    },
  });
  if (error) {
    /* 이미 가입된 이메일 등 — 상세 사유는 노출하지 않음 (계정 열거 방지) */
    return { ok: false, error: "signupFailed" };
  }
  return { ok: true, needsEmailConfirm: !data.session };
}

export async function partnerLogin(
  formData: FormData,
): Promise<PartnerResult> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "loginFailed" };
  }
  return { ok: true };
}

export async function partnerLogout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/* ───────────── 식당 소유권 연결 (claim) ───────────── */

export async function claimRestaurant(id: string): Promise<PartnerResult> {
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return { ok: false, error: "claimFailed" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "loginFailed" };

  /* 등록 시 입력한 owner_email과 로그인 이메일이 일치해야 소유권 부여 */
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, owner_email, owner_id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (
    !restaurant ||
    restaurant.owner_id !== null ||
    (restaurant.owner_email ?? "").toLowerCase() !== user.email.toLowerCase()
  ) {
    return { ok: false, error: "claimFailed" };
  }

  const { error } = await admin
    .from("restaurants")
    .update({ owner_id: user.id })
    .eq("id", parsedId.data)
    .is("owner_id", null);

  if (error) {
    return { ok: false, error: "claimFailed" };
  }
  revalidatePath("/partner");
  return { ok: true };
}

/* ───────────── 본인 식당 정보 수정 ───────────── */

const editSchema = step2Schema.extend({
  name: z.string().trim().min(1, "requiredField").max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-() ]*$/, "requiredField"),
  bookingUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^$|^https?:\/\/\S+$/i, "invalidUrl"),
  snsUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^$|^https?:\/\/\S+$/i, "invalidUrl"),
});

export async function updateRestaurant(
  id: string,
  formData: FormData,
): Promise<PartnerResult> {
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return { ok: false, error: "saveFailed" };

  const parsed = editSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    openingTime: (formData.get("openingTime") as string | null) || null,
    closingTime: (formData.get("closingTime") as string | null) || null,
    priceCurrency: String(formData.get("priceCurrency") ?? "KRW"),
    priceMin: formData.get("priceMin") ?? "",
    priceMax: formData.get("priceMax") ?? "",
    about: String(formData.get("about") ?? ""),
    certifications: formData.getAll("certifications").map(String),
    languages: formData.getAll("languages").map(String),
    bookingUrl: String(formData.get("bookingUrl") ?? ""),
    snsUrl: String(formData.get("snsUrl") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "loginFailed" };

  /* 사진 교체 — 소유권 확인 후 admin으로 업로드 (스토리지 쓰기는 서버 전용) */
  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const fileError = validateFile(photo, ALLOWED_IMAGE_TYPES);
    if (fileError) return { ok: false, error: fileError };

    const admin = createAdminClient();
    const { data: owned } = await admin
      .from("restaurants")
      .select("id")
      .eq("id", parsedId.data)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!owned) return { ok: false, error: "saveFailed" };

    const ext =
      { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic" }[
        photo.type
      ] ?? "jpg";
    const path = `${randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("restaurant-photos")
      .upload(path, photo, { contentType: photo.type });
    if (uploadError) return { ok: false, error: "saveFailed" };
    photoUrl = admin.storage.from("restaurant-photos").getPublicUrl(path)
      .data.publicUrl;
  }

  /* 사용자 컨텍스트로 업데이트 — RLS(본인 행) + 컬럼 GRANT(운영 정보만)가 강제 */
  const { error } = await supabase
    .from("restaurants")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address,
      opening_time: parsed.data.openingTime,
      closing_time: parsed.data.closingTime,
      price_currency: parsed.data.priceCurrency,
      price_min: parsed.data.priceMin,
      price_max: parsed.data.priceMax,
      price_range: priceRangeFromMinMax(parsed.data.priceCurrency, parsed.data.priceMin, parsed.data.priceMax),
      description: parsed.data.about || null,
      certifications: parsed.data.certifications,
      languages: parsed.data.languages,
      booking_url: parsed.data.bookingUrl || null,
      sns_url: parsed.data.snsUrl || null,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    .eq("id", parsedId.data);

  if (error) {
    return { ok: false, error: "saveFailed" };
  }
  revalidatePath("/partner");
  revalidatePath(`/restaurant/${parsedId.data}`);
  revalidatePath("/");
  return { ok: true };
}

/* ───────────── 메뉴 관리 (Basic 이상) ───────────── */

const menuItemSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().trim().min(1, "requiredField").max(100),
  description: z.string().trim().max(300).optional(),
  price: z.coerce.number().int().min(0).max(1_000_000),
  emoji: z.string().trim().max(10).default("🍽️"),
});

export async function addMenuItem(
  restaurantId: string,
  formData: FormData,
): Promise<PartnerResult> {
  const parsed = menuItemSchema.safeParse({
    restaurantId,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: formData.get("price"),
    emoji: String(formData.get("emoji") ?? "🍽️"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "loginFailed" };

  /* RLS menu_owner_crud가 plan 검사 + 소유권 검사를 강제 */
  const { error } = await supabase.from("menu_items").insert({
    restaurant_id: parsed.data.restaurantId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    emoji: parsed.data.emoji,
  });

  if (error) {
    return { ok: false, error: "saveFailed" };
  }
  revalidatePath(`/restaurant/${restaurantId}`);
  revalidatePath(`/partner/restaurant/${restaurantId}/edit`);
  return { ok: true };
}

export async function deleteMenuItem(
  menuItemId: string,
  restaurantId: string,
): Promise<PartnerResult> {
  const parsedIds = z
    .object({ menuItemId: z.string().uuid(), restaurantId: z.string().uuid() })
    .safeParse({ menuItemId, restaurantId });
  if (!parsedIds.success) return { ok: false, error: "saveFailed" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "loginFailed" };

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", parsedIds.data.menuItemId)
    .eq("restaurant_id", parsedIds.data.restaurantId);

  if (error) {
    return { ok: false, error: "saveFailed" };
  }
  revalidatePath(`/restaurant/${restaurantId}`);
  revalidatePath(`/partner/restaurant/${restaurantId}/edit`);
  return { ok: true };
}

/* ───────────── 리뷰 답글 ───────────── */

const replySchema = z.object({
  reviewId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  text: z.string().trim().min(1).max(1000),
});

export async function replyToReview(
  reviewId: string,
  restaurantId: string,
  text: string,
): Promise<PartnerResult> {
  const parsed = replySchema.safeParse({ reviewId, restaurantId, text });
  if (!parsed.success) return { ok: false, error: "replyFailed" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "loginFailed" };

  /* RLS reviews_owner_reply 정책 + 컬럼 GRANT가 강제 */
  const { error } = await supabase
    .from("reviews")
    .update({ reply_text: parsed.data.text, reply_at: new Date().toISOString() })
    .eq("id", parsed.data.reviewId)
    .eq("restaurant_id", parsed.data.restaurantId);

  if (error) {
    return { ok: false, error: "replyFailed" };
  }

  revalidatePath(`/partner/restaurant/${parsed.data.restaurantId}`);
  revalidatePath(`/restaurant/${parsed.data.restaurantId}`);
  return { ok: true };
}
