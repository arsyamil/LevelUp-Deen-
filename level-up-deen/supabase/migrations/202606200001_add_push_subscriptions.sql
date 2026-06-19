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

create policy user_push_subscriptions_owner_policy on public.user_push_subscriptions
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));
