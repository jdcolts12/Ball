-- Run in Supabase → SQL Editor to fix "to_user_id is ambiguous" in Add Friend
create or replace function public.send_friend_request(to_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  from_id uuid := auth.uid();
  existing record;
begin
  if from_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if send_friend_request.to_user_id = from_id then
    return jsonb_build_object('ok', false, 'error', 'cannot_friend_self');
  end if;
  select fr.* into existing from public.friend_requests fr
  where (fr.from_user_id = from_id and fr.to_user_id = send_friend_request.to_user_id)
     or (fr.from_user_id = send_friend_request.to_user_id and fr.to_user_id = from_id);
  if existing.id is not null then
    if existing.status = 'accepted' then
      return jsonb_build_object('ok', false, 'error', 'already_friends');
    end if;
    if existing.status = 'pending' and existing.to_user_id = from_id then
      update public.friend_requests set status = 'accepted', updated_at = now()
      where id = existing.id;
      return jsonb_build_object('ok', true, 'accepted', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'request_pending');
  end if;
  insert into public.friend_requests (from_user_id, to_user_id, status)
  values (from_id, send_friend_request.to_user_id, 'pending');
  return jsonb_build_object('ok', true);
end;
$$;
