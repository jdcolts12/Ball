-- Migration: Add function to check username availability
-- This allows checking if a username is taken without requiring authentication

create or replace function public.check_username_available(
  check_username text,
  exclude_user_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  username_exists boolean;
begin
  -- Check if username exists (excluding specified user if provided)
  select exists(
    select 1
    from public.profiles
    where username = check_username
      and (exclude_user_id is null or id != exclude_user_id)
  ) into username_exists;
  
  -- Return true if username is available (doesn't exist)
  return not username_exists;
end;
$$;

comment on function public.check_username_available is 'Check if a username is available. Returns true if available, false if taken. Can be called without authentication.';
