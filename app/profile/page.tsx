import { createClient } from "@/lib/supabase/server";
import ProfileScreen from "@/components/home/ProfileScreen";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ProfileScreen userEmail={user?.email ?? null} />;
}
