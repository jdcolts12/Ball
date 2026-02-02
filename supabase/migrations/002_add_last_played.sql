-- Add last_played to stats (date when user last completed a game)
alter table public.stats
  add column if not exists last_played date;

comment on column public.stats.last_played is 'Date the user last completed a game (YYYY-MM-DD).';

-- Update trigger to set last_played when a game is inserted
create or replace function public.update_stats_on_game()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.stats (user_id, total_games, total_questions, total_correct, best_score, updated_at, last_played)
  values (
    new.user_id,
    1,
    new.questions_answered,
    new.correct_answers,
    new.score,
    now(),
    (new.created_at at time zone 'utc')::date
  )
  on conflict (user_id) do update set
    total_games = stats.total_games + 1,
    total_questions = stats.total_questions + new.questions_answered,
    total_correct = stats.total_correct + new.correct_answers,
    best_score = greatest(stats.best_score, new.score),
    updated_at = now(),
    last_played = (new.created_at at time zone 'utc')::date;
  return new;
end;
$$;
