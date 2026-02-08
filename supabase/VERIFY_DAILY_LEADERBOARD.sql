-- Run in Supabase SQL Editor to verify daily leaderboard shows everyone.
-- Compare: (1) raw count of users who played today PST vs (2) rows returned by the function.

with today_pst as (
  select
    ((current_timestamp at time zone 'America/Los_Angeles')::date)::timestamp at time zone 'America/Los_Angeles' as start_utc,
    ((current_timestamp at time zone 'America/Los_Angeles')::date + interval '1 day')::timestamp at time zone 'America/Los_Angeles' as end_utc
)
select
  (select count(distinct g.user_id) from public.games g cross join today_pst t where g.created_at >= t.start_utc and g.created_at < t.end_utc) as users_who_played_today_pst,
  (select count(*)::bigint from public.get_daily_leaderboard(999999)) as function_returns;
