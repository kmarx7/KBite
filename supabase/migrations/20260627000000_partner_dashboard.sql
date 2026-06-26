-- 파트너 대시보드 (작업 15)
-- view_count 컬럼, 리뷰 답글 컬럼, 오너 답글 RLS, 조회수 증가 함수

-- ─── restaurants: 조회수 카운터 ───
alter table public.restaurants
  add column if not exists view_count integer not null default 0;

-- service_role은 already has ALL — 별도 GRANT 불필요

-- 조회수 원자적 증가 함수 (security definer = 호출자 권한 불문하고 실행)
create or replace function public.increment_view_count(rid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.restaurants set view_count = view_count + 1 where id = rid;
$$;

-- ─── reviews: 사장님 답글 컬럼 ───
alter table public.reviews
  add column if not exists reply_text text
    check (char_length(reply_text) <= 1000),
  add column if not exists reply_at timestamptz;

-- 식당 오너가 본인 식당의 리뷰에 답글 달기 허용
create policy "reviews_owner_reply"
  on public.reviews for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id
        and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id
        and r.owner_id = auth.uid()
    )
  );

-- 오너는 reply_text, reply_at 컬럼만 수정 가능
grant update (reply_text, reply_at) on public.reviews to authenticated;
