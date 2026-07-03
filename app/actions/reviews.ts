"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/ratelimit";

export interface ReviewResult {
  ok: boolean;
  error?: string;
}

const reviewSchema = z.object({
  restaurantId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().max(2000).optional(),
  nationality: z
    .string()
    .trim()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .optional(),
});

export async function submitReview(
  formData: FormData,
): Promise<ReviewResult> {
  const rl = await checkRateLimit("review");
  if (!rl.ok) return { ok: false, error: "rateLimited" };

  const raw = {
    restaurantId: String(formData.get("restaurantId") ?? ""),
    rating: formData.get("rating"),
    content: String(formData.get("content") ?? "").trim() || undefined,
    nationality: String(formData.get("nationality") ?? "").toUpperCase() || undefined,
  };

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }

  const { restaurantId, rating, content, nationality } = parsed.data;

  /* 리뷰는 로그인 필수 — 평점 조작(셀프 리뷰·테러) 방지의 최소 장치.
     RLS reviews_insert_own이 user_id = auth.uid()를 강제한다 */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "loginRequired" };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .eq("status", "approved")
    .maybeSingle();

  if (!restaurant) {
    return { ok: false, error: "restaurantNotFound" };
  }

  const { error } = await supabase.from("reviews").insert({
    restaurant_id: restaurantId,
    user_id: user.id,
    rating,
    content: content ?? null,
    nationality: nationality ?? null,
  });

  if (error) {
    return { ok: false, error: "submitFailed" };
  }

  revalidatePath(`/restaurant/${restaurantId}`);
  return { ok: true };
}
