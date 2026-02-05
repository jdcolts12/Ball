-- Fix monthly leaderboard to sum all scores for the month instead of max single game score
-- This gives users their total points for the month, not just their best single game

create or replace function public.get_monthly_leaderboard(limit_rows int default 5000)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with monthly_agg as (
    select g.user_id,
      sum(g.score)::bigint as score,  -- Changed from max(g.score) to sum(g.score) for total monthly points
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where g.created_at >= date_trunc('month', (current_timestamp at time zone 'America/Los_Angeles'))
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
  limit least(coalesce(nullif(limit_rows, 0), 5000), 10000);
$$;

comment on function public.get_monthly_leaderboard(int) is 'Returns monthly leaderboard: all users who played this month (PST), ordered by % correct (best to worst), with total score as tiebreaker.';
