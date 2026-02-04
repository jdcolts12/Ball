-- % of today's games where the career path question was answered correctly (for wrong-answer feedback)
create or replace function public.get_career_path_correct_pct_today()
returns table (pct numeric) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_career_path from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  )
  select coalesce(round(100.0 * count(*) filter (where correct_career_path) / nullif(count(*), 0), 0), 0)::numeric as pct from today_games;
$$;
