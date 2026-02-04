# Deploy YunoBall (NFL Trivia) to the web

Follow these steps to make the game live so anyone can play.

---

## 1. Supabase (production)

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Use your **existing project** as production, or create a new one for production.
3. In the Supabase dashboard: **SQL Editor** → New query.
4. Run your schema and functions:
   - Paste and run the contents of **`supabase/RUN_THIS_ONCE.sql`** (if you haven’t already).
   - Then run each migration in **`supabase/migrations/`** in order (001 through 008) if they add anything new.
5. **Authentication** → **URL configuration**:
   - **Site URL**: set to your live app URL (e.g. `https://your-app.vercel.app`) — you can update this after deploying.
   - **Redirect URLs**: add your live URL, e.g. `https://your-app.vercel.app/**`.
6. **Project Settings** → **API**:
   - Copy **Project URL** and **anon (public) key** — you’ll use these in step 3.

---

## 2. Push code to GitHub (if you haven’t already)

1. Create a repo on [github.com](https://github.com) (e.g. `yunoball` or `football-trivia`).
2. In your project folder:

   ```bash
   cd football-trivia
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

   Do **not** commit `.env` (it’s in `.gitignore`). Use only the repo for code and config, not secrets.

---

## 3. Deploy on Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. **Add New** → **Project** → **Import** your GitHub repo.
3. **Root Directory**: set to `football-trivia` (or leave as repo root if the repo is only the app).
4. **Environment Variables** (required):
   - `VITE_SUPABASE_URL` = your Supabase **Project URL**
   - `VITE_SUPABASE_ANON_KEY` = your Supabase **anon (public) key**
   Add them for **Production** (and Preview if you want).
5. Click **Deploy**. Vercel will run `npm run build` and serve the `dist` folder.
6. When it’s done, open the live URL (e.g. `https://your-project.vercel.app`).
7. In Supabase **Authentication** → **URL configuration**, set **Site URL** to that URL and add it to **Redirect URLs** (e.g. `https://your-project.vercel.app/**`).

**Optional:** In Vercel → **Settings** → **Domains**, add a custom domain (e.g. `yunoball.com`) and point DNS as Vercel instructs.

---

## 4. Test the live site

1. Open your live URL.
2. Sign up with an email/password (or the auth method you enabled).
3. Play a full game (all 3 questions).
4. Check: leaderboard, “% of players got this question correct,” and that you can only play once per day after finishing.

If anything fails, check the browser console (F12) and Supabase **Authentication** → **Users** and **Table Editor** → `games` to confirm data is saving.

---

## 5. After it’s live

- **Add questions / change app:** Edit code locally, commit, and push to `main`. Vercel will redeploy automatically.
- **Env changes:** Update **Vercel** → **Settings** → **Environment Variables**, then redeploy.
- **Supabase changes:** Run new SQL in the Supabase SQL Editor (or new migration files), then deploy the app code that uses them.

You’re live. Share the URL so people can sign up and play.
