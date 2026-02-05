# Get YunoBall Live — Simple Steps

Do these in order. You’re not done until you can open a URL and play the game.

---

## Step 1: Put your code on GitHub

**1a.** Open [github.com](https://github.com) and sign in.

**1b.** Create a new repo:
- Click the **+** (top right) → **New repository**
- **Repository name:** e.g. `football-trivia` or `yunoball`
- Leave “Add a README” **unchecked**
- Click **Create repository**

**1c.** Copy the repo URL GitHub shows (looks like `https://github.com/YOUR_USERNAME/REPO_NAME.git`).

**1d.** On your Mac, open **Terminal** (or use the terminal inside Cursor: **Terminal → New Terminal**).

**1e.** Run these lines one at a time (replace the URL with yours from 1c):

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

- If it says “remote origin already exists,” run:  
  `git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git`  
  then run `git push -u origin main` again.
- If it asks to sign in, use your GitHub username and a **Personal Access Token** as the password (not your GitHub password). Create one at: GitHub → Settings → Developer settings → Personal access tokens.

**1f.** Refresh the repo page on GitHub. You should see folders like `src`, `supabase` and files like `package.json`. If you do, Step 1 is done.

---

## Step 2: Deploy on Vercel

**2a.** Open [vercel.com](https://vercel.com) and sign in with **GitHub**.

**2b.** Click **Add New…** → **Project**.

**2c.** Find your repo (e.g. `football-trivia`) in the list and click **Import**.

**2d.** Before clicking Deploy, add **Environment Variables**:
- Click **Environment Variables** (or expand it).
- Add **Key:** `VITE_SUPABASE_URL`  
  **Value:** your Supabase Project URL (from Supabase → Project Settings → API).
- Add **Key:** `VITE_SUPABASE_ANON_KEY`  
  **Value:** your Supabase anon public key (same API page).

**2e.** Click **Deploy**. Wait until it says the deployment is ready.

**2f.** Click **Visit** (or the URL shown). That’s your live site. You should see the YunoBall app.

---

## Step 3: Tell Supabase your live URL

**3a.** In Supabase: **Authentication** → **URL configuration**.

**3b.** Set **Site URL** to your Vercel URL (e.g. `https://football-trivia-xxx.vercel.app`).

**3c.** Under **Redirect URLs**, add:  
`https://YOUR-VERCEL-URL/**`  
(use your real Vercel URL; the `/**` at the end is required).

**3d.** Save.

---

## Step 4: Test

Open your Vercel URL, sign up or sign in, and play a game. If login or redirect fails, double-check Step 3 (Supabase URL configuration).

---

**Quick reference**

| What you need | Where to get it |
|---------------|------------------|
| Supabase Project URL | Supabase → Project Settings → API |
| Supabase anon key | Same page (anon public) |
| GitHub repo URL | github.com → your repo → Code → copy HTTPS URL |
| Live site URL | Vercel dashboard after deploy |
