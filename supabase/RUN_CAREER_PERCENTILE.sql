-- Run this in Supabase → SQL Editor to enable "Top X% player" on profiles.
-- Ball Knower tier uses career percentile vs other players (0-100, 100 = best).

create or replace function public.get_user_career_percentile(target_user_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_pct numeric;
  count_below bigint;
  total bigint;
  pct_rank numeric;
begin
  select (s.total_correct::numeric / nullif(s.total_questions, 0)) * 100
  into user_pct
  from public.stats s
  where s.user_id = target_user_id and s.total_questions > 0;

  if user_pct is null then
    return null;
  end if;

  select count(*) into total
  from public.stats s
  where s.total_questions > 0;

  if total is null or total = 0 then
    return null;
  end if;

  select count(*) into count_below
  from public.stats s
  where s.total_questions > 0
    and (s.total_correct::numeric / nullif(s.total_questions, 0)) * 100 < user_pct;

  pct_rank := (count_below::numeric / total::numeric) * 100;
  return round(pct_rank, 1);
end;
$$;

comment on function public.get_user_career_percentile(uuid) is 'Returns career % percentile (0-100) among all players; 100 = best. Used for Top X% player on profile.';

grant execute on function public.get_user_career_percentile(uuid) to authenticated;
grant execute on function public.get_user_career_percentile(uuid) to anon;
