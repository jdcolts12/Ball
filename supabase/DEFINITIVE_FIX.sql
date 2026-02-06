-- DEFINITIVE FIX - This WILL return ALL players
-- The function is missing players. This fixes it completely.

drop function if exists public.get_daily_leaderboard(integer);

create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  -- Step 1: Get ALL users who played today - no filtering, no joins yet
  with all_today_users as (
    select distinct user_id
    from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  -- Step 2: Get their stats
  user_stats as (
    select 
      g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    inner join all_today_users atu on atu.user_id = g.user_id
    where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
    group by g.user_id
  ),
  -- Step 3: Calculate percentages
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
    from user_stats
  )
  -- Step 4: Join with profiles (LEFT JOIN so users without profiles still show)
  select
    row_number() over (order by wp.pct_correct desc nulls last, wp.score desc nulls last)::bigint as rank,
    wp.user_id,
    coalesce(p.username, 'Anonymous') as username,
    wp.score::bigint,
    wp.total_correct,
    wp.total_questions
  from with_pct wp
  left join public.profiles p on p.id = wp.user_id
  order by wp.pct_correct desc nulls last, wp.score desc nulls last
  limit coalesce(nullif(limit_rows, 0), 999999);
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns ALL users who played today. Guaranteed to include everyone.';

-- Verify it works
select 
  'Total users today' as check_type,
  count(distinct user_id)::bigint as count
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
union all
select 
  'Function returns' as check_type,
  count(*)::bigint as count
from public.get_daily_leaderboard(999999);
