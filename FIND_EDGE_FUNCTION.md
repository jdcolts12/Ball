# Where to Find Your Edge Function in Supabase

Follow these steps to locate and verify your Edge Function.

---

## Step 1: Navigate to Edge Functions

1. Go to **[supabase.com](https://supabase.com)** → your project
2. Look at the **left sidebar**
3. Scroll down and find **"Edge Functions"** (it's near the bottom, below "Database", "Authentication", etc.)
4. Click **"Edge Functions"**

**If you don't see "Edge Functions":**
- You might need to enable it
- Go to **Settings** → **Edge Functions** → make sure it's enabled
- Or your Supabase plan might not include Edge Functions (check your plan)

---

## Step 2: Check if Function Exists

Once you're in **Edge Functions**:

**Option A: Function Already Exists**
- You should see a list of functions
- Look for: `send-streak-reminders`
- Click on it to view/edit

**Option B: Function Doesn't Exist**
- You'll see an empty list or "No functions"
- Click **"Create a new function"** or **"New Function"**
- Name it: `send-streak-reminders`
- Then paste the code from `supabase/functions/send-streak-reminders/index.ts`

---

## Step 3: Create the Function (If It Doesn't Exist)

1. Click **"Create a new function"** or **"New Function"**
2. **Function name:** `send-streak-reminders`
3. Click **Create**
4. You'll see a code editor
5. **Delete all default code**
6. Open this file in Cursor: `supabase/functions/send-streak-reminders/index.ts`
7. **Copy ALL** (Cmd+A, then Cmd+C)
8. **Paste** into Supabase editor
9. Click **Deploy** (or **Save**)

---

## Step 4: Verify Function is Active

After creating/deploying:

1. You should see the function in the list
2. Status should be **"Active"** (green)
3. Click on the function name
4. You should see:
   - Code editor
   - **Logs** tab
   - **Settings** tab
   - **Deploy** button

---

## Alternative: Check via SQL

Run this in SQL Editor to see if the function exists:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%streak%' OR proname LIKE '%reminder%';
```

This shows database functions, not Edge Functions, but might help.

---

## If Edge Functions Section Doesn't Exist

**Your Supabase plan might not include Edge Functions.**

**Options:**
1. **Upgrade plan** (if needed)
2. **Use Vercel serverless function instead** (I can help set this up)
3. **Use Supabase Database Functions** (simpler but less flexible)

---

## Quick Check

**Tell me:**
1. Do you see **"Edge Functions"** in the left sidebar?
2. If yes, what do you see when you click it?
3. If no, what's your Supabase plan? (Free, Pro, etc.)

---

**Let me know what you see and I'll help you get it set up!**
