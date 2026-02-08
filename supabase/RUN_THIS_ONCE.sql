-- =============================================================================
-- COPY ALL OF THIS FILE (from this line to the end) INTO SUPABASE SQL EDITOR.
-- File name must be: supabase/RUN_THIS_ONCE.sql  (NOT DEPLOY.md)
-- In Cursor: click this file in the left sidebar, then Cmd+A, Cmd+C.
-- In Supabase: SQL Editor → New query → paste → Run.
-- =============================================================================

-- 1) Tables: profiles, games, stats
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'User profiles. id is the stable identity (auth user id); username is display-only. Games, stats, and friend_requests reference profiles(id), so changing username does not affect friends or stats.';
create unique index if not exists profiles_username_key on public.profiles (username) where username is not null;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  questions_answered integer not null default 0,
  correct_answers integer not null default 0,
  correct_draft boolean default false,
  correct_college boolean default false,
  correct_career_path boolean default false,
  created_at timestamptz not null default now()
);
create index if not exists games_user_id_idx on public.games (user_id);
create index if not exists games_created_at_idx on public.games (created_at desc);

create table if not exists public.stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_games integer not null default 0,
  total_questions integer not null default 0,
  total_correct integer not null default 0,
  best_score integer not null default 0,
  last_played date,
  updated_at timestamptz not null default now()
);

-- 2) RLS (drop all policies first in one block so re-run never fails)
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.stats enable row level security;

do $$ begin
  execute 'drop policy if exists "Users can view own profile" on public.profiles';
  execute 'drop policy if exists "Users can update own profile" on public.profiles';
  execute 'drop policy if exists "Users can insert own profile" on public.profiles';
  execute 'drop policy if exists "Users can view own games" on public.games';
  execute 'drop policy if exists "Users can insert own games" on public.games';
  execute 'drop policy if exists "Users can view own stats" on public.stats';
  execute 'drop policy if exists "Users can insert own stats" on public.stats';
  execute 'drop policy if exists "Users can update own stats" on public.stats';
end $$;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can view own games" on public.games for select using (auth.uid() = user_id);
create policy "Users can insert own games" on public.games for insert with check (auth.uid() = user_id);
create policy "Users can view own stats" on public.stats for select using (auth.uid() = user_id);
create policy "Users can insert own stats" on public.stats for insert with check (auth.uid() = user_id);
create policy "Users can update own stats" on public.stats for update using (auth.uid() = user_id);

-- 3) Trigger: create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name'))
  on conflict (id) do update set username = coalesce(excluded.username, profiles.username), updated_at = now();
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 4) Trigger: update stats when a game is saved
create or replace function public.update_stats_on_game()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.stats (user_id, total_games, total_questions, total_correct, best_score, updated_at, last_played)
  values (new.user_id, 1, new.questions_answered, new.correct_answers, new.score, now(), (new.created_at at time zone 'utc')::date)
  on conflict (user_id) do update set
    total_games = stats.total_games + 1,
    total_questions = stats.total_questions + new.questions_answered,
    total_correct = stats.total_correct + new.correct_answers,
    best_score = greatest(stats.best_score, new.score),
    updated_at = now(),
    last_played = (new.created_at at time zone 'utc')::date;
  return new;
end; $$;
drop trigger if exists on_game_created on public.games;
create trigger on_game_created after insert on public.games for each row execute function public.update_stats_on_game();

-- 5) Leaderboards (score = best score in period; total_correct/total_questions for % correct)
-- Drop first so return type can change if we already ran an older version
drop function if exists public.get_daily_leaderboard(integer);
drop function if exists public.get_monthly_leaderboard(integer);
drop function if exists public.get_all_time_leaderboard(integer);
drop function if exists public.get_draft_correct_pct_today();
drop function if exists public.get_college_correct_pct_today();
drop function if exists public.get_career_path_correct_pct_today();

-- Daily: PST "today", LEFT JOIN profiles so everyone who played today is shown (including users without profile).
create or replace function public.get_daily_leaderboard(limit_rows int default 999999)
returns table (rank bigint, user_id uuid, username text, score bigint, total_correct bigint, total_questions bigint) language sql security definer set search_path = public stable as $$
  with daily_agg as (
    select g.user_id, max(g.score) as score, sum(g.correct_answers)::bigint as total_correct, sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where (g.created_at at time zone 'America/Los_Angeles')::date = (current_timestamp at time zone 'America/Los_Angeles')::date
    group by g.user_id
  ),
  ordered as (select d.user_id, d.score, d.total_correct, d.total_questions, (d.total_correct::numeric / nullif(d.total_questions, 0)) as pct from daily_agg d)
  select row_number() over (order by o.pct desc nulls last, o.score desc nulls last)::bigint as rank, o.user_id, coalesce(p.username, 'Anonymous') as username, o.score::bigint, o.total_correct, o.total_questions
  from ordered o left join public.profiles p on p.id = o.user_id order by o.pct desc nulls last, o.score desc nulls last limit coalesce(nullif(limit_rows, 0), 999999);
$$;

create or replace function public.get_monthly_leaderboard(limit_rows int default 50)
returns table (rank bigint, username text, score bigint, total_correct bigint, total_questions bigint) language sql security definer set search_path = public stable as $$
  with monthly_agg as (
    select g.user_id,
      max(g.score) as score,
      sum(g.correct_answers)::bigint as total_correct,
      sum(g.questions_answered)::bigint as total_questions
    from public.games g
    where g.created_at >= date_trunc('month', (current_timestamp at time zone 'utc'))
    group by g.user_id
  )
  select row_number() over (order by m.score desc nulls last) as rank, coalesce(p.username, 'Anonymous') as username, m.score::bigint, m.total_correct, m.total_questions
  from monthly_agg m join public.profiles p on p.id = m.user_id order by m.score desc limit limit_rows;
$$;

-- Career: order by career % (top to lowest), then total_correct. Return user_id for profile links.
create or replace function public.get_all_time_leaderboard(limit_rows int default 500)
returns table (rank bigint, user_id uuid, username text, total_correct bigint, total_questions bigint) language sql security definer set search_path = public stable as $$
  with pct_ordered as (select s.user_id, s.total_correct, s.total_questions, (s.total_correct::numeric / nullif(s.total_questions, 0)) as pct from public.stats s)
  select row_number() over (order by o.pct desc nulls last, o.total_correct desc nulls last)::bigint as rank, o.user_id, coalesce(p.username, 'Anonymous') as username, o.total_correct::bigint, o.total_questions::bigint
  from pct_ordered o left join public.profiles p on p.id = o.user_id order by o.pct desc nulls last, o.total_correct desc nulls last limit coalesce(nullif(limit_rows, 0), 500);
$$;

-- % of today's games where each question type was answered correctly (shown after each question).
-- Returns total games today and correct count so the frontend can include the current player's answer
-- (game is only saved when all 3 questions are done, so current game isn't in DB yet).
create or replace function public.get_draft_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_draft from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_draft)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

create or replace function public.get_college_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_college from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_college)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;

create or replace function public.get_career_path_correct_pct_today()
returns table (pct numeric, total bigint, correct bigint) language sql security definer set search_path = public stable as $$
  with today_games as (
    select id, correct_career_path from public.games
    where (created_at at time zone 'utc')::date = (current_timestamp at time zone 'utc')::date
  ),
  agg as (
    select count(*)::bigint as total, count(*) filter (where correct_career_path)::bigint as correct from today_games
  )
  select coalesce(round(100.0 * agg.correct / nullif(agg.total, 0), 0), 0)::numeric as pct, coalesce(agg.total, 0) as total, coalesce(agg.correct, 0) as correct from agg;
$$;
