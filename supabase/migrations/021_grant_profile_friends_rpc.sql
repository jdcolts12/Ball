-- Allow authenticated and anon to call profile/friends RPCs (needed for profile pages)
grant execute on function public.get_user_public_profile(uuid) to authenticated;
grant execute on function public.get_user_public_profile(uuid) to anon;

grant execute on function public.get_my_friend_ids() to authenticated;

grant execute on function public.send_friend_request(uuid) to authenticated;

grant execute on function public.accept_friend_request(uuid) to authenticated;

grant execute on function public.get_friendship_status(uuid) to authenticated;
grant execute on function public.get_friendship_status(uuid) to anon;
