import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase 세션 갱신 (Next 16: middleware → proxy).
 * 만료된 액세스 토큰을 리프레시해 서버 컴포넌트가 항상 유효한
 * 세션을 읽게 한다. 세션을 쓰는 화면(파트너·소비자 계정)에 적용.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /* getUser()가 토큰 만료 시 리프레시를 수행한다 */
  await supabase.auth.getUser();

  return response;
}

export const config = {
  /* 세션이 필요한 화면 전부 — 만료 토큰을 서버 렌더 전에 갱신 */
  matcher: ["/partner/:path*", "/profile", "/login", "/saved", "/restaurant/:path*"],
};
