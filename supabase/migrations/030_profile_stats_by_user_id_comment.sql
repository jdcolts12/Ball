-- Document that profile stats and streaks are keyed by user_id (identity).
-- Changing username only updates profiles.username; games, stats, and streaks stay linked to the same user.
comment on function public.get_user_public_profile(uuid) is 'Returns public profile and stats for a user. Stats and streaks are computed by target_user_id (identity); changing username does not affect them.';
