-- Get public profile for a user (username, avatar_url) + computed stats
-- Stats: consecutive_days_played (resets if miss a day), career_pct, best_perfect_streak
create or replace function public.get_user_public_profile(target_user_id uuid)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  career_pct numeric,
  total_correct bigint,
  total_questions bigint,
  consecutive_days_played bigint,
  best_perfect_streak bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with profile_row as (
    select p.id, p.username, p.avatar_url
    from public.profiles p
    where p.id = target_user_id
  ),
  stats_row as (
    select s.total_correct, s.total_questions,
      (s.total_correct::numeric / nullif(s.total_questions, 0) * 100) as career_pct
    from public.stats s
    where s.user_id = target_user_id
  ),
  -- Consecutive days played: distinct dates, then count current streak (most recent consecutive)
  game_dates as (
    select distinct (g.created_at at time zone 'America/Los_Angeles')::date as played_date
    from public.games g
    where g.user_id = target_user_id
  ),
  dated_grp as (
    select played_date,
      played_date - row_number() over (order by played_date desc)::int as grp
    from game_dates
  ),
  consecutive as (
    select count(*)::bigint as days
    from dated_grp
    group by grp
    order by min(played_date) desc
    limit 1
  ),
  -- Best perfect streak: days with 4/4 game, consecutive
  perfect_days as (
    select distinct (g.created_at at time zone 'America/Los_Angeles')::date as d
    from public.games g
    where g.user_id = target_user_id
      and g.correct_answers = g.questions_answered
      and g.questions_answered >= 4
  ),
  streak_grp as (
    select d, d - row_number() over (order by d desc)::int as grp
    from perfect_days
  ),
  streak_calc as (
    select count(*)::bigint as streak
    from streak_grp
    group by grp
    order by min(d) desc
    limit 1
  )
  select
    pr.id as user_id,
    pr.username,
    pr.avatar_url,
    coalesce(round(sr.career_pct, 0), 0)::numeric as career_pct,
    coalesce(sr.total_correct, 0)::bigint as total_correct,
    coalesce(sr.total_questions, 0)::bigint as total_questions,
    coalesce(c.days, 0)::bigint as consecutive_days_played,
    coalesce(sc.streak, 0)::bigint as best_perfect_streak
  from profile_row pr
  cross join lateral (select 1) _
  left join stats_row sr on true
  left join consecutive c on true
  left join streak_calc sc on true;
$$;

comment on function public.get_user_public_profile(uuid) is 'Returns public profile and stats for a user (for profile page).';

-- Get list of friend user_ids for current user (accepted only)
create or replace function public.get_my_friend_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select case when from_user_id = auth.uid() then to_user_id else from_user_id end as friend_id
  from public.friend_requests
  where (from_user_id = auth.uid() or to_user_id = auth.uid())
    and status = 'accepted';
$$;

comment on function public.get_my_friend_ids() is 'Returns user_ids of current user friends.';

-- Send friend request (insert pending)
create or replace function public.send_friend_request(to_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  from_id uuid := auth.uid();
  existing record;
begin
  if from_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if to_user_id = from_id then
    return jsonb_build_object('ok', false, 'error', 'cannot_friend_self');
  end if;
  select * into existing from public.friend_requests
  where (from_user_id = from_id and to_user_id = send_friend_request.to_user_id)
     or (from_user_id = send_friend_request.to_user_id and to_user_id = from_id);
  if existing.id is not null then
    if existing.status = 'accepted' then
      return jsonb_build_object('ok', false, 'error', 'already_friends');
    end if;
    if existing.status = 'pending' and existing.to_user_id = from_id then
      -- They sent us a request; accept it
      update public.friend_requests set status = 'accepted', updated_at = now()
      where id = existing.id;
      return jsonb_build_object('ok', true, 'accepted', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'request_pending');
  end if;
  insert into public.friend_requests (from_user_id, to_user_id, status)
  values (from_id, to_user_id, 'pending');
  return jsonb_build_object('ok', true);
end;
$$;

comment on function public.send_friend_request(uuid) is 'Send friend request; or accept if they already sent one.';

-- Accept friend request
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
  update public.friend_requests
  set status = 'accepted', updated_at = now()
  where to_user_id = auth.uid() and from_user_id = accept_friend_request.from_user_id and status = 'pending';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'request_not_found');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

comment on function public.accept_friend_request(uuid) is 'Accept a pending friend request.';

-- Get friendship status with another user (for profile page: pending_sent, pending_received, friends, none)
create or replace function public.get_friendship_status(other_user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when status = 'accepted' then 'friends'
    when from_user_id = auth.uid() then 'pending_sent'
    else 'pending_received'
  end
  from public.friend_requests
  where (from_user_id = auth.uid() and to_user_id = other_user_id)
     or (from_user_id = other_user_id and to_user_id = auth.uid())
  limit 1;
$$;

comment on function public.get_friendship_status(uuid) is 'Returns friends, pending_sent, pending_received, or null if none.';
