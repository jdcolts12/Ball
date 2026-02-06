-- EXACT DIAGNOSTIC - Run this and share ALL results
-- This will show EXACTLY what's wrong

-- 1. Total unique users who played TODAY (this is the truth)
select 
  'TOTAL_USERS_TODAY' as metric,
  count(distinct user_id)::bigint as count
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- 2. What the function currently returns
select 
  'FUNCTION_RETURNS' as metric,
  count(*)::bigint as count
from public.get_daily_leaderboard(999999);

-- 3. List of ALL user_ids who played today (first 50)
select 
  'USER_ID' as column_name,
  user_id::text as value,
  count(*) as games_count,
  max(score) as best_score
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
group by user_id
order by max(score) desc
limit 50;

-- 4. Check if any users don't have profiles
select 
  'USERS_WITHOUT_PROFILES' as metric,
  count(distinct g.user_id)::bigint as count
from public.games g
left join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  and p.id is null;

-- 5. Direct query - what SHOULD be returned (matching the function logic exactly)
with today_players as (
  select 
    user_id,
    max(score) as score,
    sum(correct_answers)::bigint as total_correct,
    sum(questions_answered)::bigint as total_questions
  from public.games
  where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  group by user_id
)
select 
  'DIRECT_QUERY_COUNT' as metric,
  count(*)::bigint as count
from today_players;
