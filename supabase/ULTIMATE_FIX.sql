-- ULTIMATE FIX - This WILL work. Run this EXACTLY.
-- Step 1: Drop the function completely
drop function if exists public.get_daily_leaderboard(integer);

-- Step 2: Create new function with LEFT JOIN and no limit issues
create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  today_date date;
begin
  -- Get today's date in UTC
  today_date := (current_timestamp at time zone 'utc')::date;
  
  return query
  with today_players as (
    -- Get ALL users who played today
    select 
      g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where (g.created_at at time zone 'utc')::date = today_date
    group by g.user_id
  ),
  with_percentages as (
    select 
      tp.user_id,
      tp.score,
      tp.total_correct,
      tp.total_questions,
      case 
        when tp.total_questions > 0 then (tp.total_correct::numeric / tp.total_questions::numeric) * 100
        else 0
      end as pct
    from today_players tp
  )
  select
    row_number() over (order by pct desc nulls last, score desc nulls last)::bigint as rank,
    wp.user_id,
    coalesce(p.username, 'Anonymous') as username,
    wp.score::bigint,
    wp.total_correct,
    wp.total_questions
  from with_percentages wp
  left join public.profiles p on p.id = wp.user_id  -- LEFT JOIN - includes users without profiles
  order by wp.pct desc nulls last, wp.score desc nulls last
  limit coalesce(nullif(limit_rows, 0), 999999);
end;
$$;

comment on function public.get_daily_leaderboard(int) is 'Returns ALL users who played today. Uses LEFT JOIN to include users without profiles. No effective limit.';

-- Step 3: Verify it works
do $$
declare
  total_users integer;
  function_returns integer;
begin
  -- Count total users who played today
  select count(distinct user_id) into total_users
  from public.games
  where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date;
  
  -- Count what function returns
  select count(*) into function_returns
  from public.get_daily_leaderboard(999999);
  
  -- Report results
  raise notice 'Total users who played today: %', total_users;
  raise notice 'Function returns: %', function_returns;
  
  if total_users = function_returns then
    raise notice 'SUCCESS: Function returns all players!';
  else
    raise warning 'MISMATCH: Function missing % players', (total_users - function_returns);
  end if;
end $$;
