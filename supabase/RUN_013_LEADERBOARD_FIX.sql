-- Drop existing functions first, then recreate with % correct ordering
-- Copy everything below and paste into Supabase SQL Editor → Run

drop function if exists public.get_daily_leaderboard(integer);
drop function if exists public.get_monthly_leaderboard(integer);
drop function if exists public.get_all_time_leaderboard(integer);

-- Order all leaderboards by % correct (best to worst). Tiebreaker: score (daily/monthly) or total_correct (all-time).

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
  join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.score desc nulls last
  limit coalesce(nullif(limit_rows, 0), 10000);
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns daily leaderboard: all users who played today, ordered by % correct (best to worst). No hard cap so all players are shown.';

create or replace function public.get_monthly_leaderboard(limit_rows int default 500)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with monthly_agg as (
    select g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where g.created_at >= date_trunc('month', (current_timestamp at time zone 'utc'))
    group by g.user_id
  ),
  ordered as (
    select m.user_id, m.score, m.total_correct, m.total_questions,
      (m.total_correct::numeric / nullif(m.total_questions, 0)) as pct
    from monthly_agg m
  )
  select
    row_number() over (order by o.pct desc nulls last, o.score desc nulls last)::bigint as rank,
    o.user_id,
    coalesce(p.username, 'Anonymous') as username,
    o.score::bigint,
    o.total_correct,
    o.total_questions
  from ordered o
  join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.score desc nulls last
  limit least(coalesce(nullif(limit_rows, 0), 500), 1000);
$$;

comment on function public.get_monthly_leaderboard(int) is 'Returns monthly leaderboard: ordered by % correct (best to worst), up to limit_rows.';

create or replace function public.get_all_time_leaderboard(limit_rows int default 500)
returns table (rank bigint, username text, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with pct_ordered as (
    select s.user_id, s.total_correct, s.total_questions,
      (s.total_correct::numeric / nullif(s.total_questions, 0)) as pct
    from public.stats s
  )
  select
    row_number() over (order by o.pct desc nulls last, o.total_correct desc nulls last)::bigint as rank,
    coalesce(p.username, 'Anonymous') as username,
    o.total_correct::bigint,
    o.total_questions::bigint
  from pct_ordered o
  join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.total_correct desc nulls last
  limit least(coalesce(nullif(limit_rows, 0), 500), 1000);
$$;

comment on function public.get_all_time_leaderboard(int) is 'Returns all-time leaderboard: ordered by % correct (best to worst), up to limit_rows.';
