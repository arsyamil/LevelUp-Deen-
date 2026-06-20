-- RLS Policies for Level Up Deen

-- 1. users_profile
drop policy if exists users_profile_owner_policy on public.users_profile;
create policy users_profile_owner_policy on public.users_profile
  using (public.is_owner(id))
  with check (public.is_owner(id));

-- 2. user_stats
drop policy if exists user_stats_owner_policy on public.user_stats;
create policy user_stats_owner_policy on public.user_stats
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 3. user_tasks
drop policy if exists user_tasks_owner_policy on public.user_tasks;
create policy user_tasks_owner_policy on public.user_tasks
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 4. daily_task_logs
drop policy if exists daily_task_logs_owner_policy on public.daily_task_logs;
create policy daily_task_logs_owner_policy on public.daily_task_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 5. water_logs
drop policy if exists water_logs_owner_policy on public.water_logs;
create policy water_logs_owner_policy on public.water_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 6. financial_categories
drop policy if exists financial_categories_owner_policy on public.financial_categories;
create policy financial_categories_owner_policy on public.financial_categories
  using (public.is_owner(user_id) or user_id is null)
  with check (public.is_owner(user_id));

-- 7. financial_transactions
drop policy if exists financial_transactions_owner_policy on public.financial_transactions;
create policy financial_transactions_owner_policy on public.financial_transactions
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 8. budgets
drop policy if exists budgets_owner_policy on public.budgets;
create policy budgets_owner_policy on public.budgets
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 9. savings_goals
drop policy if exists savings_goals_owner_policy on public.savings_goals;
create policy savings_goals_owner_policy on public.savings_goals
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 10. user_inventory
drop policy if exists user_inventory_owner_policy on public.user_inventory;
create policy user_inventory_owner_policy on public.user_inventory
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 11. account_deletion_requests
drop policy if exists account_deletion_requests_owner_policy on public.account_deletion_requests;
create policy account_deletion_requests_owner_policy on public.account_deletion_requests
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 12. ai_conversations
drop policy if exists ai_conversations_owner_policy on public.ai_conversations;
create policy ai_conversations_owner_policy on public.ai_conversations
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 13. ai_recommendations
drop policy if exists ai_recommendations_owner_policy on public.ai_recommendations;
create policy ai_recommendations_owner_policy on public.ai_recommendations
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- 14. ai_finance_parse_logs
drop policy if exists ai_finance_parse_logs_owner_policy on public.ai_finance_parse_logs;
create policy ai_finance_parse_logs_owner_policy on public.ai_finance_parse_logs
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

-- Note: Other tables like squads, achievements, and items already have specific policies or are viewable by all.
