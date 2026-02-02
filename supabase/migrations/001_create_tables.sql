-- Football Trivia: users (profiles), games, and stats
-- Run this in the Supabase SQL Editor or via Supabase CLI

-- =============================================================================
-- PROFILES (extends auth.users; one row per user)
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique username (optional; allow null for anonymous until they set one)
create unique index if not exists profiles_username_key on public.profiles (username) where username is not null;

comment on table public.profiles is 'User profiles linked to auth.users; stores display username.';

-- =============================================================================
-- GAMES (one row per trivia game session)
-- =============================================================================
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  questions_answered integer not null default 0,
  correct_answers integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists games_user_id_idx on public.games (user_id);
create index if not exists games_created_at_idx on public.games (created_at desc);

comment on table public.games is 'One row per trivia game; score and question counts per game.';

-- =============================================================================
-- STATS (one row per user; aggregate stats for fast reads)
-- =============================================================================
create table if not exists public.stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_games integer not null default 0,
  total_questions integer not null default 0,
  total_correct integer not null default 0,
  best_score integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.stats is 'Per-user aggregate stats; update on each game completion.';

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.stats enable row level security;

-- Profiles: users can read/update their own row; insert own row on signup
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Games: users can only access their own games
create policy "Users can view own games"
  on public.games for select
  using (auth.uid() = user_id);

create policy "Users can insert own games"
  on public.games for insert
  with check (auth.uid() = user_id);

-- Stats: users can only access their own stats
create policy "Users can view own stats"
  on public.stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.stats for update
  using (auth.uid() = user_id);

-- =============================================================================
-- HELPER: create profile on first sign-in (call from app or trigger)
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do update set
    username = coalesce(excluded.username, profiles.username),
    updated_at = now();
  return new;
end;
$$;

-- Trigger: auto-create profile when a new auth user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- HELPER: update stats when a game is inserted (optional)
-- =============================================================================
create or replace function public.update_stats_on_game()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.stats (user_id, total_games, total_questions, total_correct, best_score, updated_at)
  values (
    new.user_id,
    1,
    new.questions_answered,
    new.correct_answers,
    new.score,
    now()
  )
  on conflict (user_id) do update set
    total_games = stats.total_games + 1,
    total_questions = stats.total_questions + new.questions_answered,
    total_correct = stats.total_correct + new.correct_answers,
    best_score = greatest(stats.best_score, new.score),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_game_created on public.games;
create trigger on_game_created
  after insert on public.games
  for each row execute function public.update_stats_on_game();
