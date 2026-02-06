-- Fix: Show ALL players including those without profiles
-- The issue: INNER JOIN excludes users without profiles
-- Solution: Use LEFT JOIN so everyone shows up
-- Run this in Supabase SQL Editor

drop function if exists public.get_daily_leaderboard(integer);

create or replace function public.get_daily_leaderboard(limit_rows int default null)
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
    where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
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
  limit case when limit_rows is null or limit_rows <= 0 then 999999 else limit_rows end;
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns daily leaderboard: ALL users who played today (UTC date), including those without profiles. Uses LEFT JOIN. Ordered by % correct (best to worst).';
