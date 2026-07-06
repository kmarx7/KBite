import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConsumerLoginScreen from "@/components/auth/ConsumerLoginScreen";

export const dynamic = "force-dynamic";

/** 이미 로그인된 상태로 진입하면 목적지로 즉시 이동 — 막다른 폼 방지 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(safeNext);

  return <ConsumerLoginScreen />;
}
