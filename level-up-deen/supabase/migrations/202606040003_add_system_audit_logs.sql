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

alter table public.system_audit_logs enable row level security;

create policy system_audit_logs_admin_read_policy on public.system_audit_logs
for select using (false);
