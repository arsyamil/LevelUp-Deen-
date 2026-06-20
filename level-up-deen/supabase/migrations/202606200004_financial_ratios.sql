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
