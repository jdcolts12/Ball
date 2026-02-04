# Deploy Email Reminders - Final Steps

Follow these steps to get email reminders live.

---

## ✅ Already Done

- [x] Resend account set up
- [x] Secrets added to Supabase
- [x] Edge Function created
- [x] Cron job scheduled

---

## Step 1: Verify Edge Function is Deployed

1. **Supabase** → **Edge Functions** → `send-streak-reminders`
2. Check if it shows **"Active"** status
3. If you edited the code, click **Redeploy**

---

## Step 2: Test the Function

Run this in Supabase SQL Editor:

```sql
SELECT public.send_streak_reminders();
```

**Check:**
- Edge Function logs: Supabase → Edge Functions → Logs
- Resend dashboard: resend.com → Emails → Logs
- Should see emails sent

---

## Step 3: Verify Cron Job

Run this in Supabase SQL Editor:

```sql
SELECT * FROM cron.job;
```

**Should show:**
- Job ID: 1
- Schedule: `0 17 * * *` (5 PM UTC daily)
- Status: Active

---

## Step 4: Commit Code Changes (Optional)

If you edited the Edge Function code locally:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git add supabase/functions/send-streak-reminders/index.ts
git commit -m "Add email reminder system for daily play reminders"
git push
```

**Note:** Edge Functions are deployed directly to Supabase, not via GitHub. But committing keeps your code backed up.

---

## ✅ Done!

Your email reminders are now live!

**What happens:**
- Every day at **5 PM UTC**, emails are sent automatically
- All users who haven't played today get a reminder
- Users with streaks get personalized messages

---

## Test It Now

**Manual test:**
```sql
SELECT public.send_streak_reminders();
```

**Check results:**
1. Resend dashboard → Emails → Logs
2. Your email inbox (if you have a test account)

---

## Troubleshooting

**No emails sent?**
- Check Edge Function logs for errors
- Verify all 3 secrets are set: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APP_URL`
- Check Resend API key is valid

**Cron not running?**
- Verify: `SELECT * FROM cron.job;`
- Check pg_cron extension: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`

---

**Everything working?** 🎉 Your reminders are live!
