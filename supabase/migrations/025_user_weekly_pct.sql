-- Weekly stats for any user (Sunday–Saturday PST). For profile weekly badge on every player.
create or replace function public.get_user_weekly_pct(target_user_id uuid)
returns table (correct bigint, total bigint, pct numeric)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  week_start_date date;
  week_end_date date;
  week_start_ts timestamptz;
  week_end_ts timestamptz;
  sum_correct bigint;
  sum_total bigint;
  calc_pct numeric;
begin
  -- Current week in LA: Sunday (DOW 0) through Saturday (DOW 6)
  week_start_date := (current_timestamp at time zone 'America/Los_Angeles')::date
    - (EXTRACT(DOW FROM (current_timestamp at time zone 'America/Los_Angeles'))::integer);
  week_end_date := week_start_date + 6;

  week_start_ts := (week_start_date::text || ' 00:00:00')::timestamp at time zone 'America/Los_Angeles';
  week_end_ts := (week_end_date::text || ' 23:59:59.999')::timestamp at time zone 'America/Los_Angeles';

  select coalesce(sum(g.correct_answers), 0), coalesce(sum(g.questions_answered), 0)
  into sum_correct, sum_total
  from public.games g
  where g.user_id = target_user_id
    and g.created_at >= week_start_ts
    and g.created_at <= week_end_ts;

  calc_pct := case when sum_total > 0 then round((sum_correct::numeric / sum_total::numeric) * 100, 1) else 0 end;

  correct := sum_correct;
  total := sum_total;
  pct := calc_pct;
  return next;
end;
$$;

comment on function public.get_user_weekly_pct(uuid) is 'Returns correct, total, pct for target user for current PST week (Sun–Sat). For weekly badge on every profile.';

grant execute on function public.get_user_weekly_pct(uuid) to authenticated;
grant execute on function public.get_user_weekly_pct(uuid) to anon;
