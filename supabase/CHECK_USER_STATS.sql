-- Diagnostic query to check YOUR stats vs your actual games
-- This uses your current logged-in session, so no user ID needed!

-- Check actual games vs stats for current user
with user_games as (
  select 
    user_id,
    count(*) as game_count,
    sum(questions_answered) as total_questions_from_games,
    sum(correct_answers) as total_correct_from_games,
    sum(score) as total_score_from_games,
    min(created_at) as first_game,
    max(created_at) as last_game
  from public.games
  where user_id = auth.uid()  -- Uses your current session
  group by user_id
),
user_stats as (
  select 
    user_id,
    total_games,
    total_questions,
    total_correct,
    best_score,
    last_played
  from public.stats
  where user_id = auth.uid()  -- Uses your current session
)
select 
  'Games Table' as source,
  ug.game_count as games,
  ug.total_questions_from_games as total_questions,
  ug.total_correct_from_games as total_correct,
  round((ug.total_correct_from_games::numeric / nullif(ug.total_questions_from_games, 0)) * 100, 1) as pct_correct,
  ug.total_score_from_games as total_score
from user_games ug
union all
select 
  'Stats Table' as source,
  us.total_games as games,
  us.total_questions as total_questions,
  us.total_correct as total_correct,
  round((us.total_correct::numeric / nullif(us.total_questions, 0)) * 100, 1) as pct_correct,
  null as total_score
from user_stats us;

-- Show your individual games to see question counts
select 
  id,
  created_at,
  score,
  questions_answered,
  correct_answers,
  round((correct_answers::numeric / nullif(questions_answered, 0)) * 100, 1) as game_pct
from public.games
where user_id = auth.uid()  -- Uses your current session
order by created_at desc;
