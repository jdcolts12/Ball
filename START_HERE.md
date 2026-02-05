# YunoBall — What’s done and what you do

## Done for you

- **Code is committed and pushed to GitHub** (so your repo is up to date).
- **Leaderboard** fixes (daily shows all players, mobile layout) are in the code.
- **One SQL file** for Supabase: `PASTE_INTO_SUPABASE.txt` — it has only the SQL, no instructions.

---

## You do 2 things (only these)

### 1. Vercel (so the new site goes live)

1. Go to **https://vercel.com** → your YunoBall project.
2. **Settings** → **General** → **Root Directory**.  
   If it says `football-trivia`, **clear it** so it’s empty. Click **Save**.
3. **Deployments** → click the **⋯** on the latest deployment → **Redeploy**.
4. **Uncheck** “Redeploy with existing Build Cache” → click **Redeploy**.

### 2. Supabase (only if daily leaderboard shows 1 player)

1. Go to **https://supabase.com** → your project → **SQL Editor** → **New query**.
2. Open the file **`PASTE_INTO_SUPABASE.txt`** (in this project).
3. **Select all** (Cmd+A) → **Copy**.
4. **Paste** into the Supabase SQL Editor box → click **Run**.

---

## Check it worked

Open your live site in a **new incognito/private** window. You should see **“Version 2.0 — Feb 2026”** on the home screen and **“YunoBall – Daily NFL Trivia (v2.0)”** in the browser tab.
