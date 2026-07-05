import { createClient } from "@/lib/supabase/server";
import ProfileScreen from "@/components/home/ProfileScreen";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* 소유 식당 수 — RLS(owner_read)로 본인 것만 집계. 사장님 입구 문구 전환용 */
  let ownedCount = 0;
  if (user) {
    const { count } = await supabase
      .from("restaurants")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);
    ownedCount = count ?? 0;
  }

  return (
    <ProfileScreen userEmail={user?.email ?? null} ownedCount={ownedCount} />
  );
}
