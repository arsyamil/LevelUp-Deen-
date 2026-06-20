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
