# YunoBall — What’s done and what you do

## Done for you

- **All code is committed** in the `football-trivia` folder (leaderboard fixes, mobile layout, START_HERE, PASTE_INTO_SUPABASE).
- **One SQL file** for Supabase: `PASTE_INTO_SUPABASE.txt` — only the SQL, no instructions.

---

## You do 3 things (only these)

### 0. Push to GitHub (once)

- Open **GitHub Desktop**, open the **football-trivia** folder as the repo, then click **Push**.
- Or in Terminal: `cd` into `football-trivia`, then run: `git push origin main` (and sign in if it asks).

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
