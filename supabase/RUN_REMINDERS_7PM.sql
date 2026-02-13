-- Run this in Supabase SQL Editor to set reminder emails at 7:00 PM PST.
-- Prerequisites: pg_cron and pg_net extensions, send_streak_reminders() function,
-- and Edge Function send-streak-reminders deployed with RESEND_API_KEY and APP_URL.

-- Unschedule the old job if it exists (e.g. was 5 PM UTC)
SELECT cron.unschedule('send-daily-reminders');

-- Schedule at 7 PM PST = 3:00 AM UTC (same calendar day in Pacific)
SELECT cron.schedule(
  'send-daily-reminders',
  '0 3 * * *',
  $$SELECT public.send_streak_reminders();$$
);

-- Verify
SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = 'send-daily-reminders';
