-- Profile background color (for profile page theme)
alter table public.profiles
  add column if not exists profile_bg_color text default 'green';

comment on column public.profiles.profile_bg_color is 'Profile page background: blue, green, yellow, red, black, purple, orange, pink.';
