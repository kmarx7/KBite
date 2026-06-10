import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role 클라이언트 — RLS를 우회한다.
 * 보안 규칙(AGENTS.md): 반드시 서버에서만, 입력 검증을 마친 뒤에만 사용.
 * 클라이언트 컴포넌트에서 import하면 server-only가 빌드 에러를 낸다.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
