-- Migration: Set up cron job for daily email reminders
-- This runs daily at 7 PM PST (03:00 UTC) to send reminders to ALL users who haven't played today (PST)

-- Enable pg_cron extension (if not already enabled)
create extension if not exists pg_cron;

-- Enable pg_net extension for HTTP requests (if not already enabled)
create extension if not exists pg_net;

-- Create a function that calls the Edge Function to send daily reminders
create or replace function public.send_streak_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  edge_function_url text;
  service_role_key text;
  request_id bigint;
begin
  -- Get your Supabase project URL and service_role key (for internal calls)
  -- Replace these with your actual values
  edge_function_url := 'https://yhxtyjfmpulmqoljbgmv.supabase.co/functions/v1/send-streak-reminders';
  -- Use service_role key for internal cron job calls (more secure than anon key)
  service_role_key := 'YOUR_SERVICE_ROLE_KEY'; -- Get from Supabase → Settings → API → service_role key
  
  -- Call the Edge Function via HTTP using pg_net
  -- Using service_role key allows the function to access all data without RLS restrictions
  select net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json',
      'apikey', service_role_key
    ),
    body := '{}'::jsonb
  ) into request_id;
  
  -- Log the request ID (optional)
  raise notice 'Reminder email request sent. Request ID: %', request_id;
end;
$$;

-- Schedule the cron job to run daily at 7 PM PST (03:00 UTC next day)
-- Cron syntax: minute hour day month weekday. 0 3 * * * = 3:00 AM UTC = 7:00 PM PST (same calendar day in Pacific)
select cron.schedule(
  'send-daily-reminders',
  '0 3 * * *', -- 3 AM UTC = 7 PM PST daily
  $$SELECT public.send_streak_reminders();$$
);

comment on function public.send_streak_reminders is 'Calls the Edge Function to send reminder emails to all users who haven''t played today (PST) by 7 PM Pacific.';

-- To manually test, run:
-- SELECT public.send_streak_reminders();

-- To unschedule:
-- SELECT cron.unschedule('send-daily-reminders');
