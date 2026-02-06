-- Check if users without profiles are being excluded
-- Run this to see the difference

-- 1. Total unique users who played today
select 
  count(distinct user_id) as total_users_today
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- 2. Users WITH profiles who played today
select 
  count(distinct g.user_id) as users_with_profiles
from public.games g
join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- 3. Users WITHOUT profiles who played today (these are being excluded!)
select 
  count(distinct g.user_id) as users_without_profiles
from public.games g
left join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  and p.id is null;

-- 4. What the current function returns (with INNER JOIN)
select count(*) as current_function_returns
from public.get_daily_leaderboard(999999);

-- 5. What it SHOULD return (all users)
select count(distinct user_id) as should_return
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;
