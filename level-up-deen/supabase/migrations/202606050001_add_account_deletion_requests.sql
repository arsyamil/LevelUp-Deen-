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

alter table public.account_deletion_requests enable row level security;

create policy account_deletion_requests_owner_policy on public.account_deletion_requests
for select using (public.is_owner(user_id));
