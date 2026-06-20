-- Migration: Squad System
-- Adds tables and policies for user guilds/squads

create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null unique,
  description text,
  emblem_url varchar(255),
  created_by text not null references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.squad_members (
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id text not null references public.users_profile(id) on delete cascade,
  role varchar(20) not null default 'member', -- 'leader', 'co-leader', 'member'
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

-- Enable RLS
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;

-- Policies for squads
create policy "Squads are viewable by everyone"
  on public.squads for select
  using (true);

create policy "Users can insert squads"
  on public.squads for insert
  with check (auth.uid()::text = created_by);

create policy "Squad leaders can update squads"
  on public.squads for update
  using (
    exists (
      select 1 from public.squad_members
      where squad_id = squads.id
        and user_id = auth.uid()::text
        and role = 'leader'
    )
  );

create policy "Squad leaders can delete squads"
  on public.squads for delete
  using (
    exists (
      select 1 from public.squad_members
      where squad_id = squads.id
        and user_id = auth.uid()::text
        and role = 'leader'
    )
  );

-- Policies for squad_members
create policy "Squad members are viewable by everyone"
  on public.squad_members for select
  using (true);

create policy "Users can join squads"
  on public.squad_members for insert
  with check (auth.uid()::text = user_id);

create policy "Squad leaders can remove members"
  on public.squad_members for delete
  using (
    auth.uid()::text = user_id -- Users can leave
    or exists (
      select 1 from public.squad_members sm
      where sm.squad_id = squad_members.squad_id
        and sm.user_id = auth.uid()::text
        and sm.role = 'leader'
    )
  );

create policy "Squad leaders can update roles"
  on public.squad_members for update
  using (
    exists (
      select 1 from public.squad_members sm
      where sm.squad_id = squad_members.squad_id
        and sm.user_id = auth.uid()::text
        and sm.role = 'leader'
    )
  );

-- Indexes for performance
create index if not exists idx_squad_members_user on public.squad_members(user_id);
create index if not exists idx_squad_members_squad on public.squad_members(squad_id);
