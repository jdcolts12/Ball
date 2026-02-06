-- Paste this entire file into Supabase Dashboard → SQL Editor → Run

-- Add user_id to all-time leaderboard so we can link to profiles
-- Must drop first because return type (OUT parameters) is changing
drop function if exists public.get_all_time_leaderboard(integer);

create or replace function public.get_all_time_leaderboard(limit_rows int default 500)
returns table (rank bigint, user_id uuid, username text, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with pct_ordered as (
    select s.user_id, s.total_correct, s.total_questions,
      (s.total_correct::numeric / nullif(s.total_questions, 0)) as pct
    from public.stats s
  )
  select
    row_number() over (order by o.pct desc nulls last, o.total_correct desc nulls last)::bigint as rank,
    o.user_id,
    coalesce(p.username, 'Anonymous') as username,
    o.total_correct::bigint,
    o.total_questions::bigint
  from pct_ordered o
  join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.total_correct desc nulls last
  limit least(coalesce(nullif(limit_rows, 0), 500), 1000);
$$;

comment on function public.get_all_time_leaderboard(int) is 'Returns all-time leaderboard with user_id; ordered by % correct (best to worst).';
