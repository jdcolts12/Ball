-- DEBUG: Why is function only returning 3 when there are 10+ players?
-- Run this to see EXACTLY what's happening

-- 1. Show ALL user_ids who played today
select 
  'ALL_USER_IDS_TODAY' as info,
  user_id::text,
  count(*) as games_count,
  max(score) as best_score
from public.games
where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
group by user_id
order by max(score) desc;

-- 2. Check if they have profiles
select 
  'USER_PROFILE_CHECK' as info,
  g.user_id::text,
  case when p.id is not null then 'HAS PROFILE' else 'NO PROFILE' end as profile_status,
  p.username
from (
  select distinct user_id
  from public.games
  where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
) g
left join public.profiles p on p.id = g.user_id
order by p.username nulls last;

-- 3. What the function actually returns
select 
  'FUNCTION_RESULTS' as info,
  user_id::text,
  username,
  score,
  total_correct,
  total_questions
from public.get_daily_leaderboard(999999)
order by rank;

-- 4. Direct query matching function logic exactly
with all_today_users as (
  select distinct user_id
  from public.games
  where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
),
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
select 
  'DIRECT_QUERY_RESULTS' as info,
  wp.user_id::text,
  coalesce(p.username, 'Anonymous') as username,
  wp.score,
  wp.total_correct,
  wp.total_questions
from with_pct wp
left join public.profiles p on p.id = wp.user_id
order by wp.pct_correct desc nulls last, wp.score desc nulls last;
