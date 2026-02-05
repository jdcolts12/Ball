-- Run this to diagnose why daily leaderboard might be missing players
-- Copy and paste into Supabase SQL Editor

-- 1. How many unique users played TODAY (UTC date)?
select 
  count(distinct user_id) as total_users_today,
  count(*) as total_games_today
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- 2. What does the function return?
select count(*) as function_returns_count
from public.get_daily_leaderboard(10000);

-- 3. Show first 50 users who played today (ordered by % correct)
select 
  p.username,
  count(*) as games_today,
  max(g.score) as best_score,
  sum(g.correct_answers) as total_correct,
  sum(g.questions_answered) as total_questions,
  round((sum(g.correct_answers)::numeric / nullif(sum(g.questions_answered), 0)) * 100, 0) as pct_correct
from public.games g
join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
group by p.username
order by (sum(g.correct_answers)::numeric / nullif(sum(g.questions_answered), 0)) desc, max(g.score) desc
limit 50;

-- 4. Compare: What the function returns vs what should be there
select 
  'Function returns' as source,
  count(*) as count
from public.get_daily_leaderboard(10000)
union all
select 
  'Should return' as source,
  count(distinct user_id) as count
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;
