-- Run in Supabase → SQL Editor. Career tab: order from top % to lowest % (best to worst).
-- Also returns user_id so profile links work.

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
  left join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.total_correct desc nulls last
  limit coalesce(nullif(limit_rows, 0), 500);
$$;

comment on function public.get_all_time_leaderboard(int) is 'Career leaderboard: ordered by career % (top to lowest), then total_correct.';

grant execute on function public.get_all_time_leaderboard(integer) to authenticated;
grant execute on function public.get_all_time_leaderboard(integer) to anon;
