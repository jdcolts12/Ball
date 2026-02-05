# Show Login and Start Button

The site is live but you don't see login or Start because **Supabase env vars** aren't set on Vercel (or you didn't redeploy after adding them).

---

## Step 1: Add env vars in Vercel

1. **Vercel** → your project → **Settings** → **Environment Variables**
2. Add **first variable:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** your Supabase **Project URL** (from Supabase → Project Settings → API)
   - **Environments:** check **Production** (and Preview if you want)
   - Click **Save**
3. Add **second variable:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** your Supabase **anon public** key (same API page)
   - **Environments:** check **Production** (and Preview if you want)
   - Click **Save**

---

## Step 2: Redeploy (required)

Env vars are baked in at **build** time. You must redeploy after adding them.

1. **Deployments** → **⋯** on latest deployment → **Redeploy**
2. Wait until **Ready**
3. Click **Visit**

---

## Step 3: Set Supabase URL (so login works)

1. **Supabase** → **Authentication** → **URL configuration**
2. **Site URL:** your Vercel URL (e.g. `https://your-project.vercel.app`)
3. **Redirect URLs:** add `https://your-project.vercel.app/**`
4. **Save**

---

After redeploy you should see:
- **Login / Sign up** form (email, password, username)
- After signing in → **Start game** and **View leaderboard**
