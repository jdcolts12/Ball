# Debug: Function Not Showing Messages

Let's check what's happening step by step.

---

## Step 1: Verify Function Exists

Run this in SQL Editor:

```sql
SELECT proname, prorettype::regtype 
FROM pg_proc 
WHERE proname = 'send_streak_reminders';
```

**Expected:** 1 row showing the function name and return type (`void`)

**If 0 rows:** Function doesn't exist - need to create it

---

## Step 2: Check if Edge Function Exists

1. **Supabase** → **Edge Functions**
2. Do you see `send-streak-reminders` in the list?
   - **Yes** → Go to Step 3
   - **No** → You need to create it first (see CREATE_FUNCTION_NOW.md)

---

## Step 3: Test Edge Function Directly

If Edge Function exists, test it directly:

**In SQL Editor, run this** (replace `YOUR_SERVICE_ROLE_KEY`):

```sql
SELECT net.http_post(
  url := 'https://yhxtyjfmpulmqoljbgmv.supabase.co/functions/v1/send-streak-reminders',
  headers := jsonb_build_object(
    'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
    'Content-Type', 'application/json',
    'apikey', 'YOUR_SERVICE_ROLE_KEY'
  ),
  body := '{}'::jsonb
) AS request_id;
```

**This will:**
- Call the Edge Function directly
- Return a request ID number
- Show up in Edge Function logs

---

## Step 4: Check Edge Function Logs

1. **Supabase** → **Edge Functions** → `send-streak-reminders`
2. Click **Logs** tab
3. Look for recent entries
4. Should show:
   - Request details
   - Response JSON
   - Errors (if any)

---

## Step 5: Check Cron Job

Run this to see if cron job exists:

```sql
SELECT * FROM cron.job WHERE jobname = 'send-daily-reminders';
```

**Expected:** 1 row with job details

---

## Common Issues

**Function doesn't exist:**
- Run the migration SQL again: `supabase/migrations/011_email_reminders_cron.sql`
- Make sure you replaced `YOUR_SERVICE_ROLE_KEY` with your actual key

**Edge Function doesn't exist:**
- Create it: Supabase → Edge Functions → Create new function
- Copy code from `supabase/functions/send-streak-reminders/index.ts`

**No messages:**
- Function might have run silently (normal for void functions)
- Check Edge Function logs instead
- Check Resend dashboard for emails

---

**Run Step 1 first** - tell me what it returns!
