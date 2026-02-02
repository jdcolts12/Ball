-- Add per-question breakdown to games for badges (draft, college, career path)
alter table public.games
  add column if not exists correct_draft boolean default false,
  add column if not exists correct_college boolean default false,
  add column if not exists correct_career_path boolean default false;

comment on column public.games.correct_draft is 'User got the draft (top 10) question right this game.';
comment on column public.games.correct_college is 'User got the college question right this game.';
comment on column public.games.correct_career_path is 'User got the career path question right this game.';
