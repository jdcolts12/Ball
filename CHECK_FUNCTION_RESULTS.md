# Check Function Results

If you ran `SELECT public.send_streak_reminders();` and don't see output, here's what to check:

---

## Step 1: Check Messages/Notifications

After running the SQL, look **below** the SQL editor:

1. **Messages tab** - Should show: "Reminder email request sent. Request ID: [number]"
2. **Notifications** - Any warnings or errors
3. **Results tab** - Might show `void` or be empty (that's normal for this function)

---

## Step 2: Verify Function Exists

Run this to check if the function exists:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'send_streak_reminders';
```

**Should return:** 1 row showing the function definition

**If returns 0 rows:** The function doesn't exist - you need to create it first

---

## Step 3: Check Edge Function Logs

1. **Supabase** → **Edge Functions** → `send-streak-reminders`
2. Click **Logs** tab
3. Look for recent executions
4. Should show:
   - Request details
   - Response JSON
   - Any errors

**If no logs:** The function might not have been called, or there's an error in the SQL function

---

## Step 4: Test Edge Function Directly

Test the Edge Function directly (bypassing SQL):

**In Supabase SQL Editor, run:**

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

Replace `YOUR_SERVICE_ROLE_KEY` with your actual service_role key.

**This will:**
- Call the Edge Function directly
- Return a request ID
- Show in Edge Function logs

---

## Step 5: Check for Errors

Run this to see if there are any errors:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-reminders')
ORDER BY start_time DESC 
LIMIT 5;
```

This shows recent cron job executions and any errors.

---

## Quick Diagnostic

Run these one by one:

1. **Check function exists:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'send_streak_reminders';
   ```

2. **Check cron job exists:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'send-daily-reminders';
   ```

3. **Check Edge Function exists:**
   - Go to: Supabase → Edge Functions
   - Do you see `send-streak-reminders` in the list?

---

**Tell me:**
1. Do you see the function in Edge Functions list?
2. What do you see in the Messages tab after running the SQL?
3. Any errors shown?
