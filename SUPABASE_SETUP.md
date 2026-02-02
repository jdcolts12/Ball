# How to set up Supabase for YunoBall

Do this once per Supabase project (e.g. your production project).

---

## 1. Open your project

1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. Open your project (or **New project** → pick org, name, password, region → **Create**).
3. Wait until the project is ready (green status).

---

## 2. Run the SQL (tables, auth, leaderboards)

1. In the left sidebar click **SQL Editor**.
2. Click **New query**.
3. Open the file **`supabase/RUN_THIS_ONCE.sql`** in your code editor, select all (Cmd/Ctrl+A), copy.
4. Paste into the Supabase SQL Editor.
5. Click **Run** (or Cmd/Ctrl+Enter).
6. You should see “Success. No rows returned” (or similar). That’s normal — it creates tables and functions.

If you get errors like “already exists”, that usually means you ran it before; you can ignore those or run the **migrations** in `supabase/migrations/` one by one (005, 006, 007, 008) to update existing functions.

---

## 3. (Optional) Turn off email confirmation

So users can play right after sign-up without confirming email:

1. Left sidebar → **Authentication** → **Providers**.
2. Click **Email**.
3. Turn **OFF** “Confirm email”.
4. **Save**.

---

## 4. Get your API keys

1. Left sidebar → **Project Settings** (gear icon).
2. Click **API** in the left menu.
3. Copy and save somewhere safe:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (long string under “Project API keys”)

You’ll paste these into Vercel (or your host) as:
- `VITE_SUPABASE_URL` = Project URL  
- `VITE_SUPABASE_ANON_KEY` = anon public key  

Never put the **service_role** key in your frontend or in a repo.

---

## 5. Set auth URLs (after you have a live URL)

Once your app is deployed (e.g. `https://your-app.vercel.app`):

1. Left sidebar → **Authentication** → **URL configuration**.
2. **Site URL**: set to your live app URL, e.g. `https://your-app.vercel.app`.
3. **Redirect URLs**: add a line: `https://your-app.vercel.app/**`.
4. **Save**.

That lets Supabase redirect users back to your app after sign-in/sign-up.

---

## Quick checklist

- [ ] SQL Editor: ran **RUN_THIS_ONCE.sql** (Success).
- [ ] Project Settings → API: copied **Project URL** and **anon public** key.
- [ ] (Optional) Authentication → Providers → Email: **Confirm email** off.
- [ ] After deploy: Authentication → URL configuration → **Site URL** and **Redirect URLs** set to your live URL.

After this, use the Project URL and anon key in your hosting env vars and you’re done on the Supabase side.
