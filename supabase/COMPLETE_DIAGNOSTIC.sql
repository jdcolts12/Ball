-- COMPLETE DIAGNOSTIC - Run this to see EXACTLY what's wrong
-- Copy ALL of this and run in Supabase SQL Editor

-- 1. How many total users played TODAY?
select 
  'Total users who played today' as metric,
  count(distinct user_id)::text as value
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;

-- 2. How many does the function return?
select 
  'Function returns' as metric,
  count(*)::text as value
from public.get_daily_leaderboard(999999);

-- 3. List ALL users who played today (first 100)
select 
  g.user_id,
  coalesce(p.username, 'NO PROFILE') as username,
  count(*) as games,
  max(g.score) as best_score,
  sum(g.correct_answers) as total_correct,
  sum(g.questions_answered) as total_questions
from public.games g
left join public.profiles p on p.id = g.user_id
where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
group by g.user_id, p.username
order by (sum(g.correct_answers)::numeric / nullif(sum(g.questions_answered), 0)) desc, max(g.score) desc
limit 100;

-- 4. Check if function is using LEFT JOIN correctly
select 
  case 
    when count(*) filter (where username = 'Anonymous') > 0 then 'LEFT JOIN working - has Anonymous users'
    else 'LEFT JOIN might not be working - no Anonymous users found'
  end as join_status
from public.get_daily_leaderboard(999999);
