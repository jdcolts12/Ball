-- Add columns to store user's actual answers for each question
-- This allows us to show "Your answer" vs "Correct answer" in the breakdown

alter table public.games
  add column if not exists user_answer_draft text,
  add column if not exists user_answer_college text,
  add column if not exists user_answer_career_path text,
  add column if not exists user_answer_season_leader text;

comment on column public.games.user_answer_draft is 'The player name the user selected for the draft question.';
comment on column public.games.user_answer_college is 'The college name the user selected for the college question.';
comment on column public.games.user_answer_career_path is 'The player name the user guessed for the career path question.';
comment on column public.games.user_answer_season_leader is 'The player name the user selected for the season leader question.';
