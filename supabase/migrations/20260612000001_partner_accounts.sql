-- 파트너(식당 주인) 계정 연결
-- 보안: 소유자는 본인 식당의 '운영 정보 컬럼'만 수정 가능.
-- status/plan/owner_id/biz_reg_no는 컬럼 GRANT에서 제외 → 소유자도 변경 불가
-- (승인·플랜 변경은 관리자/결제 시스템이 service_role로만 수행).

alter table public.restaurants
  add column owner_id uuid references auth.users(id) on delete set null;

create index restaurants_owner_idx on public.restaurants (owner_id);

-- 소유자는 본인 식당을 상태와 무관하게 조회 (pending 포함)
create policy "restaurants_owner_read"
  on public.restaurants for select
  to authenticated
  using (owner_id = auth.uid());

-- 소유자는 본인 식당만 수정 (수정 가능 컬럼은 아래 GRANT로 제한)
create policy "restaurants_owner_update"
  on public.restaurants for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 컬럼 단위 UPDATE 권한 — 운영 정보만
grant update (
  name, category, address, lat, lng,
  opening_time, closing_time, price_range,
  description, photo_url, cover_emoji, cuisine, starting_price,
  certifications, languages, booking_url, sns_url, phone
) on public.restaurants to authenticated;
