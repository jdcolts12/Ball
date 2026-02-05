# Create Edge Function - Step by Step

You don't see `send-streak-reminders` in Edge Functions. Let's create it!

---

## Step 1: Create New Function

1. **Supabase** → **Edge Functions** (left sidebar)
2. Click **"Create a new function"** or **"New Function"** button
3. **Function name:** `send-streak-reminders`
   - ⚠️ Must be exactly: `send-streak-reminders` (lowercase, no spaces)
4. Click **Create** or **Add**

---

## Step 2: Copy the Code

1. In Cursor, the file `supabase/functions/send-streak-reminders/index.ts` is already open
2. **Select ALL:** `Cmd+A` (Mac) or `Ctrl+A` (Windows)
3. **Copy:** `Cmd+C` (Mac) or `Ctrl+C` (Windows)

---

## Step 3: Paste into Supabase

1. Back in Supabase Edge Functions editor
2. **Delete ALL** default code in the editor
3. **Paste** your copied code (`Cmd+V` or `Ctrl+V`)
4. Click **Deploy** (or **Save**)

---

## Step 4: Verify It's Created

After deploying, you should see:
- Function name: `send-streak-reminders` in the list
- Status: **Active** (green)
- URL: `https://yhxtyjfmpulmqoljbgmv.supabase.co/functions/v1/send-streak-reminders`

---

## Step 5: Set Secrets (If Not Done)

1. **Supabase** → **Settings** → **Edge Functions** → **Secrets**
2. Make sure you have all 3:
   - `RESEND_API_KEY` ✅
   - `RESEND_FROM_EMAIL` ✅
   - `APP_URL` ✅

---

## Step 6: Test It

After creating, test:

```sql
SELECT public.send_streak_reminders();
```

Then check:
- Edge Function → Logs tab
- Resend dashboard → Emails → Logs

---

**Follow Steps 1-3 to create the function!** 🚀
