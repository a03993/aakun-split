-- 分帳AA君 Database Schema

-- ============================================================
-- 1. USERS
-- ============================================================
create table public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  line_user_id      text unique,
  display_name      text not null,
  avatar_url        text,
  platform          text not null default 'line',
  created_at        timestamptz not null default now()
);

-- ============================================================
-- 2. BILL_GROUPS
-- ============================================================
create table public.bill_groups (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  line_group_id   text,
  created_by      uuid references public.users(id) on delete set null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 3. BILL_GROUP_MEMBERS
-- ============================================================
create table public.bill_group_members (
  id              uuid primary key default gen_random_uuid(),
  bill_group_id   uuid not null references public.bill_groups(id) on delete cascade,
  user_id         uuid references public.users(id) on delete cascade, -- 未認領時為 null
  display_name    text not null,
  avatar_url      text,
  role            text not null default 'member',
  joined_at       timestamptz not null default now(),

  unique(bill_group_id, display_name)
);

-- ============================================================
-- 4. BILLS
-- ============================================================
create table public.bills (
  id              uuid primary key default gen_random_uuid(),
  bill_group_id   uuid not null references public.bill_groups(id) on delete cascade,
  paid_by         text not null,        -- 對應 bill_group_members.id
  title           text not null,
  amount          numeric(10, 2) not null check (amount > 0),
  category        text not null check (
                    category in (
                      'food', 'transport', 'accommodation',
                      'entertainment', 'grocery', 'other'
                    )
                  ),
  split_with      text[] not null,      -- 對應 bill_group_members.id[]
  note            text,
  billed_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 5. SETTLEMENTS
-- ============================================================
create table public.settlements (
  id              uuid primary key default gen_random_uuid(),
  bill_group_id   uuid not null references public.bill_groups(id) on delete cascade,
  from_member     text not null,        -- 對應 bill_group_members.id
  to_member       text not null,        -- 對應 bill_group_members.id
  amount          numeric(10, 2) not null check (amount > 0),
  status          text not null default 'pending' check (status in ('pending', 'confirmed')),
  line_notified   boolean not null default false,
  settled_at      timestamptz,
  created_at      timestamptz not null default now(),

  check (from_member <> to_member)
);

-- ============================================================
-- 6. INDEXES
-- ============================================================
create index on public.bills (bill_group_id);
create index on public.bills (paid_by);
create index on public.bills (billed_at);
create index on public.bill_group_members (user_id);
create index on public.settlements (bill_group_id);
create index on public.settlements (from_member);
create index on public.settlements (to_member);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================
alter table public.users               enable row level security;
alter table public.bill_groups         enable row level security;
alter table public.bill_group_members  enable row level security;
alter table public.bills               enable row level security;
alter table public.settlements         enable row level security;

-- users
create policy "users: read own"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own"
  on public.users for update
  using (auth.uid() = id);

create policy "users: insert own"
  on public.users for insert
  with check (auth.uid() = id);

-- bill_groups
create policy "bill_groups: member can read"
  on public.bill_groups for select
  using (
    exists (
      select 1 from public.bill_group_members
      where bill_group_id = id
        and user_id = auth.uid()
    )
  );

create policy "bill_groups: authenticated can create"
  on public.bill_groups for insert
  with check (auth.uid() = created_by);

create policy "bill_groups: owner can update"
  on public.bill_groups for update
  using (auth.uid() = created_by);

-- bill_group_members
create policy "bill_group_members: member can read"
  on public.bill_group_members for select
  using (
    exists (
      select 1 from public.bill_group_members bgm
      where bgm.bill_group_id = bill_group_members.bill_group_id
        and bgm.user_id = auth.uid()
    )
  );

create policy "bill_group_members: owner can insert"
  on public.bill_group_members for insert
  with check (
    exists (
      select 1 from public.bill_groups
      where id = bill_group_id
        and created_by = auth.uid()
    )
  );

create policy "bill_group_members: self can claim"
  on public.bill_group_members for update
  using (user_id is null)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.bill_groups
      where id = bill_group_id
        and is_active = true
    )
  );

-- bills
create policy "bills: member can read"
  on public.bills for select
  using (
    exists (
      select 1 from public.bill_group_members
      where bill_group_id = bills.bill_group_id
        and user_id = auth.uid()
    )
  );

create policy "bills: member can insert"
  on public.bills for insert
  with check (
    exists (
      select 1 from public.bill_group_members
      where bill_group_id = bills.bill_group_id
        and user_id = auth.uid()
    )
  );

-- settlements
create policy "settlements: related user can read"
  on public.settlements for select
  using (
    exists (
      select 1 from public.bill_group_members
      where id::text = from_member and user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.bill_group_members
      where id::text = to_member and user_id = auth.uid()
    )
  );

create policy "settlements: member can insert"
  on public.settlements for insert
  with check (
    exists (
      select 1 from public.bill_group_members
      where bill_group_id = settlements.bill_group_id
        and user_id = auth.uid()
    )
  );

create policy "settlements: related user can update"
  on public.settlements for update
  using (
    exists (
      select 1 from public.bill_group_members
      where id::text = from_member and user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.bill_group_members
      where id::text = to_member and user_id = auth.uid()
    )
  );
