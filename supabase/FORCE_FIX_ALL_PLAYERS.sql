-- COMPLETE FIX: Show ALL players who played today - no exceptions
-- This replaces the function completely with a verified working version
-- Run this EXACTLY as written in Supabase SQL Editor

drop function if exists public.get_daily_leaderboard(integer);

create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with today_games as (
    select 
      user_id,
      max(score) as score,
      sum(correct_answers)::bigint as total_correct,
      sum(questions_answered)::bigint as total_questions
    from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
    group by user_id
  ),
  with_pct as (
    select 
      user_id,
      score,
      total_correct,
      total_questions,
      case 
        when total_questions > 0 then (total_correct::numeric / total_questions::numeric) * 100
        else 0
      end as pct_correct
    from today_games
  )
  select
    row_number() over (order by pct_correct desc nulls last, score desc nulls last)::bigint as rank,
    w.user_id,
    coalesce(p.username, 'Anonymous') as username,
    w.score::bigint,
    w.total_correct,
    w.total_questions
  from with_pct w
  left join public.profiles p on p.id = w.user_id
  order by w.pct_correct desc nulls last, w.score desc nulls last
  limit coalesce(nullif(limit_rows, 0), 999999);
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns ALL users who played today (UTC date). Uses LEFT JOIN to include users without profiles. Ordered by % correct.';

-- Test it immediately
select 
  'Total users who played today' as check_type,
  count(distinct user_id)::text as value
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
union all
select 
  'Function returns' as check_type,
  count(*)::text as value
from public.get_daily_leaderboard(999999);
