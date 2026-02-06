-- Run this entire file in Supabase Dashboard → SQL Editor → New query → Run
-- Fixes: profiles, friend requests, profile RPCs, leaderboard user_id, and grants

-- ========== 018: profiles avatar_url + friend_requests ==========
alter table public.profiles
  add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is 'URL of user profile picture (e.g. Supabase Storage).';

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Anyone can view all profiles" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);
create policy "Anyone can view all profiles"
  on public.profiles for select
  using (true);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(from_user_id, to_user_id)
);

create index if not exists friend_requests_from_user_id_idx on public.friend_requests (from_user_id);
create index if not exists friend_requests_to_user_id_idx on public.friend_requests (to_user_id);
create index if not exists friend_requests_status_idx on public.friend_requests (status);

alter table public.friend_requests enable row level security;

drop policy if exists "Users can send friend requests" on public.friend_requests;
create policy "Users can send friend requests"
  on public.friend_requests for insert
  with check (auth.uid() = from_user_id);

drop policy if exists "Users can view own friend requests" on public.friend_requests;
create policy "Users can view own friend requests"
  on public.friend_requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists "Recipient can update friend request" on public.friend_requests;
create policy "Recipient can update friend request"
  on public.friend_requests for update
  using (auth.uid() = to_user_id);

-- ========== 019: profile + friends RPCs ==========
drop function if exists public.get_user_public_profile(uuid);

create or replace function public.get_user_public_profile(target_user_id uuid)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  career_pct numeric,
  total_correct bigint,
  total_questions bigint,
  total_games bigint,
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
    coalesce(sr.total_games, 0)::bigint as total_games,
    coalesce(c.days, 0)::bigint as consecutive_days_played,
    coalesce(sc.streak, 0)::bigint as best_perfect_streak
  from profile_row pr
  cross join lateral (select 1) _
  left join stats_row sr on true
  left join consecutive c on true
  left join streak_calc sc on true;
$$;

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
  if send_friend_request.to_user_id = from_id then
    return jsonb_build_object('ok', false, 'error', 'cannot_friend_self');
  end if;
  select fr.* into existing from public.friend_requests fr
  where (fr.from_user_id = from_id and fr.to_user_id = send_friend_request.to_user_id)
     or (fr.from_user_id = send_friend_request.to_user_id and fr.to_user_id = from_id);
  if existing.id is not null then
    if existing.status = 'accepted' then
      return jsonb_build_object('ok', false, 'error', 'already_friends');
    end if;
    if existing.status = 'pending' and existing.to_user_id = from_id then
      update public.friend_requests set status = 'accepted', updated_at = now()
      where id = existing.id;
      return jsonb_build_object('ok', true, 'accepted', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'request_pending');
  end if;
  insert into public.friend_requests (from_user_id, to_user_id, status)
  values (from_id, send_friend_request.to_user_id, 'pending');
  return jsonb_build_object('ok', true);
end;
$$;

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

-- ========== 020: all-time leaderboard with user_id ==========
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

-- ========== 021: grants so app can call RPCs ==========
grant execute on function public.get_user_public_profile(uuid) to authenticated;
grant execute on function public.get_user_public_profile(uuid) to anon;

grant execute on function public.get_my_friend_ids() to authenticated;

grant execute on function public.send_friend_request(uuid) to authenticated;

grant execute on function public.accept_friend_request(uuid) to authenticated;

grant execute on function public.get_friendship_status(uuid) to authenticated;
grant execute on function public.get_friendship_status(uuid) to anon;
