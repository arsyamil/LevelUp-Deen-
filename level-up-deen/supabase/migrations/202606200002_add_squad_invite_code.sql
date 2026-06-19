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
