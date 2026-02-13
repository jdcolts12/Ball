# 7:00 PM Reminder Emails

Reminder emails go to **every player who hasn’t played today (PST)** and run daily at **7:00 PM Pacific**.

## What’s in place

1. **Cron**: Runs at **7 PM PST** (3:00 AM UTC) → `0 3 * * *`.
2. **Edge Function**: `send-streak-reminders` uses **PST for “today”** so it matches the app’s day.
3. **Who gets email**: Users in `stats` whose `last_played` is not today (PST). Streak-specific copy for users with a streak.

## One-time setup

### 1. Resend (email)

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month).
2. Create an API key.
3. In **Supabase** → **Edge Functions** → **send-streak-reminders** → **Secrets**, add:
   - `RESEND_API_KEY` = your Resend API key  
   - `RESEND_FROM_EMAIL` = e.g. `onboarding@resend.dev` or your verified domain  
   - `APP_URL` = your app URL (e.g. `https://your-app.vercel.app`)

### 2. Cron in Supabase

If you already ran the old migration (5 PM UTC), update to 7 PM PST by running in **Supabase** → **SQL Editor**:

```sql
-- File: supabase/RUN_REMINDERS_7PM.sql
SELECT cron.unschedule('send-daily-reminders');
SELECT cron.schedule(
  'send-daily-reminders',
  '0 3 * * *',
  $$SELECT public.send_streak_reminders();$$
);
```

If you haven’t set up cron yet, run the full migration:

- `supabase/migrations/011_email_reminders_cron.sql`  
  (Replace `YOUR_SERVICE_ROLE_KEY` with your Supabase **Settings** → **API** → **service_role** key before running.)

### 3. Deploy Edge Function

```bash
cd football-trivia
supabase functions deploy send-streak-reminders
```

## Test

In Supabase SQL Editor:

```sql
SELECT public.send_streak_reminders();
```

Check Edge Function logs and Resend dashboard to confirm emails.

## Change time

Edit the cron schedule (minute hour day month weekday). Examples:

- 7 PM PST = `0 3 * * *` (3 AM UTC)
- 6 PM PST = `0 2 * * *` (2 AM UTC)
- 8 PM PST = `0 4 * * *` (4 AM UTC)

Then run:

```sql
SELECT cron.unschedule('send-daily-reminders');
SELECT cron.schedule('send-daily-reminders', '0 3 * * *', $$SELECT public.send_streak_reminders();$$);
```
