-- 예약 요청 (비실시간) — 손님이 요청, 사장님이 이메일 링크 또는 대시보드에서 수락/거절
-- 외국인의 "한국어 전화 예약" 장벽 해소가 목적. 실시간 보장 없음 (응답 없으면 전화 안내)

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reserved_date date not null,
  reserved_time time not null,
  party_size integer not null check (party_size between 1 and 20),
  note text check (char_length(note) <= 500),
  status text not null default 'pending'
    check (status in ('pending','confirmed','declined','cancelled')),
  /* 사장님 이메일 응답 링크용 비밀 토큰 — 손님에게는 컬럼 GRANT에서 제외 */
  action_token uuid not null default gen_random_uuid(),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index reservations_restaurant_idx
  on public.reservations (restaurant_id, status, created_at desc);
create index reservations_user_idx on public.reservations (user_id);

alter table public.reservations enable row level security;

-- 손님: 본인 명의로만 생성, 본인 것만 조회
create policy "reservations_insert_own"
  on public.reservations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "reservations_select_own"
  on public.reservations for select
  to authenticated
  using (auth.uid() = user_id);

-- 사장님: 본인 식당의 예약 조회·응답
create policy "reservations_owner_select"
  on public.reservations for select
  to authenticated
  using (exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = auth.uid()
  ));

create policy "reservations_owner_update"
  on public.reservations for update
  to authenticated
  using (exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = auth.uid()
  ));

-- GRANT (이 프로젝트는 기본 권한 없음)
-- select에서 action_token 제외 — 손님이 토큰을 알면 사장님 응답을 위조 가능
grant select (
  id, restaurant_id, user_id, reserved_date, reserved_time,
  party_size, note, status, responded_at, created_at
) on public.reservations to authenticated;
grant insert on public.reservations to authenticated;
-- 사장님 응답은 상태·응답시각만
grant update (status, responded_at) on public.reservations to authenticated;
grant all on public.reservations to service_role;
