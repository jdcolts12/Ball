-- Return (pct, total, correct) so frontend can include current player's answer in % (game not saved until all 3 questions done).
create or replace function public.get_draft_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_draft from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_draft)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

create or replace function public.get_college_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_college from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_college)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

create or replace function public.get_career_path_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_career_path from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_career_path)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;
