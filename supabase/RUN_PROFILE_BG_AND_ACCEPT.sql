-- Run in Supabase → SQL Editor (required for profile background color to save and Accept friend request to work)
-- 1) Add profile background color column
-- 2) Update get_user_public_profile to return profile_bg_color
-- 3) Fix accept_friend_request (table alias so it works)

alter table public.profiles
  add column if not exists profile_bg_color text default 'green';

drop function if exists public.get_user_public_profile(uuid);

create or replace function public.get_user_public_profile(target_user_id uuid)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  profile_bg_color text,
  career_pct numeric,
  total_correct bigint,
  total_questions bigint,
  total_games bigint,
  total_perfect_games bigint,
  consecutive_days_played bigint,
  best_perfect_streak bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with profile_row as (
    select p.id, p.username, p.avatar_url, coalesce(p.profile_bg_color, 'green') as profile_bg_color
    from public.profiles p
    where p.id = target_user_id
  ),
  stats_row as (
    select s.total_correct, s.total_questions, s.total_games,
      (s.total_correct::numeric / nullif(s.total_questions, 0) * 100) as career_pct
    from public.stats s
    where s.user_id = target_user_id
  ),
  game_dates as (
    select distinct (g.created_at at time zone 'America/Los_Angeles')::date as played_date
    from public.games g
    where g.user_id = target_user_id
  ),
  dated_grp as (
    select played_date,
      played_date + row_number() over (order by played_date desc)::int as grp
    from game_dates
  ),
  consecutive as (
    select count(*)::bigint as days
    from dated_grp
    group by grp
    order by min(played_date) desc
    limit 1
  ),
  perfect_days as (
    select distinct (g.created_at at time zone 'America/Los_Angeles')::date as d
    from public.games g
    where g.user_id = target_user_id
      and g.correct_answers = g.questions_answered
      and g.questions_answered >= 4
  ),
  streak_grp as (
    select d, d + row_number() over (order by d desc)::int as grp
    from perfect_days
  ),
  streak_calc as (
    select count(*)::bigint as streak
    from streak_grp
    group by grp
    order by min(d) desc
    limit 1
  ),
  total_perfect as (
    select count(*)::bigint as cnt
    from public.games g
    where g.user_id = target_user_id
      and g.correct_answers = g.questions_answered
      and g.questions_answered >= 4
  )
  select
    pr.id as user_id,
    pr.username,
    pr.avatar_url,
    pr.profile_bg_color,
    coalesce(round(sr.career_pct, 0), 0)::numeric as career_pct,
    coalesce(sr.total_correct, 0)::bigint as total_correct,
    coalesce(sr.total_questions, 0)::bigint as total_questions,
    coalesce(sr.total_games, 0)::bigint as total_games,
    coalesce(tp.cnt, 0)::bigint as total_perfect_games,
    coalesce(c.days, 0)::bigint as consecutive_days_played,
    coalesce(sc.streak, 0)::bigint as best_perfect_streak
  from profile_row pr
  cross join lateral (select 1) _
  left join stats_row sr on true
  left join consecutive c on true
  left join streak_calc sc on true
  left join total_perfect tp on true;
$$;

-- Fix accept_friend_request: use table alias so from_user_id is not ambiguous
create or replace function public.accept_friend_request(from_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  update public.friend_requests fr
  set status = 'accepted', updated_at = now()
  where fr.to_user_id = auth.uid()
    and fr.from_user_id = accept_friend_request.from_user_id
    and fr.status = 'pending';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'request_not_found');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;
