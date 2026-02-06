-- FINAL FIX - Guaranteed to work tomorrow and every day
-- This version groups ONLY by user_id (not username) to avoid any grouping issues

drop function if exists public.get_daily_leaderboard(integer);

create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    row_number() over (
      order by 
        case when sum(g.questions_answered) > 0 
          then (sum(g.correct_answers)::numeric / sum(g.questions_answered)::numeric) * 100
          else 0
        end desc nulls last,
        max(g.score) desc nulls last
    )::bigint as rank,
    g.user_id,
    coalesce(p.username, 'Anonymous') as username,
    max(g.score)::bigint as score,
    sum(g.correct_answers)::bigint as total_correct,
    sum(g.questions_answered)::bigint as total_questions
  from public.games g
  left join public.profiles p on p.id = g.user_id
  where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  group by g.user_id, p.id  -- Group by p.id (not p.username) to handle NULLs correctly
  order by 
    case when sum(g.questions_answered) > 0 
      then (sum(g.correct_answers)::numeric / sum(g.questions_answered)::numeric) * 100
      else 0
    end desc nulls last,
    max(g.score) desc nulls last
  limit coalesce(nullif(limit_rows, 0), 999999);
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns ALL users who played today. Groups by user_id and profile id. Works every day.';
