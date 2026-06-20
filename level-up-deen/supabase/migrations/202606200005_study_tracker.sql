-- =================================================================
-- LEVEL UP DEEN – Study Tracker (Mahasiswa)
-- =================================================================

-- 1. Mata Kuliah
create table if not exists public.study_courses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users_profile(id) on delete cascade,
  course_name varchar(200) not null,
  course_code varchar(30),
  lecturer_name varchar(200),
  semester varchar(20),
  color varchar(20) default '#6366f1',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Jadwal Sesi Kuliah (Recurring per minggu)
create table if not exists public.study_schedules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.study_courses(id) on delete cascade,
  user_id text not null references public.users_profile(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  session_type varchar(30) not null default 'teori',
  room varchar(80),
  building varchar(120),
  reminder_minutes integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_schedules_time_check check (end_time > start_time)
);

-- 3. Tugas / Deadline Perkuliahan
create table if not exists public.study_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.study_courses(id) on delete cascade,
  user_id text not null references public.users_profile(id) on delete cascade,
  title varchar(255) not null,
  description text,
  deadline_at timestamptz not null,
  priority varchar(10) not null default 'medium',
  is_completed boolean not null default false,
  completed_at timestamptz,
  reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_assignments_priority_check check (priority in ('low', 'medium', 'high'))
);

-- 4. RLS
alter table public.study_courses enable row level security;
alter table public.study_schedules enable row level security;
alter table public.study_assignments enable row level security;

create policy study_courses_owner_policy on public.study_courses
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy study_schedules_owner_policy on public.study_schedules
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy study_assignments_owner_policy on public.study_assignments
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 5. Indexes
create index if not exists study_schedules_user_day_idx
  on public.study_schedules(user_id, day_of_week);

create index if not exists study_assignments_user_deadline_idx
  on public.study_assignments(user_id, deadline_at)
  where is_completed = false;
