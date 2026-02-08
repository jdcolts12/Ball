-- Fix daily leaderboard so it shows everyone who played today.
-- Causes of missing players:
-- 1. INNER JOIN profiles excluded users without a profile row → use LEFT JOIN.
-- 2. UTC "today" vs PST: app uses PST for daily reset → use America/Los_Angeles.
-- 3. Low limit or cap (e.g. 50 or 10000) → honor limit_rows up to 999999.

drop function if exists public.get_daily_leaderboard(integer);

create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
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
  limit coalesce(nullif(limit_rows, 0), 999999);
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns everyone who played today (PST): LEFT JOIN profiles so users without a profile still appear. Ordered by % correct then score.';
