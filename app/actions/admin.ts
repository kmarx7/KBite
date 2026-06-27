"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAdminSession,
  destroyAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";

/* ───────────── 로그인 / 로그아웃 ───────────── */

export async function adminLogin(formData: FormData): Promise<{
  ok: boolean;
}> {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    /* 무차별 대입 완화 — 실패 시 지연 */
    await new Promise((r) => setTimeout(r, 800));
    return { ok: false };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

/* ───────────── 식당 관리 ───────────── */

const idSchema = z.string().uuid();
const statusSchema = z.enum(["approved", "rejected", "pending"]);

async function requireAdmin(): Promise<void> {
  if (!(await verifyAdminSession())) {
    throw new Error("Unauthorized");
  }
}

export async function setRestaurantStatus(
  id: string,
  status: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false };

  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, owner_email")
    .eq("id", parsedId.data)
    .single();

  const { error } = await supabase
    .from("restaurants")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data);

  if (error) {
    console.error("status update failed:", error.code);
    return { ok: false };
  }

  if (restaurant?.owner_email) {
    try {
      if (parsedStatus.data === "approved") {
        await sendApprovalNotification({
          to: restaurant.owner_email,
          restaurantName: restaurant.name,
        });
      } else if (parsedStatus.data === "rejected") {
        await sendRejectionNotification({
          to: restaurant.owner_email,
          restaurantName: restaurant.name,
        });
      }
    } catch {
      /* 이메일 실패가 상태 업데이트를 막지 않음 */
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteRestaurant(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", parsed.data);

  if (error) {
    console.error("restaurant delete failed:", error.code);
    return { ok: false };
  }
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
