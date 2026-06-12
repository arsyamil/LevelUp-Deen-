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
