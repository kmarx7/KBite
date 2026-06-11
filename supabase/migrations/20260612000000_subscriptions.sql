-- 구독 + 결제 내역 (작업 11)
-- 보안: RLS 활성화 + anon/authenticated 정책·GRANT 없음 = 전면 차단.
-- 결제 데이터는 서버(service_role)에서만 접근한다.
-- 파트너 계정(Supabase Auth) 도입 시 본인 구독 조회 정책을 추가할 것.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  plan text not null check (plan in ('basic','premium')),
  status text not null default 'active' check (status in ('active','cancelled','expired')),
  billing_key text, -- 토스페이먼츠 빌링키 (카드 정보 아님)
  amount integer not null check (amount >= 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_restaurant_idx on public.subscriptions (restaurant_id);
create index subscriptions_status_period_idx
  on public.subscriptions (status, current_period_end);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create table public.payment_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  amount integer not null check (amount >= 0),
  status text not null check (status in ('success','failed')),
  payment_key text, -- 토스페이먼츠 결제키
  failure_reason text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payment_history_restaurant_idx
  on public.payment_history (restaurant_id);

alter table public.payment_history enable row level security;

-- service_role 전용 접근 (anon/authenticated에는 GRANT 자체를 주지 않음)
grant all on public.subscriptions to service_role;
grant all on public.payment_history to service_role;
