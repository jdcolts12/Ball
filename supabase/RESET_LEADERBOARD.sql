-- =============================================================================
-- RESET LEADERBOARD - Clears all game data and stats
-- WARNING: This will delete ALL games and stats for ALL users!
-- =============================================================================
-- 
-- To use:
-- 1. Go to Supabase → SQL Editor → New query
-- 2. Copy and paste this entire file
-- 3. Click Run
-- 
-- This will:
-- - Delete all games
-- - Reset all stats (total_games, total_questions, total_correct, best_score, last_played)
-- - Keep user profiles (usernames) intact
-- =============================================================================

-- Delete all games
DELETE FROM public.games;

-- Reset all stats
UPDATE public.stats
SET 
  total_games = 0,
  total_questions = 0,
  total_correct = 0,
  best_score = 0,
  last_played = NULL,
  updated_at = NOW();

-- Verify (optional - shows count of remaining games)
-- SELECT COUNT(*) as remaining_games FROM public.games;
-- SELECT COUNT(*) as users_with_stats FROM public.stats WHERE total_games > 0;
