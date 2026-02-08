-- Document that profiles.id is the stable identity; username is display-only.
-- Friends (friend_requests) and stats (games, stats) reference profiles(id),
-- so changing username does not affect friends or stats.
comment on table public.profiles is 'User profiles. id is the stable identity (auth user id); username is display-only. Games, stats, and friend_requests reference profiles(id), so changing username does not affect friends or stats.';
