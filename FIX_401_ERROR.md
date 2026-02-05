# Fix 401 "Missing authorization header" Error

The Edge Function needs proper authentication. Here's how to fix it:

---

## Option 1: Use Service Role Key (Recommended)

The SQL function needs to use your **service_role** key (not anon key) for internal calls.

### Step 1: Get Your Service Role Key

1. **Supabase** → **Settings** → **API**
2. Find **"service_role"** key (under "Project API keys")
3. **Copy it** (keep it secret!)

### Step 2: Update the SQL Function

1. **Supabase** → **SQL Editor** → **New query**
2. Run this (replace `YOUR_SERVICE_ROLE_KEY` with your actual key):

```sql
create or replace function public.send_streak_reminders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  edge_function_url text;
  service_role_key text;
  request_id bigint;
begin
  edge_function_url := 'https://yhxtyjfmpulmqoljbgmv.supabase.co/functions/v1/send-streak-reminders';
  service_role_key := 'YOUR_SERVICE_ROLE_KEY'; -- Paste your service_role key here
  
  select net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json',
      'apikey', service_role_key
    ),
    body := '{}'::jsonb
  ) into request_id;
  
  raise notice 'Reminder email request sent. Request ID: %', request_id;
end;
$$;
```

3. **Replace** `YOUR_SERVICE_ROLE_KEY` with your actual service_role key
4. Click **Run**

---

## Option 2: Make Edge Function Public (Less Secure)

If you want to allow anonymous calls, update the Edge Function:

1. **Supabase** → **Edge Functions** → `send-streak-reminders`
2. Go to **Settings** tab
3. Look for **"Verify JWT"** or **"Require Auth"** setting
4. **Turn it OFF** (if available)

**Note:** This makes the function publicly accessible, which is less secure.

---

## Option 3: Add Auth Check in Edge Function

Update the Edge Function to handle auth properly:

The function already uses `SUPABASE_SERVICE_ROLE_KEY` internally, so it should work. The issue is the HTTP call from SQL needs proper headers.

---

## Test After Fixing

Run this in SQL Editor:

```sql
SELECT public.send_streak_reminders();
```

**Should return:** No error, and you'll see a notice with request ID.

**Then check:**
- Edge Function logs: Supabase → Edge Functions → Logs
- Resend dashboard: resend.com → Emails → Logs

---

## Quick Fix

**Use Option 1** - it's the most secure. Just update the SQL function with your service_role key.

---

**The SQL file has been updated. Replace `YOUR_SERVICE_ROLE_KEY` with your actual key and run it!**
