-- Paste this entire file into Supabase → SQL Editor → Run.
-- Fixes daily leaderboard not showing everyone who played today.
-- 1) Supabase API returns max 1000 rows per request → we paginate with offset_rows.
-- 2) PST "today", LEFT JOIN profiles so everyone who played is included.

drop function if exists public.get_daily_leaderboard(integer);
drop function if exists public.get_daily_leaderboard(integer, integer);
drop function if exists public.get_daily_leaderboard(bigint);

create or replace function public.get_daily_leaderboard(limit_rows int default 999999, offset_rows int default 0)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint)
language sql
security definer
set search_path = public
stable
as $$
  with
  today_pst as (
    select
      ((current_timestamp at time zone 'America/Los_Angeles')::date)::timestamp at time zone 'America/Los_Angeles' as start_utc,
      ((current_timestamp at time zone 'America/Los_Angeles')::date + interval '1 day')::timestamp at time zone 'America/Los_Angeles' as end_utc
  ),
  daily_agg as (
    select g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    cross join today_pst t
    where g.created_at >= t.start_utc and g.created_at < t.end_utc
    group by g.user_id
  ),
  ordered as (
    select d.user_id, d.score, d.total_correct, d.total_questions,
      (d.total_correct::numeric / nullif(d.total_questions, 0)) as pct
    from daily_agg d
  )
  select
    row_number() over (order by o.pct desc nulls last, o.score desc nulls last)::bigint as rank,
    o.user_id,
    coalesce(p.username, 'Anonymous') as username,
    o.score::bigint,
    o.total_correct,
    o.total_questions
  from ordered o
  left join public.profiles p on p.id = o.user_id
  order by o.pct desc nulls last, o.score desc nulls last
  limit coalesce(nullif(limit_rows, 0), 999999)
  offset greatest(0, coalesce(offset_rows, 0));
$$;

comment on function public.get_daily_leaderboard(int, int) is 'Daily leaderboard (PST). Use offset_rows to paginate (API max 1000 rows/request).';

grant execute on function public.get_daily_leaderboard(integer, integer) to authenticated;
grant execute on function public.get_daily_leaderboard(integer, integer) to anon;
