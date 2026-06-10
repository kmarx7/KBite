-- API 롤 테이블 권한 (이 프로젝트는 신규 테이블에 기본 GRANT가 없음)
-- GRANT는 "문이 열려 있는가", RLS는 "어떤 행을 볼 수 있는가" —
-- 둘 다 있어야 동작한다. 최소 권한 원칙으로 부여.

grant usage on schema public to anon, authenticated, service_role;

-- service_role: 서버 전용 관리 작업 (RLS 우회는 역할 자체 속성)
grant all on all tables in schema public to service_role;
alter default privileges in schema public
  grant all on tables to service_role;

-- 공개(anon) + 로그인 사용자: 조회는 RLS가 approved만 통과시킴
grant select on public.restaurants to anon, authenticated;
grant select on public.restaurants_with_stats to anon, authenticated;
grant select on public.reviews to anon, authenticated;

-- 식당 등록: RLS가 status=pending, plan=free만 허용
grant insert on public.restaurants to anon, authenticated;

-- 리뷰 작성/삭제, 프로필: 로그인 사용자만 (RLS가 본인 행으로 제한)
grant insert, delete on public.reviews to authenticated;
grant select, insert, update on public.profiles to authenticated;
