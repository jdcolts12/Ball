# Step-by-Step: Email Reminders Setup

You have Resend account ✅. Let's get this set up!

---

## Step 1: Get Your Resend API Key (2 minutes)

1. Go to **[resend.com](https://resend.com)** and sign in
2. Click **API Keys** in the left sidebar
3. Click **Create API Key**
4. Give it a name: `YunoBall Reminders`
5. Click **Add** or **Create**
6. **COPY THE API KEY** (you'll need it in Step 2)
   - ⚠️ You can only see it once! Copy it now.

---

## Step 2: Add Secrets to Supabase (3 minutes)

1. Go to **[supabase.com](https://supabase.com)** → your project
2. Click **Settings** (gear icon) in the left sidebar
3. Click **Edge Functions** in the settings menu
4. Click **Secrets** tab
5. Add these 3 secrets (click **Add new secret** for each):

   **Secret 1:**
   - **Name:** `RESEND_API_KEY`
   - **Value:** Paste your Resend API key from Step 1
   - Click **Save**

   **Secret 2:**
   - **Name:** `RESEND_FROM_EMAIL`
   - **Value:** `onboarding@resend.dev` (for testing) or your verified domain email
   - Click **Save**

   **Secret 3:**
   - **Name:** `APP_URL`
   - **Value:** Your live site URL (e.g. `https://your-app.vercel.app`)
   - Click **Save**

✅ You should now have 3 secrets saved.

---

## Step 3: Get Your Supabase Service Role Key (1 minute)

You'll need this for the Edge Function to access all user data.

1. Still in **Supabase** → **Settings** → **API**
2. Find **Project API keys** section
3. Copy the **service_role** key (NOT the anon key)
   - ⚠️ This is secret! Don't share it publicly.
   - You'll use this in Step 5

---

## Step 4: Create the Edge Function (5 minutes)

### Option A: Using Supabase Dashboard (Easier)

1. **Supabase** → **Edge Functions** (left sidebar)
2. Click **Create a new function**
3. **Function name:** `send-streak-reminders`
4. Click **Create function**
5. You'll see a code editor
6. **Delete all the default code**
7. Open this file in Cursor: `supabase/functions/send-streak-reminders/index.ts`
8. **Copy ALL** the code (Cmd+A, then Cmd+C)
9. **Paste** it into the Supabase editor
10. Click **Deploy** (or **Save**)

### Option B: Using Supabase CLI

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

# Install Supabase CLI if you don't have it
npm install -g supabase

# Login
supabase login

# Link to your project (you'll need your project ref ID)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy
supabase functions deploy send-streak-reminders
```

---

## Step 5: Set Up the Cron Job (5 minutes)

1. **Supabase** → **SQL Editor** → **+ New query**
2. Open this file in Cursor: `supabase/migrations/011_email_reminders_cron.sql`
3. **Copy ALL** the code (Cmd+A, then Cmd+C)
4. **Paste** into Supabase SQL Editor
5. **IMPORTANT:** Replace these 2 values:

   Find this line:
   ```sql
   edge_function_url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-streak-reminders';
   ```
   
   Replace `YOUR_PROJECT_ID` with your actual Supabase project ID:
   - Find it in your Supabase URL: `https://xxxxx.supabase.co` (the xxxxx part)
   - Or: Settings → API → Project URL (the part before `.supabase.co`)

   Find this line:
   ```sql
   anon_key := 'YOUR_ANON_KEY';
   ```
   
   Replace `YOUR_ANON_KEY` with your anon key:
   - Settings → API → anon public key

6. Click **Run**
7. You should see: **Success. No rows returned** ✅

---

## Step 6: Test It Manually (2 minutes)

Let's test before waiting for the cron job:

1. **Supabase** → **SQL Editor** → **+ New query**
2. Run this:
   ```sql
   SELECT public.send_streak_reminders();
   ```
3. Click **Run**
4. Check the result - should show how many emails were sent

**Or test via curl:**

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-streak-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Replace:
- `YOUR_PROJECT_ID` → Your Supabase project ID
- `YOUR_ANON_KEY` → Your anon key

---

## Step 7: Verify It's Working

1. **Check Resend dashboard:**
   - Go to resend.com → **Emails** → **Logs**
   - You should see emails that were sent

2. **Check your email inbox:**
   - If you have a test account that hasn't played today, check its email

3. **Check Supabase logs:**
   - Supabase → Edge Functions → `send-streak-reminders` → **Logs**
   - Should show successful runs

---

## Step 8: Verify Cron Job is Scheduled

1. **Supabase** → **SQL Editor** → **+ New query**
2. Run:
   ```sql
   SELECT * FROM cron.job;
   ```
3. Should show a row with job name `send-daily-reminders`
4. Should show schedule: `0 17 * * *` (5 PM UTC daily)

---

## ✅ Done!

Your email reminders are now set up!

**What happens:**
- Every day at **5 PM UTC**, the cron job runs
- Finds all users who haven't played today
- Sends them personalized reminder emails
- Users with streaks get "don't lose your streak" message
- Other users get "don't forget to play" message

---

## Troubleshooting

**No emails sent?**
- Check Resend logs: resend.com → Emails → Logs
- Check Edge Function logs: Supabase → Edge Functions → Logs
- Verify all 3 secrets are set correctly

**Cron not running?**
- Check: `SELECT * FROM cron.job;` - is it there?
- Verify pg_cron extension: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
- Manually test: `SELECT public.send_streak_reminders();`

**Function errors?**
- Check Edge Function logs for specific error messages
- Verify service_role key has proper permissions
- Make sure all secrets are set

---

## Change Reminder Time

To change when reminders are sent (currently 5 PM UTC):

1. **Supabase** → **SQL Editor**
2. Run:
   ```sql
   SELECT cron.unschedule('send-daily-reminders');
   ```
3. Run:
   ```sql
   SELECT cron.schedule(
     'send-daily-reminders',
     '0 21 * * *', -- 9 PM UTC (change this)
     $$SELECT public.send_streak_reminders();$$
   );
   ```

**Cron format:** `'minute hour * * *'`
- `'0 17 * * *'` = 5 PM UTC
- `'0 12 * * *'` = Noon UTC  
- `'0 21 * * *'` = 9 PM UTC

---

**Ready? Start with Step 1!** 🚀
