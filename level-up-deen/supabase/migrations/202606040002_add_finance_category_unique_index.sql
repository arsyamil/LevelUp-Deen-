create unique index if not exists financial_categories_user_type_name_unique_idx
  on public.financial_categories(user_id, type, name);
