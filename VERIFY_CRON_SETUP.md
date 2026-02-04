# Verify Cron Job is Set Up ✅

If you see "schedule 1" - that means it worked! ✅

---

## Step 1: Verify Cron Job Exists

Run this in Supabase SQL Editor:

```sql
SELECT * FROM cron.job;
```

**You should see:**
- A row with `jobid = 1`
- `schedule = '0 17 * * *'` (5 PM UTC daily)
- `command` containing `send_streak_reminders`

---

## Step 2: Verify Extensions

Make sure both extensions are enabled:

```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```

**Should show 2 rows** - one for each extension.

---

## Step 3: Test the Function Manually

Test if the function works:

```sql
SELECT public.send_streak_reminders();
```

**What to expect:**
- Should return `void` (no error)
- Check Edge Function logs: Supabase → Edge Functions → `send-streak-reminders` → Logs
- Should see emails sent in Resend dashboard

---

## Step 4: Check Edge Function Logs

1. **Supabase** → **Edge Functions** → `send-streak-reminders`
2. Click **Logs** tab
3. After running the test (Step 3), you should see:
   - Function execution logs
   - Number of emails sent
   - Any errors (if any)

---

## Step 5: Check Resend Dashboard

1. Go to **resend.com** → **Emails** → **Logs**
2. After running the test, you should see:
   - Emails that were sent
   - Status (delivered, bounced, etc.)

---

## ✅ Everything Working?

If all checks pass:
- ✅ Cron job scheduled (job ID 1)
- ✅ Extensions enabled
- ✅ Function runs without errors
- ✅ Emails appear in Resend logs

**Then you're done!** The cron job will run automatically every day at 5 PM UTC.

---

## Next Steps

**Wait for 5 PM UTC** (or test manually anytime):

```sql
SELECT public.send_streak_reminders();
```

**To see when it will run next:**
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

**"schedule 1" = Success!** 🎉
