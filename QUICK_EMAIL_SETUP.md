# Quick Setup: Email Reminders for Streaks

Follow these steps to enable email reminders (30 minutes).

---

## Step 1: Set up Resend (5 minutes)

1. Go to **[resend.com](https://resend.com)** → Sign up (free)
2. **API Keys** → **Create API Key** → Copy the key
3. For testing, you can use `onboarding@resend.dev` as sender email

---

## Step 2: Add Secrets to Supabase (2 minutes)

1. **Supabase** → your project → **Settings** → **Edge Functions** → **Secrets**
2. Add these secrets:
   - **Name:** `RESEND_API_KEY` → **Value:** Your Resend API key
   - **Name:** `RESEND_FROM_EMAIL` → **Value:** `onboarding@resend.dev` (or your verified domain)
   - **Name:** `APP_URL` → **Value:** `https://your-app.vercel.app` (your live site URL)

---

## Step 3: Deploy Edge Function (5 minutes)

**Option A: Using Supabase CLI**

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy the function
supabase functions deploy send-streak-reminders
```

**Option B: Using Supabase Dashboard**

1. **Supabase** → **Edge Functions** → **Create a new function**
2. **Name:** `send-streak-reminders`
3. Copy the code from `supabase/functions/send-streak-reminders/index.ts`
4. Paste and **Deploy**

---

## Step 4: Set up Cron Job (5 minutes)

1. **Supabase** → **SQL Editor** → **New query**
2. Open: `supabase/migrations/011_email_reminders_cron.sql`
3. **Replace these values:**
   - `YOUR_PROJECT_ID` → Your Supabase project ID (from URL)
   - `YOUR_ANON_KEY` → Your anon key (Settings → API)
4. Copy and paste into Supabase SQL Editor
5. Click **Run**

---

## Step 5: Test It (5 minutes)

**Manual test:**

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-streak-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Check:**
- Should return JSON with `sent` count
- Check your email inbox (if you have a streak)

---

## Step 6: Verify Cron Job

1. **Supabase** → **Database** → **Extensions**
2. Make sure `pg_cron` is enabled
3. Check cron jobs: `SELECT * FROM cron.job;`

---

## How It Works

1. **Daily at 5 PM UTC:** Cron job triggers
2. **Finds users:** ALL users who haven't played today
3. **Sends emails:** Via Resend API
4. **Email includes:** 
   - If user has streak ≥2: Shows streak count and "don't lose it" message
   - If no streak: General "don't forget to play" reminder
   - "Play Now" button for all users

---

## Customization

**Change reminder time:**
- Edit cron schedule in `011_email_reminders_cron.sql`
- Format: `'0 17 * * *'` = 5 PM UTC daily
- Example: `'0 12 * * *'` = Noon UTC daily
- Example: `'0 21 * * *'` = 9 PM UTC daily

**Change email template:**
- Edit HTML in `supabase/functions/send-streak-reminders/index.ts`
- Customize colors, text, branding

**Note:** Reminders go to ALL users who haven't played today, regardless of streak. Users with streaks ≥2 get a personalized message mentioning their streak.

---

## Troubleshooting

**No emails sent?**
- Check Resend dashboard → Logs
- Verify `RESEND_API_KEY` secret is set
- Check Edge Function logs in Supabase

**Cron not running?**
- Verify `pg_cron` extension is enabled
- Check: `SELECT * FROM cron.job;`
- Manually test: `SELECT public.send_streak_reminders();`

**Function errors?**
- Check Edge Function logs: Supabase → Edge Functions → Logs
- Verify all secrets are set correctly

---

## Cost

- **Resend:** Free tier = 3,000 emails/month
- **Supabase Edge Functions:** Free tier = 500K invocations/month
- **Total:** Free for small apps! 🎉

---

**Ready to set up?** Follow the steps above. Takes ~30 minutes total.
