-- KBite 초기 스키마 (작업 2)
-- 보안 원칙: 모든 테이블 RLS 활성화, 공개 읽기는 승인된 식당만,
-- 쓰기는 명시적 정책이 있는 경우에만 허용 (기본 차단)

create extension if not exists pgcrypto;

-- ───────────────────────── restaurants ─────────────────────────
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  category text not null check (category in ('me','as','cj','we','af','rc')),
  address text not null check (char_length(address) between 1 and 200),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  opening_time time,
  closing_time time,
  price_range text check (price_range in ('budget','moderate','upscale')),
  description text check (char_length(description) <= 1000),
  photo_url text,
  cover_emoji text default '🍽️',
  cuisine text check (char_length(cuisine) <= 50),
  starting_price integer check (starting_price >= 0),
  certifications text[] not null default '{}',
  languages text[] not null default '{}',
  booking_url text,
  sns_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  plan text not null default 'free' check (plan in ('free','basic','premium')),
  owner_email text check (char_length(owner_email) <= 254),
  phone text check (char_length(phone) <= 20),
  biz_reg_no text check (char_length(biz_reg_no) <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 위치 기반 검색용 인덱스
create index restaurants_geo_idx on public.restaurants using btree (lat, lng);
create index restaurants_status_idx on public.restaurants (status);
create index restaurants_category_idx on public.restaurants (category);

alter table public.restaurants enable row level security;

-- 누구나 '승인된' 식당만 조회 가능 (pending/rejected는 관리자만)
create policy "restaurants_public_read_approved"
  on public.restaurants for select
  using (status = 'approved');

-- 등록은 누구나 가능하되 status=pending, plan=free 강제
create policy "restaurants_insert_pending_only"
  on public.restaurants for insert
  to anon, authenticated
  with check (status = 'pending' and plan = 'free');

-- UPDATE/DELETE 정책 없음 = 차단 (관리자는 service_role로 수행)

-- ───────────────────────── profiles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nationality text check (char_length(nationality) <= 2),
  preferred_language text not null default 'en'
    check (preferred_language in ('en','ko','ar','zh','ja','vi','th','ru','fa')),
  saved_restaurants uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ───────────────────────── reviews ─────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  content text check (char_length(content) <= 2000),
  nationality text check (char_length(nationality) <= 2),
  created_at timestamptz not null default now()
);

create index reviews_restaurant_idx on public.reviews (restaurant_id);

alter table public.reviews enable row level security;

create policy "reviews_public_read"
  on public.reviews for select
  using (true);

-- 리뷰 작성은 로그인 사용자, 본인 명의로만
create policy "reviews_insert_own"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- ───────────────────────── updated_at 트리거 ─────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger restaurants_set_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

-- ─────────────── 평점 집계 뷰 (RLS 호출자 권한으로 적용) ───────────────
create view public.restaurants_with_stats
with (security_invoker = true) as
select
  r.*,
  coalesce(round(avg(v.rating)::numeric, 1), 0) as avg_rating,
  count(v.id)::int as review_count
from public.restaurants r
left join public.reviews v on v.restaurant_id = r.id
group by r.id;

-- ───────────────────────── Storage 버킷 ─────────────────────────
-- 식당 사진: 공개 읽기, 업로드는 서버(service_role)에서만 수행
insert into storage.buckets (id, name, public)
values ('restaurant-photos', 'restaurant-photos', true)
on conflict (id) do nothing;

-- ───────────────────────── 샘플 데이터 (이태원 6곳) ─────────────────────────
insert into public.restaurants
  (name, category, address, lat, lng, opening_time, closing_time, price_range,
   description, cover_emoji, cuisine, starting_price, certifications, languages,
   booking_url, status)
values
  ('Istanbul Kitchen', 'me', '37 Usadan-ro 10-gil, Yongsan-gu, Seoul',
   37.5326, 126.9911, '11:00', '22:00', 'moderate',
   'Authentic Turkish home cooking by a chef from Istanbul. Our bread is baked fresh every morning and all meat is halal certified.',
   '🥙', 'Turkish', 9000, '{halal}', '{en,ko,ar}', null, 'approved'),
  ('Saigon Pho House', 'as', '12 Itaewon-ro 27ga-gil, Yongsan-gu, Seoul',
   37.5349, 126.9947, '10:30', '21:30', 'budget',
   'Family-run Vietnamese kitchen. Broth simmered for 12 hours daily, herbs imported weekly.',
   '🍜', 'Vietnamese', 8500, '{}', '{en,ko,vi}', null, 'approved'),
  ('Harbin Dumpling House', 'cj', '8 Bogwang-ro 59-gil, Yongsan-gu, Seoul',
   37.5301, 126.9968, '11:00', '23:00', 'budget',
   'Northeastern Chinese dumplings handmade to order. Over 20 fillings including vegetarian options.',
   '🥟', 'Chinese (Dongbei)', 7000, '{vegan}', '{en,ko,zh}', null, 'approved'),
  ('La Piazza', 'we', '45 Noksapyeong-daero 40-gil, Yongsan-gu, Seoul',
   37.5343, 126.9882, '12:00', '22:00', 'upscale',
   'Neapolitan trattoria with a wood-fired oven. Dough fermented 48 hours, mozzarella made in-house.',
   '🍕', 'Italian', 14000, '{}', '{en,ko}', 'https://example.com/lapiazza', 'approved'),
  ('Addis Ababa', 'af', '19 Usadan-ro, Yongsan-gu, Seoul',
   37.5318, 126.9925, '12:00', '21:00', 'moderate',
   'Seoul''s first Ethiopian restaurant. Injera fermented in-house, coffee ceremony on weekends.',
   '🫓', 'Ethiopian', 12000, '{vegan,gf}', '{en,ko}', null, 'approved'),
  ('Samarkand', 'rc', '24 Dongdaemun-ro, Jung-gu, Seoul',
   37.5663, 127.0092, '10:00', '22:00', 'budget',
   'Uzbek family restaurant in the Central Asia street. Lagman noodles pulled by hand, halal meat only.',
   '🍢', 'Uzbek', 8000, '{halal}', '{en,ko,ru}', null, 'approved');
