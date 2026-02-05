# Get YunoBall live – do these in order

All code fixes are committed. Do **Step 1** (push), then **Step 2** (env vars), then **Step 3** (build settings + redeploy).

---

## Step 1: Push to GitHub

You need to **add your GitHub repo** and **push** so Vercel can build the fixed code.

### 1a. Get your repo URL from GitHub

1. Open **github.com** in your browser and sign in.
2. Click your **profile picture** (top right) → **Your repositories**.
3. Click the repo you use for this project (e.g. football-trivia or YunoBall).
4. Click the green **Code** button.
5. Under **HTTPS**, copy the URL (e.g. `https://github.com/YourUsername/football-trivia.git`).

### 1b. In Cursor: open the terminal and run these 4 lines

Press **⌘ + `** (Command + backtick) to open the terminal. Then run **one line at a time** (replace the URL with yours from 1a):

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**If it says "remote origin already exists":** run this first (with your URL), then run `git push -u origin main` again:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

**If it asks for password:** use a **Personal Access Token** from GitHub (Settings → Developer settings → Personal access tokens), not your GitHub password.

When the push succeeds, go to **Step 2**.

---

## Step 2: Vercel env vars (do this first so the build gets them)

The app needs these at **build time**. Add them before deploying.

1. **vercel.com** → your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `VITE_SUPABASE_URL` → **Value:** your Supabase Project URL (e.g. `https://xxxx.supabase.co`).
   - **Name:** `VITE_SUPABASE_ANON_KEY` → **Value:** your Supabase anon (public) key from **Supabase → Settings → API**.
3. Set **Environment** to **Production** (and **Preview** if you want).
4. **Save**.

## Step 3: Vercel build settings and redeploy

1. **Settings** → **General** (or **Build and Deployment**):
   - **Root Directory:** leave **empty**.
   - **Build Command:** `npm run build` (or leave default; the repo’s `vercel.json` uses npm).
   - **Output Directory:** `dist`.
   - **Node.js Version:** **18** or **20**.
   - **Save**.
2. **Deployments** → **⋯** on latest → **Redeploy**.
3. Wait until **Ready**, then **Visit**.

---

## Step 4: Supabase URL (so sign-in works)

- Supabase → **Authentication** → **URL configuration**.
- **Site URL:** your Vercel URL (e.g. `https://your-project.vercel.app`).
- **Redirect URLs:** add `https://your-project.vercel.app/**`.
- **Save**.

---

## Step 5: If you still see "add Supabase URL and anon key"

- Confirm **Step 2** env vars are set for **Production** and that you **Redeployed** after adding them.
- Names must be exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (no spaces, correct spelling).
- After any change to env vars, use **Deployments** → **⋯** → **Redeploy** so a new build runs with the new values.

---

You’re done when: the Vercel URL loads YunoBall, you can sign up/sign in, and you can play a game.
