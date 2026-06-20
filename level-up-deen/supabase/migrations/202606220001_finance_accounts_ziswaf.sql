-- Migration: Phase 9 - Finance Accounts, Debts, Ziswaf & Double-Entry Features

-- 1. Create financial_accounts
CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  type varchar(20) NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet', 'investment')),
  balance numeric NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_accounts_user_id ON public.financial_accounts(user_id);

-- 2. Create financial_debts
CREATE TABLE IF NOT EXISTS public.financial_debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL CHECK (type IN ('payable', 'receivable')), -- payable = hutang, receivable = piutang
  amount numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  person_name varchar(150) NOT NULL,
  due_date date,
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_debts_user_id ON public.financial_debts(user_id);

-- 3. Create ziswaf_records
CREATE TABLE IF NOT EXISTS public.ziswaf_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL CHECK (type IN ('zakat_maal', 'zakat_fitrah', 'infaq', 'waqaf', 'sadaqah')),
  amount numeric NOT NULL,
  date date NOT NULL,
  recipient varchar(150),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ziswaf_records_user_id ON public.ziswaf_records(user_id);

-- 4. Alter financial_transactions to support Double-Entry
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS to_account_id uuid REFERENCES public.financial_accounts(id) ON DELETE CASCADE;

-- Backfill existing transactions by creating a default "Cash" account for users that have transactions
DO $$
DECLARE
  rec RECORD;
  new_account_id uuid;
BEGIN
  FOR rec IN 
    SELECT DISTINCT user_id FROM public.financial_transactions WHERE account_id IS NULL
  LOOP
    -- Insert a default cash account
    INSERT INTO public.financial_accounts (user_id, name, type, is_default, balance)
    VALUES (rec.user_id, 'Tunai (Default)', 'cash', true, 0)
    RETURNING id INTO new_account_id;
    
    -- Update transactions
    UPDATE public.financial_transactions
    SET account_id = new_account_id
    WHERE user_id = rec.user_id AND account_id IS NULL;
  END LOOP;
END
$$;

-- Make account_id required for new transactions (wait, we will skip NOT NULL for now to prevent breaking if other queries don't pass it yet, but we will rely on logic. Actually, we CAN make it NOT NULL safely because we just updated it).
ALTER TABLE public.financial_transactions
ALTER COLUMN account_id SET NOT NULL;

-- 5. Trigger Function to Update Account Balances
CREATE OR REPLACE FUNCTION public.update_financial_account_balance()
RETURNS trigger AS $$
BEGIN
  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    IF OLD.type = 'income' THEN
      UPDATE public.financial_accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.financial_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.financial_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE public.financial_accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;
    RETURN OLD;
  END IF;

  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    IF NEW.type = 'income' THEN
      UPDATE public.financial_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.financial_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.financial_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE public.financial_accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- First, revert the old transaction's effect
    IF OLD.type = 'income' THEN
      UPDATE public.financial_accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.financial_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.financial_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE public.financial_accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;

    -- Then, apply the new transaction's effect
    IF NEW.type = 'income' THEN
      UPDATE public.financial_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.financial_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.financial_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE public.financial_accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
    
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_financial_account_balance ON public.financial_transactions;
CREATE TRIGGER trg_update_financial_account_balance
AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_financial_account_balance();

-- Backfill balances for the newly created accounts
DO $$
DECLARE
  rec RECORD;
  total_income numeric;
  total_expense numeric;
BEGIN
  FOR rec IN SELECT id, user_id FROM public.financial_accounts LOOP
    SELECT COALESCE(SUM(amount), 0) INTO total_income FROM public.financial_transactions WHERE account_id = rec.id AND type = 'income';
    SELECT COALESCE(SUM(amount), 0) INTO total_expense FROM public.financial_transactions WHERE account_id = rec.id AND type = 'expense';
    
    UPDATE public.financial_accounts SET balance = total_income - total_expense WHERE id = rec.id;
  END LOOP;
END
$$;

-- 6. Row-Level Security (RLS)
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ziswaf_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS financial_accounts_owner_policy ON public.financial_accounts;
CREATE POLICY financial_accounts_owner_policy ON public.financial_accounts
  FOR ALL TO public
  USING (public.is_owner(user_id))
  WITH CHECK (public.is_owner(user_id));

DROP POLICY IF EXISTS financial_debts_owner_policy ON public.financial_debts;
CREATE POLICY financial_debts_owner_policy ON public.financial_debts
  FOR ALL TO public
  USING (public.is_owner(user_id))
  WITH CHECK (public.is_owner(user_id));

DROP POLICY IF EXISTS ziswaf_records_owner_policy ON public.ziswaf_records;
CREATE POLICY ziswaf_records_owner_policy ON public.ziswaf_records
  FOR ALL TO public
  USING (public.is_owner(user_id))
  WITH CHECK (public.is_owner(user_id));

-- Realtime replication (opsional)
alter publication supabase_realtime add table public.financial_accounts;
alter publication supabase_realtime add table public.financial_debts;
alter publication supabase_realtime add table public.ziswaf_records;
