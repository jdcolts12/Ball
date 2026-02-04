-- Leaderboard RPCs: daily, monthly, all-time (security definer so anyone can call)
-- Returns: rank, username, score (daily/monthly = game score; all-time = total_correct)

create or replace function public.get_daily_leaderboard(limit_rows int default 50)
returns table (rank bigint, username text, score bigint)
language sql
security definer
set search_path = public
stable
as $$
  with daily_scores as (
    select g.user_id, max(g.score) as score
    from public.games g
    where (g.created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
    group by g.user_id
  )
  select
    row_number() over (order by d.score desc nulls last) as rank,
    coalesce(p.username, 'Anonymous') as username,
    d.score::bigint
  from daily_scores d
  join public.profiles p on p.id = d.user_id
  order by d.score desc
  limit limit_rows;
$$;

create or replace function public.get_monthly_leaderboard(limit_rows int default 50)
returns table (rank bigint, username text, score bigint)
language sql
security definer
set search_path = public
stable
as $$
  with monthly_scores as (
    select g.user_id, max(g.score) as score
    from public.games g
    where g.created_at >= date_trunc('month', (current_timestamp at time zone 'utc'))
    group by g.user_id
  )
  select
    row_number() over (order by m.score desc nulls last) as rank,
    coalesce(p.username, 'Anonymous') as username,
    m.score::bigint
  from monthly_scores m
  join public.profiles p on p.id = m.user_id
  order by m.score desc
  limit limit_rows;
$$;

create or replace function public.get_all_time_leaderboard(limit_rows int default 50)
returns table (rank bigint, username text, total_correct bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    row_number() over (order by s.total_correct desc nulls last) as rank,
    coalesce(p.username, 'Anonymous') as username,
    s.total_correct::bigint
  from public.stats s
  join public.profiles p on p.id = s.user_id
  order by s.total_correct desc
  limit limit_rows;
$$;
