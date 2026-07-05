-- 일별 조회 집계 (파트너 대시보드 추이 차트)
-- 무료 사장님에게 "몇 명이 봤는지"를 보여주는 가치 증명 → 업그레이드 동기

create table public.restaurant_view_daily (
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  day date not null,
  views integer not null default 0,
  primary key (restaurant_id, day)
);

-- RLS 활성 + 정책·GRANT 없음 = anon/authenticated 전면 차단 (서버 전용)
alter table public.restaurant_view_daily enable row level security;
grant all on public.restaurant_view_daily to service_role;

-- 조회수 증가 함수 확장: 총계 + 일별(KST 기준) 동시 기록
create or replace function public.increment_view_count(rid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.restaurants set view_count = view_count + 1 where id = rid;
  insert into public.restaurant_view_daily (restaurant_id, day, views)
  values (rid, (now() at time zone 'Asia/Seoul')::date, 1)
  on conflict (restaurant_id, day)
  do update set views = restaurant_view_daily.views + 1;
$$;
