-- Add user_id to leaderboard functions for badge calculation
create or replace function public.get_daily_leaderboard(limit_rows int default 50)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint) language sql security definer set search_path = public stable as $$
  with daily_agg as (
    select g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
    group by g.user_id
  )
  select row_number() over (order by d.score desc nulls last) as rank, d.user_id, coalesce(p.username, 'Anonymous') as username, d.score::bigint, d.total_correct, d.total_questions
  from daily_agg d join public.profiles p on p.id = d.user_id order by d.score desc limit limit_rows;
$$;

create or replace function public.get_monthly_leaderboard(limit_rows int default 50)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint) language sql security definer set search_path = public stable as $$
  with monthly_agg as (
    select g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where g.created_at >= date_trunc('month', (current_timestamp at time zone 'utc'))
    group by g.user_id
  )
  select row_number() over (order by m.score desc nulls last) as rank, m.user_id, coalesce(p.username, 'Anonymous') as username, m.score::bigint, m.total_correct, m.total_questions
  from monthly_agg m join public.profiles p on p.id = m.user_id order by m.score desc limit limit_rows;
$$;
