# Create the Email Reminder Edge Function

You see "quick-service" - that means Edge Functions work! Now let's create the new one.

---

## Step 1: Create New Function

1. In **Supabase** → **Edge Functions** (where you see quick-service)
2. Click **"Create a new function"** or **"New Function"** button
3. **Function name:** `send-streak-reminders`
   - ⚠️ Must be exactly: `send-streak-reminders` (no spaces, lowercase)
4. Click **Create** or **Add**

---

## Step 2: Copy the Code

1. In Cursor, open: `supabase/functions/send-streak-reminders/index.ts`
2. **Select ALL** (Cmd+A or Ctrl+A)
3. **Copy** (Cmd+C or Ctrl+C)

---

## Step 3: Paste and Deploy

1. Back in Supabase Edge Functions editor
2. **Delete all default code** in the editor
3. **Paste** your copied code (Cmd+V or Ctrl+V)
4. Click **Deploy** (or **Save**)

---

## Step 4: Verify

After deploying, you should see:
- Function name: `send-streak-reminders`
- Status: **Active** (green)
- URL: `https://yhxtyjfmpulmqoljbgmv.supabase.co/functions/v1/send-streak-reminders`

---

## Step 5: Set Secrets (If Not Done)

1. **Supabase** → **Settings** → **Edge Functions** → **Secrets**
2. Make sure you have:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `APP_URL`

---

## Step 6: Test It

Run in SQL Editor:

```sql
SELECT public.send_streak_reminders();
```

Or test via curl:

```bash
curl -X POST https://yhxtyjfmpulmqoljbgmv.supabase.co/functions/v1/send-streak-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

**Follow Steps 1-3 to create the function!** 🚀
