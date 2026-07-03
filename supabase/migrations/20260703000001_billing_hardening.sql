-- 결제 시스템 보강
-- 1) past_due: 갱신 결제 실패 시 즉시 강등 대신 3일 유예 (스펙: 작업 13 "3일 후 재시도")
-- 2) order_id: 결제 idempotency + Toss 주문 대사(reconciliation) 키
-- 3) 식당당 활성 구독 1개 강제 (동시 결제 경합 차단)

-- 1) 구독 상태에 past_due 추가
alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active','past_due','cancelled','expired'));

-- 2) 결제 이력: pending 상태 + order_id (과금 전 선기록 → 크래시 시 대사로 복구)
alter table public.payment_history
  drop constraint if exists payment_history_status_check;
alter table public.payment_history
  add constraint payment_history_status_check
  check (status in ('pending','success','failed'));

alter table public.payment_history
  add column if not exists order_id text;

create unique index if not exists payment_history_order_idx
  on public.payment_history (order_id)
  where order_id is not null;

-- 3) 활성 구독은 식당당 1개만
create unique index if not exists subscriptions_one_active_idx
  on public.subscriptions (restaurant_id)
  where status = 'active';
