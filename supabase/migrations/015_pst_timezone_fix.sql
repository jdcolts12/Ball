-- Fix all "today" functions to use PST timezone (midnight PST reset) instead of UTC
-- This ensures the daily leaderboard and all "today" stats reset at midnight PST

-- Update daily leaderboard to use PST
create or replace function public.get_daily_leaderboard(limit_rows int default 5000)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with daily_agg as (
    select g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where (g.created_at at time zone 'America/Los_Angeles')::date = (current_timestamp at time zone 'America/Los_Angeles')::date
    group by g.user_id
  ),
  ordered as (
    select d.user_id, d.score, d.total_correct, d.total_questions,
      (d.total_correct::numeric / nullif(d.total_questions, 0)) as pct
    from daily_agg d
  )
  select
    row_number() over (order by o.pct desc nulls last, o.score desc nulls last)::bigint as rank,
    o.user_id,
    coalesce(p.username, 'Anonymous') as username,
    o.score::bigint,
    o.total_correct,
    o.total_questions
  from ordered o
  left join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.score desc nulls last
  limit least(coalesce(nullif(limit_rows, 0), 5000), 10000);
$$;

-- Update draft correct % today to use PST
create or replace function public.get_draft_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_draft from public.games
    where (created_at at time zone 'America/Los_Angeles')::date = (current_timestamp at time zone 'America/Los_Angeles')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_draft)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

-- Update college correct % today to use PST
create or replace function public.get_college_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_college from public.games
    where (created_at at time zone 'America/Los_Angeles')::date = (current_timestamp at time zone 'America/Los_Angeles')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_college)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

-- Update career path correct % today to use PST
create or replace function public.get_career_path_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_career_path from public.games
    where (created_at at time zone 'America/Los_Angeles')::date = (current_timestamp at time zone 'America/Los_Angeles')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_career_path)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns daily leaderboard: all users who played today (PST), ordered by % correct (best to worst).';
comment on function public.get_draft_correct_pct_today() is 'Returns draft question stats for today (PST).';
comment on function public.get_college_correct_pct_today() is 'Returns college question stats for today (PST).';
comment on function public.get_career_path_correct_pct_today() is 'Returns career path question stats for today (PST).';
