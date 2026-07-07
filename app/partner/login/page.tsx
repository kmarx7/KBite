import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PartnerLoginScreen from "@/components/auth/PartnerLoginScreen";

export const dynamic = "force-dynamic";

/** 이미 로그인된 상태로 진입하면 파트너 센터로 즉시 이동 — 막다른 폼 방지 */
export default async function PartnerLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/partner");

  return <PartnerLoginScreen />;
}
