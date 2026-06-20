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
alter table public.squad_groups
add column if not exists invite_code varchar(10) unique;

-- Backfill existing squad_groups with random invite codes
do $$
declare
  squad record;
  candidate text;
begin
  for squad in
    select id from public.squad_groups where invite_code is null
  loop
    loop
      candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      exit when not exists (
        select 1 from public.squad_groups where invite_code = candidate
      );
    end loop;

    update public.squad_groups
    set invite_code = candidate
    where id = squad.id;
  end loop;
end $$;

alter table public.squad_groups
alter column invite_code set not null;
-- =================================================================
-- LEVEL UP DEEN – Avatar 3D & Item Shop Enhancements
-- =================================================================

-- 1. Extend items table with 3D model support and gender restriction
alter table public.items
  add column if not exists model_url text,
  add column if not exists gender_restriction varchar(10) not null default 'unisex';

-- Add check constraint for gender_restriction values
alter table public.items
  add constraint items_gender_restriction_check
  check (gender_restriction in ('male', 'female', 'unisex'));

-- 2. Trigger: enforce max 1 equipped item per item_type per user
create or replace function public.enforce_single_equip()
returns trigger
language plpgsql
as $$
declare
  v_item_type varchar(20);
begin
  if new.is_equipped = true then
    -- Lookup the item_type of the item being equipped
    select item_type into v_item_type
    from public.items
    where id = new.item_id;

    -- Un-equip any other item of the same type for this user
    update public.user_inventory
    set is_equipped = false
    where user_id = new.user_id
      and is_equipped = true
      and id != new.id
      and item_id in (
        select id from public.items where item_type = v_item_type
      );
  end if;

  return new;
end;
$$;

create trigger trg_enforce_single_equip
before insert or update of is_equipped on public.user_inventory
for each row execute procedure public.enforce_single_equip();

-- 3. Seed: Starter Items (Ikhwan / Male)
insert into public.items (name, item_type, rarity, price_coin, unlock_level, description, gender_restriction) values
  ('Peci Hitam Polos',       'headwear',    'common',    100,  1, 'Peci hitam klasik untuk sehari-hari.',           'male'),
  ('Peci Rajut Putih',       'headwear',    'common',    120,  1, 'Peci rajut putih khas pesantren.',               'male'),
  ('Kopiah Motif Batik',     'headwear',    'rare',      250,  5, 'Kopiah dengan motif batik elegan.',              'male'),
  ('Sorban Kepala',          'headwear',    'epic',      500, 10, 'Sorban kepala ala ulama klasik.',                 'male'),
  ('Baju Koko Pendek',       'outfit',      'common',    150,  1, 'Baju koko lengan pendek, nyaman dan rapi.',      'male'),
  ('Baju Koko Panjang',      'outfit',      'common',    180,  1, 'Baju koko lengan panjang untuk acara resmi.',    'male'),
  ('Kurta Pakistan',         'outfit',      'rare',      300,  5, 'Kurta gaya Pakistan yang stylish.',              'male'),
  ('Jubah Pria',             'outfit',      'epic',      600, 10, 'Jubah pria dengan detail bordir premium.',       'male'),
  ('Celana Sirwal',          'bottom',      'common',    120,  1, 'Celana sirwal di atas mata kaki.',               'male'),
  ('Sarung Batik',           'bottom',      'rare',      200,  3, 'Sarung batik motif tradisional.',                'male'),
  ('Celana Bahan Formal',    'bottom',      'common',    140,  1, 'Celana bahan formal warna gelap.',               'male'),
  ('Surban Leher',           'accessory',   'common',    80,   1, 'Surban yang dipakai di leher/pundak.',           'male'),
  ('Tasbih Tangan',          'accessory',   'rare',      200,  3, 'Tasbih kayu yang dipakai di pergelangan.',       'male'),
  ('Jam Tangan Klasik',      'accessory',   'epic',      450,  8, 'Jam tangan klasik dengan desain minimalis.',     'male');

-- 4. Seed: Starter Items (Akhwat / Female)
insert into public.items (name, item_type, rarity, price_coin, unlock_level, description, gender_restriction) values
  ('Khimar Instan Polos',    'headwear',    'common',    100,  1, 'Khimar instan warna polos, praktis.',            'female'),
  ('Pashmina Satin',         'headwear',    'common',    130,  1, 'Pashmina satin lembut dan elegan.',              'female'),
  ('Jilbab Segi Empat',      'headwear',    'rare',      220,  3, 'Jilbab segi empat motif bunga.',                 'female'),
  ('Bergo Sport',            'headwear',    'rare',      250,  5, 'Bergo sport untuk aktivitas harian.',            'female'),
  ('Abaya Hitam',            'outfit',      'common',    200,  1, 'Abaya hitam simpel dan syar i.',                 'female'),
  ('Gamis Pastel',           'outfit',      'rare',      350,  5, 'Gamis warna pastel dengan detail renda.',        'female'),
  ('Tunik Panjang',          'outfit',      'common',    180,  1, 'Tunik panjang dengan potongan A-line.',          'female'),
  ('Gamis Bordir Premium',   'outfit',      'epic',      650, 10, 'Gamis premium dengan bordir tangan.',            'female'),
  ('Cadar Niqab',            'accessory',   'rare',      200,  3, 'Cadar/niqab bahan chiffon.',                    'female'),
  ('Tas Tote Kanvas',        'accessory',   'common',    150,  1, 'Tas tote kanvas motif islami.',                  'female'),
  ('Bros Bunga Mutiara',     'accessory',   'epic',      400,  8, 'Bros bunga dengan hiasan mutiara.',              'female');

-- 5. Seed: Universal Items (Unisex)
insert into public.items (name, item_type, rarity, price_coin, unlock_level, description, gender_restriction) values
  ('Sajadah Masjid',             'background', 'common',    80,   1, 'Latar sajadah masjid yang tenang.',              'unisex'),
  ('Pemandangan Ka''bah',        'background', 'epic',      800, 15, 'Latar Ka''bah di waktu senja.',                  'unisex'),
  ('Langit Malam Cosmic',        'background', 'legendary', 1200, 20, 'Latar langit malam penuh bintang.',             'unisex'),
  ('Taman Madinah',              'background', 'rare',      400,  8, 'Latar taman hijau di kota Madinah.',             'unisex'),
  ('Gelar: Fajr Warrior',        'title',      'rare',      300,  5, 'Gelar bagi pejuang shalat Subuh.',              'unisex'),
  ('Gelar: Tahajjud Master',     'title',      'epic',      700, 12, 'Gelar bagi yang konsisten tahajjud.',            'unisex'),
  ('Gelar: Hafizh Starter',      'title',      'legendary', 1500, 25, 'Gelar bagi yang memulai menghafal Al-Quran.',  'unisex'),
  ('Gelar: Philanthropist',      'title',      'epic',      600, 10, 'Gelar bagi yang rajin bersedekah.',              'unisex');
-- =================================================================
-- LEVEL UP DEEN – Financial Ratio Templates (DB-stored formulas)
-- =================================================================

create table if not exists public.financial_ratio_templates (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  description text,
  formula varchar(255) not null,
  variables jsonb not null default '[]'::jsonb,
  healthy_min numeric not null default 0,
  healthy_max numeric not null default 100,
  unit varchar(10) not null default '%',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed: Standard financial ratios
insert into public.financial_ratio_templates (name, description, formula, variables, healthy_min, healthy_max, unit, display_order) values
(
  'Savings Ratio',
  'Persentase pendapatan yang berhasil ditabung. Idealnya minimal 20% dari total pendapatan.',
  '(savings / income) * 100',
  '["savings", "income"]'::jsonb,
  20, 100, '%', 1
),
(
  'Expense Ratio',
  'Persentase pendapatan yang digunakan untuk pengeluaran. Semakin rendah semakin baik.',
  '(expense / income) * 100',
  '["expense", "income"]'::jsonb,
  0, 70, '%', 2
),
(
  'Debt to Income Ratio',
  'Rasio utang terhadap pendapatan. Di bawah 30% dianggap sehat.',
  '(debt / income) * 100',
  '["debt", "income"]'::jsonb,
  0, 30, '%', 3
),
(
  'Emergency Fund Ratio',
  'Berapa bulan pengeluaran yang bisa ditanggung oleh tabungan darurat. Idealnya 3-6 bulan.',
  'savings / monthly_expense',
  '["savings", "monthly_expense"]'::jsonb,
  3, 12, 'bulan', 4
),
(
  'Needs vs Wants Ratio',
  'Persentase pengeluaran kebutuhan pokok dibanding total pengeluaran. Ikuti aturan 50/30/20.',
  '(needs / expense) * 100',
  '["needs", "expense"]'::jsonb,
  40, 60, '%', 5
);
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
-- Migration: Automated Achievements
-- Seeds initial achievements and creates triggers to award them automatically

insert into public.achievements (code, name, description, category, requirement_json, reward_exp, reward_coin) values
('FIRST_STEP', 'First Step', 'Bergabung dengan Level Up Deen', 'system', '{"type": "register"}', 50, 100),
('SAVER_1', 'The Saver', 'Mencatat tabungan pertama', 'finance', '{"type": "savings_tx"}', 100, 50),
('STUDIOUS', 'Studious', 'Menambahkan mata kuliah pertama', 'study', '{"type": "course_added"}', 100, 50)
on conflict (code) do nothing;

-- Function to award achievement
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
    -- Try to insert, returning id if successful
    insert into public.user_achievements (user_id, achievement_id)
    values (p_user_id, v_ach_id)
    on conflict do nothing
    returning true into v_inserted;
    
    -- If successfully inserted, add rewards
    if v_inserted then
      update public.user_stats
      set exp = exp + v_exp,
          coins = coins + v_coin
      where user_id = p_user_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- Trigger for FIRST_STEP
create or replace function public.trg_award_first_step()
returns trigger as $$
begin
  perform public.award_achievement(new.id, 'FIRST_STEP');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_profile_first_step on public.users_profile;
create trigger trg_user_profile_first_step
  after insert on public.users_profile
  for each row execute function public.trg_award_first_step();

-- Trigger for SAVER_1
create or replace function public.trg_award_saver()
returns trigger as $$
begin
  if new.category ilike '%tabungan%' or new.category ilike '%investasi%' or new.category ilike '%savings%' then
    perform public.award_achievement(new.user_id, 'SAVER_1');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_financial_tx_saver on public.financial_transactions;
create trigger trg_financial_tx_saver
  after insert on public.financial_transactions
  for each row execute function public.trg_award_saver();

-- Trigger for STUDIOUS
create or replace function public.trg_award_studious()
returns trigger as $$
begin
  perform public.award_achievement(new.user_id, 'STUDIOUS');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_study_courses_studious on public.study_courses;
create trigger trg_study_courses_studious
  after insert on public.study_courses
  for each row execute function public.trg_award_studious();
-- =================================================================
-- LEVEL UP DEEN – Seed Avatar Shop Items
-- =================================================================

-- 1. Insert starter items (Headwear, Outfit, Accessory, Background, Title)
insert into public.items (id, name, item_type, rarity, price_coin, unlock_level, gender_restriction, description)
values
  -- Headwear (Male)
  (gen_random_uuid(), 'Peci Hitam', 'headwear', 'common', 50, 1, 'male', 'Peci hitam standar untuk menemani ibadah.'),
  (gen_random_uuid(), 'Peci Putih Haji', 'headwear', 'rare', 150, 3, 'male', 'Peci putih dengan corak rapi, nyaman dipakai.'),
  (gen_random_uuid(), 'Sorban Hijau', 'headwear', 'epic', 500, 7, 'male', 'Sorban elegan berwarna hijau zamrud.'),

  -- Headwear (Female)
  (gen_random_uuid(), 'Hijab Instan Hitam', 'headwear', 'common', 50, 1, 'female', 'Hijab instan yang praktis dan nyaman untuk sehari-hari.'),
  (gen_random_uuid(), 'Pashmina Nude', 'headwear', 'rare', 150, 3, 'female', 'Pashmina elegan dengan warna lembut.'),
  (gen_random_uuid(), 'Khimar Syari', 'headwear', 'epic', 500, 7, 'female', 'Khimar panjang yang anggun dan syari.'),

  -- Outfit (Male)
  (gen_random_uuid(), 'Baju Koko Polos', 'outfit', 'common', 100, 1, 'male', 'Baju koko berlengan pendek yang nyaman untuk harian.'),
  (gen_random_uuid(), 'Koko Kurta', 'outfit', 'rare', 250, 4, 'male', 'Baju koko bergaya kurta panjang modern.'),
  (gen_random_uuid(), 'Jubah Arab', 'outfit', 'epic', 600, 8, 'male', 'Jubah panjang ala Timur Tengah.'),

  -- Outfit (Female)
  (gen_random_uuid(), 'Gamis Basic', 'outfit', 'common', 100, 1, 'female', 'Gamis potongan A-line yang nyaman.'),
  (gen_random_uuid(), 'Abaya Hitam', 'outfit', 'rare', 250, 4, 'female', 'Abaya hitam khas Timur Tengah yang elegan.'),
  (gen_random_uuid(), 'Gamis Pesta', 'outfit', 'epic', 600, 8, 'female', 'Gamis dengan hiasan cantik untuk acara penting.'),

  -- Accessories (Unisex mostly)
  (gen_random_uuid(), 'Tasbih Kayu', 'accessory', 'common', 80, 2, 'unisex', 'Tasbih kayu klasik 33 butir.'),
  (gen_random_uuid(), 'Al-Quran Saku', 'accessory', 'rare', 200, 5, 'unisex', 'Al-Quran kecil yang selalu dibawa kemana-mana.'),
  (gen_random_uuid(), 'Sajadah Turki', 'accessory', 'epic', 450, 10, 'unisex', 'Sajadah tebal dengan motif indah asli Turki.'),
  (gen_random_uuid(), 'Sarung Wadimor', 'accessory', 'rare', 180, 4, 'male', 'Sarung tenun asli Indonesia.'),

  -- Backgrounds (Unisex)
  (gen_random_uuid(), 'Sajadah Masjid', 'background', 'common', 200, 3, 'unisex', 'Suasana dalam masjid yang tenang.'),
  (gen_random_uuid(), 'Taman Madinah', 'background', 'rare', 400, 6, 'unisex', 'Pemandangan taman di dekat Masjid Nabawi.'),
  (gen_random_uuid(), 'Pemandangan Ka''bah', 'background', 'epic', 800, 12, 'unisex', 'Pemandangan kiblat suci umat Islam.'),
  (gen_random_uuid(), 'Langit Malam Cosmic', 'background', 'legendary', 1500, 20, 'unisex', 'Malam Lailatul Qadar dengan taburan bintang.'),

  -- Titles (Unisex)
  (gen_random_uuid(), 'Santri Baru', 'title', 'common', 50, 1, 'unisex', 'Gelar untuk penuntut ilmu pemula.'),
  (gen_random_uuid(), 'Pejuang Subuh', 'title', 'rare', 300, 5, 'unisex', 'Diberikan bagi yang konsisten sholat Subuh berjamaah.'),
  (gen_random_uuid(), 'Al-Hafizh', 'title', 'legendary', 2000, 25, 'unisex', 'Gelar mulia sang penghafal Al-Quran.')
on conflict do nothing;
