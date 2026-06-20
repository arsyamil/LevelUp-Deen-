-- 1. Push Subscriptions
create table if not exists public.user_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_push_subscriptions enable row level security;
drop policy if exists user_push_subscriptions_owner_policy on public.user_push_subscriptions;
create policy user_push_subscriptions_owner_policy on public.user_push_subscriptions
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 2. Squad Invite Code
alter table public.squad_groups add column if not exists invite_code varchar(10) unique;

do $$
declare
  squad record;
  candidate text;
begin
  for squad in select id from public.squad_groups where invite_code is null loop
    loop
      candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      exit when not exists (select 1 from public.squad_groups where invite_code = candidate);
    end loop;
    update public.squad_groups set invite_code = candidate where id = squad.id;
  end loop;
end $$;
alter table public.squad_groups alter column invite_code set not null;

-- 3. Add `role` to squad_members if not exists
alter table public.squad_members add column if not exists role varchar(20) not null default 'member';

-- 4. Achievements system
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null unique,
  name varchar(100) not null,
  description text,
  category varchar(50) not null default 'general',
  requirement_json jsonb,
  reward_exp integer not null default 0,
  reward_coin integer not null default 0,
  icon_url varchar(255),
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "Achievements are viewable by everyone" on public.achievements;
create policy "Achievements are viewable by everyone" on public.achievements for select using (true);

drop policy if exists "User achievements are viewable by everyone" on public.user_achievements;
create policy "User achievements are viewable by everyone" on public.user_achievements for select using (true);

-- Seed basic achievements
insert into public.achievements (code, name, description, category, reward_exp, reward_coin, requirement_json) values
('FIRST_STEP', 'First Step', 'Bergabung dengan Level Up Deen', 'system', 50, 100, '{"type": "register"}'),
('SAVER_1', 'The Saver', 'Mencatat tabungan pertama', 'finance', 100, 50, '{"type": "savings_tx"}'),
('STUDIOUS', 'Studious', 'Menambahkan mata kuliah pertama', 'study', 100, 50, '{"type": "course_added"}')
on conflict (code) do nothing;

-- Helper function to award achievement safely
create or replace function public.award_achievement(p_user_id text, p_code varchar)
returns void as $$
declare
  v_ach_id uuid;
  v_exp int;
  v_coin int;
  v_inserted boolean;
begin
  select id, reward_exp, reward_coin into v_ach_id, v_exp, v_coin from public.achievements where code = p_code;
  if v_ach_id is not null then
    insert into public.user_achievements (user_id, achievement_id) values (p_user_id, v_ach_id) on conflict do nothing returning true into v_inserted;
    if v_inserted then 
      update public.user_stats set current_exp = current_exp + v_exp, coins = coins + v_coin where user_id = p_user_id; 
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
