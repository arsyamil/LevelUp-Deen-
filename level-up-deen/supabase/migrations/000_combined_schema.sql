-- =================================================================
-- LEVEL UP DEEN - Combined Schema (Fresh Install for Supabase Auth)
-- =================================================================
-- Run this in the Supabase SQL Editor to create all tables.
-- User IDs are Supabase Auth UUIDs stored as text.
-- =================================================================

create extension if not exists "pgcrypto";

-- ── Core User Tables ──

create table if not exists public.users_profile (
  id text primary key,
  username varchar(50) unique not null,
  full_name varchar(120),
  avatar_url text,
  timezone varchar(50) default 'Asia/Jakarta',
  user_type varchar(30) not null default 'mahasiswa',
  onboarding_completed boolean not null default false,
  role varchar(30) not null default 'user',
  email varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  level integer not null default 1,
  rank varchar(4) not null default 'E',
  total_exp integer not null default 0,
  current_exp integer not null default 0,
  next_level_exp integer not null default 150,
  coins integer not null default 0,
  prayer_streak integer not null default 0,
  full_quest_streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- ── Task System ──

create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) unique not null,
  name varchar(120) not null,
  category varchar(30) not null,
  task_type varchar(30) not null,
  default_exp integer not null default 0,
  default_coin integer not null default 0,
  is_system_required boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  template_id uuid references public.task_templates(id) on delete set null,
  name varchar(120) not null,
  category varchar(30) not null,
  task_type varchar(30) not null,
  target_value numeric,
  target_unit varchar(20),
  exp_reward integer not null default 0,
  coin_reward integer not null default 0,
  schedule_type varchar(20) not null default 'daily',
  selected_days jsonb,
  is_active boolean not null default true,
  is_deletable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_tasks_user_template_unique_idx
  on public.user_tasks(user_id, template_id)
  where template_id is not null;

create table if not exists public.daily_task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  task_id uuid not null references public.user_tasks(id) on delete cascade,
  log_date date not null,
  status varchar(20) not null,
  actual_value numeric,
  note text,
  exp_awarded integer not null default 0,
  coin_awarded integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, task_id, log_date)
);

-- ── Health Tracking ──

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  log_date date not null,
  amount_ml integer not null,
  created_at timestamptz not null default now()
);

-- ── Finance System ──

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  name varchar(80) not null,
  type varchar(10) not null,
  icon varchar(40),
  color varchar(20),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists financial_categories_user_type_name_unique_idx
  on public.financial_categories(user_id, type, name);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  category_id uuid references public.financial_categories(id) on delete set null,
  type varchar(10) not null,
  amount numeric not null,
  transaction_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  category_id uuid references public.financial_categories(id) on delete set null,
  month integer not null,
  year integer not null,
  budget_amount numeric not null,
  alert_threshold numeric not null default 0.8,
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  name varchar(120) not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  target_date date,
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Avatar & Shop ──

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  item_type varchar(20) not null,
  rarity varchar(20) not null,
  price_coin integer not null,
  unlock_level integer not null default 1,
  image_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  is_equipped boolean not null default false,
  unique(user_id, item_id)
);

-- ── Achievements ──

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  name varchar(120) not null,
  description text,
  category varchar(30) not null,
  requirement_json jsonb not null,
  reward_exp integer not null default 0,
  reward_coin integer not null default 0
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- ── Recovery & Sync ──

create table if not exists public.recovery_quest_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  log_date date not null,
  reason varchar(80) not null,
  recommendation text not null,
  accepted boolean,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_queue_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  queue_type varchar(30) not null,
  payload jsonb not null,
  client_timestamp timestamptz not null,
  processed_at timestamptz,
  status varchar(20) not null default 'pending'
);

-- ── Social / Squad ──

create table if not exists public.squad_groups (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  created_by text not null references public.users_profile(id) on delete cascade,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_members (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squad_groups(id) on delete cascade,
  user_id text not null references public.users_profile(id) on delete cascade,
  role varchar(20) not null default 'member',
  joined_at timestamptz not null default now(),
  unique (squad_id, user_id)
);

create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  snapshot_date date not null,
  completion_score integer not null,
  rank_position integer,
  created_at timestamptz not null default now(),
  unique(user_id, snapshot_date)
);

-- ── AI System ──

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  intent varchar(40) not null,
  prompt_summary text,
  response_summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  recommendation_type varchar(30) not null,
  payload jsonb not null,
  status varchar(20) not null default 'pending',
  created_at timestamptz not null default now(),
  acted_at timestamptz
);

create table if not exists public.ai_finance_parse_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  input_text text not null,
  parsed_result jsonb not null,
  confidence numeric,
  created_at timestamptz not null default now()
);

-- ── Admin ──

create table if not exists public.admin_role_change_logs (
  id uuid primary key default gen_random_uuid(),
  changed_by text,
  changed_by_email text,
  changed_user_id text not null,
  previous_role varchar(80) not null,
  new_role varchar(80) not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.system_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text references public.users_profile(id) on delete set null,
  action varchar(80) not null,
  entity_type varchar(80) not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists system_audit_logs_actor_created_idx
  on public.system_audit_logs(actor_user_id, created_at desc);

create index if not exists system_audit_logs_entity_created_idx
  on public.system_audit_logs(entity_type, entity_id, created_at desc);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  status varchar(20) not null default 'requested',
  reason text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by text references public.users_profile(id) on delete set null,
  unique(user_id, status)
);

create index if not exists account_deletion_requests_user_requested_idx
  on public.account_deletion_requests(user_id, requested_at desc);

-- ── Row Level Security ──

alter table public.users_profile enable row level security;
alter table public.user_stats enable row level security;
alter table public.user_tasks enable row level security;
alter table public.daily_task_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.user_inventory enable row level security;
alter table public.user_achievements enable row level security;
alter table public.recovery_quest_logs enable row level security;
alter table public.sync_queue_logs enable row level security;
alter table public.squad_members enable row level security;
alter table public.leaderboard_snapshots enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.ai_finance_parse_logs enable row level security;
alter table public.system_audit_logs enable row level security;
alter table public.account_deletion_requests enable row level security;

-- ── RLS Helper Function ──

create or replace function public.is_owner(target_user_id text)
returns boolean
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    ''
  ) = target_user_id
$$;

-- ── RLS Policies ──

create policy users_profile_owner_policy on public.users_profile
  using (public.is_owner(id))
  with check (public.is_owner(id));

create policy user_stats_owner_policy on public.user_stats
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy user_tasks_owner_policy on public.user_tasks
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy daily_task_logs_owner_policy on public.daily_task_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy water_logs_owner_policy on public.water_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy financial_categories_owner_policy on public.financial_categories
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy financial_transactions_owner_policy on public.financial_transactions
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy budgets_owner_policy on public.budgets
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy savings_goals_owner_policy on public.savings_goals
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy user_inventory_owner_policy on public.user_inventory
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy user_achievements_owner_policy on public.user_achievements
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy recovery_quest_logs_owner_policy on public.recovery_quest_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy sync_queue_logs_owner_policy on public.sync_queue_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy squad_members_owner_policy on public.squad_members
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy leaderboard_snapshots_owner_policy on public.leaderboard_snapshots
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy ai_conversations_owner_policy on public.ai_conversations
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy ai_recommendations_owner_policy on public.ai_recommendations
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy ai_finance_parse_logs_owner_policy on public.ai_finance_parse_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy system_audit_logs_admin_read_policy on public.system_audit_logs
  for select using (false);

create policy account_deletion_requests_owner_policy on public.account_deletion_requests
  for select using (public.is_owner(user_id));

-- ── Triggers ──

create or replace function public.prevent_delete_system_task()
returns trigger
language plpgsql
as $$
begin
  if old.is_deletable = false then
    raise exception 'System required task cannot be deleted';
  end if;
  return old;
end;
$$;

create trigger trg_prevent_delete_system_task
before delete on public.user_tasks
for each row execute procedure public.prevent_delete_system_task();
