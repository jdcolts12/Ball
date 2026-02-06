-- COMPREHENSIVE DIAGNOSTIC AND FIX
-- Run this to see EXACTLY what's wrong and fix it

-- STEP 1: DIAGNOSTIC - See what's happening
select 
  '=== DIAGNOSTIC RESULTS ===' as section;

-- How many total users played TODAY?
select 
  'Total users who played today' as check_type,
  count(distinct user_id)::text as value
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- How many does the CURRENT function return?
select 
  'Current function returns' as check_type,
  count(*)::text as value
from public.get_daily_leaderboard(999999);

-- Users WITHOUT profiles (these might be missing)
select 
  'Users WITHOUT profiles (might be missing)' as check_type,
  count(distinct g.user_id)::text as value
from public.games g
left join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  and p.id is null;

-- STEP 2: FIX - Replace function with guaranteed working version
drop function if exists public.get_daily_leaderboard(integer);

create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  -- Get ALL users who played today, no exceptions
  with today_players as (
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
    from today_players
  )
  select
    row_number() over (order by pct_correct desc nulls last, score desc nulls last)::bigint as rank,
    wp.user_id,
    coalesce(p.username, 'Anonymous') as username,
    wp.score::bigint,
    wp.total_correct,
    wp.total_questions
  from with_pct wp
  left join public.profiles p on p.id = wp.user_id  -- LEFT JOIN ensures everyone shows up
  order by wp.pct_correct desc nulls last, wp.score desc nulls last
  limit coalesce(nullif(limit_rows, 0), 999999);
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns ALL users who played today. Uses LEFT JOIN. No effective limit.';

-- STEP 3: VERIFY - Check if fix worked
select 
  '=== VERIFICATION ===' as section;

select 
  'After fix - function returns' as check_type,
  count(*)::text as value
from public.get_daily_leaderboard(999999);

-- Final comparison
select 
  'Total users today' as metric,
  count(distinct user_id)::text as value
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
union all
select 
  'Function returns now' as metric,
  count(*)::text as value
from public.get_daily_leaderboard(999999);
