-- menu_items: Basic 이상 플랜의 식당이 메뉴를 등록하는 테이블
create table if not exists public.menu_items (
  id          uuid        primary key default gen_random_uuid(),
  restaurant_id uuid      not null references public.restaurants(id) on delete cascade,
  name        text        not null check (char_length(name) <= 100),
  description text        check (char_length(description) <= 300),
  price       integer     not null default 0 check (price >= 0 and price <= 1000000),
  emoji       text        not null default '🍽️' check (char_length(emoji) <= 10),
  sort_order  smallint    not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.menu_items enable row level security;

-- 누구나 승인된 식당의 메뉴 조회 가능
create policy "menu_public_read"
  on public.menu_items for select
  using (
    exists (
      select 1 from public.restaurants
      where id = restaurant_id and status = 'approved'
    )
  );

-- 식당 오너(basic/premium)만 CRUD 가능
create policy "menu_owner_crud"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.restaurants
      where id = restaurant_id
        and owner_id = auth.uid()
        and plan in ('basic', 'premium')
    )
  )
  with check (
    exists (
      select 1 from public.restaurants
      where id = restaurant_id
        and owner_id = auth.uid()
        and plan in ('basic', 'premium')
    )
  );
