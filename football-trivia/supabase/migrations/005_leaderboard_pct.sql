-- Add total_questions to all-time leaderboard for % correct
create or replace function public.get_all_time_leaderboard(limit_rows int default 50)
returns table (rank bigint, username text, total_correct bigint, total_questions bigint) language sql security definer set search_path = public stable as $$
  select row_number() over (order by s.total_correct desc nulls last) as rank, coalesce(p.username, 'Anonymous') as username, s.total_correct::bigint, s.total_questions::bigint
  from public.stats s join public.profiles p on p.id = s.user_id order by s.total_correct desc limit limit_rows;
$$;
