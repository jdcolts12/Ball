-- Profiles: add avatar_url for profile picture
alter table public.profiles
  add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is 'URL of user profile picture (e.g. Supabase Storage).';

-- Allow anyone to read profiles (for profile pages and leaderboard)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Anyone can view all profiles"
  on public.profiles for select
  using (true);

-- Friend requests: from_user sends request to to_user
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

comment on table public.friend_requests is 'Friend requests; status accepted = friends.';

alter table public.friend_requests enable row level security;

-- Users can create friend requests (send)
create policy "Users can send friend requests"
  on public.friend_requests for insert
  with check (auth.uid() = from_user_id);

-- Users can see requests they sent or received
create policy "Users can view own friend requests"
  on public.friend_requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Recipient can update (accept/decline)
create policy "Recipient can update friend request"
  on public.friend_requests for update
  using (auth.uid() = to_user_id);

-- No delete policy needed for now; we use status instead
