-- Diagnostic query: Check how many players played today and compare to leaderboard
-- Run this in Supabase SQL Editor to see if the function is returning everyone

-- 1. Count total unique users who played today
select count(distinct user_id) as total_users_today
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- 2. Count what the function returns (with high limit)
select count(*) as function_returns
from public.get_daily_leaderboard(10000);

-- 3. Show all users who played today (first 20)
select 
  p.username,
  count(*) as games_today,
  max(g.score) as best_score,
  sum(g.correct_answers) as total_correct,
  sum(g.questions_answered) as total_questions
from public.games g
join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
group by p.username
order by (sum(g.correct_answers)::numeric / nullif(sum(g.questions_answered), 0)) desc, max(g.score) desc
limit 20;
