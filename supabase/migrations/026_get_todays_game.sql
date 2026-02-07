-- RPC: return the current user's most recent game from "today" (PST).
-- Uses the same "today" definition as get_daily_leaderboard so stats and leaderboard stay in sync.

create or replace function public.get_todays_game()
returns setof public.games
language sql
security definer
set search_path = public
stable
as $$
  select g.*
  from public.games g
  where g.user_id = auth.uid()
    and (g.created_at at time zone 'America/Los_Angeles')::date
      = (current_timestamp at time zone 'America/Los_Angeles')::date
  order by g.created_at desc
  limit 1;
$$;

comment on function public.get_todays_game() is 'Returns the current user''s most recent game from today (PST). Used for Today''s Stats screen.';
