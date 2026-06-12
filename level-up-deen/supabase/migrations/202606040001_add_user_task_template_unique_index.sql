create unique index if not exists user_tasks_user_template_unique_idx
  on public.user_tasks(user_id, template_id)
  where template_id is not null;
