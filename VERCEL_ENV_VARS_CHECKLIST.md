# Fix "add Supabase URL and anon key" - Step by Step

If you see this message on your live site, the environment variables aren't set in Vercel or weren't included in the build.

---

## Step 1: Get your Supabase values

1. Go to **supabase.com** → your project.
2. Click **Settings** (gear icon) → **API**.
3. Copy these two values:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

---

## Step 2: Add them to Vercel (exact steps)

1. Go to **vercel.com** → sign in → click your **project name**.
2. Click **Settings** (top menu).
3. Click **Environment Variables** (left sidebar).
4. You should see a table. If it's empty, that's the problem.

### Add the first variable:

1. Click **Add New** (or **+ Add**).
2. **Key:** Type exactly: `VITE_SUPABASE_URL` (no spaces, correct spelling).
3. **Value:** Paste your Supabase Project URL (e.g. `https://xxxxx.supabase.co`).
4. **Environment:** Check **Production** (and **Preview** if you want).
5. Click **Save**.

### Add the second variable:

1. Click **Add New** again.
2. **Key:** Type exactly: `VITE_SUPABASE_ANON_KEY` (no spaces, correct spelling).
3. **Value:** Paste your Supabase anon public key (long string).
4. **Environment:** Check **Production** (and **Preview** if you want).
5. Click **Save**.

---

## Step 3: Verify they're saved

You should now see **2 rows** in the Environment Variables table:
- `VITE_SUPABASE_URL` → (your URL)
- `VITE_SUPABASE_ANON_KEY` → (your key)

Both should have **Production** checked.

---

## Step 4: Redeploy (critical!)

**Important:** Vercel only includes env vars in **new builds**. You must redeploy.

1. Click **Deployments** (top menu).
2. Find the **latest deployment** (top of the list).
3. Click the **⋯** (three dots) on that deployment.
4. Click **Redeploy**.
5. Click **Redeploy** again to confirm.
6. Wait for the build to finish (status changes to **Ready**).
7. Click **Visit** (or open your site URL).

---

## Step 5: Check if it worked

After the redeploy finishes:

1. Open your live site (e.g. `https://your-project.vercel.app`).
2. You should see the **sign-up form** (username, email, password fields).
3. If you still see "add your Supabase URL and anon key", go back to **Step 2** and double-check:
   - Variable names are **exactly** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (no typos).
   - Both have **Production** checked.
   - You clicked **Save** after adding each one.
   - You **Redeployed** after adding them.

---

## Common mistakes

- ❌ Variable name has a typo (e.g. `VITE_SUPABASE_UR` or `VITE_SUPABASE_URL ` with trailing space).
- ❌ Only set for **Preview** but not **Production**.
- ❌ Forgot to click **Save** after adding each variable.
- ❌ Didn't redeploy after adding the variables.
- ❌ Using the wrong key (e.g. service_role instead of anon public).

---

## Still not working?

1. In Vercel → **Deployments** → click the latest deployment → **Build Logs**.
2. Scroll to the build output and look for any errors.
3. Check if you see `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` mentioned anywhere (they won't show the actual values for security).

If the build succeeded but the site still shows the message, the env vars weren't included. Double-check **Step 2** and **Step 4**.
