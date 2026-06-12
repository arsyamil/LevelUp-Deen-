-- Align persisted user identity with Clerk.
-- Clerk user IDs are text values (for example: user_xxx), not Supabase Auth UUIDs.

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conrelid::regclass as table_name, conname as constraint_name
    from pg_constraint
    where contype = 'f'
      and (
        confrelid = 'public.users_profile'::regclass
        or confrelid = 'auth.users'::regclass
      )
  loop
    execute format(
      'alter table %s drop constraint if exists %I',
      constraint_record.table_name,
      constraint_record.constraint_name
    );
  end loop;
end $$;

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

alter table public.users_profile
  alter column id type text using id::text;

alter table public.user_stats
  alter column user_id type text using user_id::text;

alter table public.user_tasks
  alter column user_id type text using user_id::text;

alter table public.daily_task_logs
  alter column user_id type text using user_id::text;

alter table public.water_logs
  alter column user_id type text using user_id::text;

alter table public.financial_categories
  alter column user_id type text using user_id::text;

alter table public.financial_transactions
  alter column user_id type text using user_id::text;

alter table public.budgets
  alter column user_id type text using user_id::text;

alter table public.savings_goals
  alter column user_id type text using user_id::text;

alter table public.user_inventory
  alter column user_id type text using user_id::text;

alter table public.user_achievements
  alter column user_id type text using user_id::text;

alter table public.recovery_quest_logs
  alter column user_id type text using user_id::text;

alter table public.sync_queue_logs
  alter column user_id type text using user_id::text;

alter table public.squad_groups
  alter column created_by type text using created_by::text;

alter table public.squad_members
  alter column user_id type text using user_id::text;

alter table public.leaderboard_snapshots
  alter column user_id type text using user_id::text;

alter table public.ai_conversations
  alter column user_id type text using user_id::text;

alter table public.ai_recommendations
  alter column user_id type text using user_id::text;

alter table public.ai_finance_parse_logs
  alter column user_id type text using user_id::text;

alter table public.admin_role_change_logs
  alter column changed_by type text using changed_by::text,
  alter column changed_user_id type text using changed_user_id::text;

alter table public.user_stats
  add constraint user_stats_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.user_tasks
  add constraint user_tasks_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.daily_task_logs
  add constraint daily_task_logs_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.water_logs
  add constraint water_logs_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.financial_categories
  add constraint financial_categories_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.financial_transactions
  add constraint financial_transactions_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.budgets
  add constraint budgets_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.savings_goals
  add constraint savings_goals_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.user_inventory
  add constraint user_inventory_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.user_achievements
  add constraint user_achievements_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.recovery_quest_logs
  add constraint recovery_quest_logs_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.sync_queue_logs
  add constraint sync_queue_logs_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.squad_groups
  add constraint squad_groups_created_by_fkey
  foreign key (created_by) references public.users_profile(id) on delete cascade;

alter table public.squad_members
  add constraint squad_members_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.leaderboard_snapshots
  add constraint leaderboard_snapshots_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.ai_conversations
  add constraint ai_conversations_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.ai_recommendations
  add constraint ai_recommendations_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

alter table public.ai_finance_parse_logs
  add constraint ai_finance_parse_logs_user_id_fkey
  foreign key (user_id) references public.users_profile(id) on delete cascade;

drop function if exists public.is_owner(uuid);
