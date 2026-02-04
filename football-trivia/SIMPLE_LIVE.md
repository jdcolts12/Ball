# Get YunoBall Live – Simple Steps

Follow these **in order**. Don't skip any.

---

## Step 1: Push code to GitHub

**1a. Get your GitHub repo URL**
- Open **github.com** → your repo → green **Code** button → copy the **HTTPS** URL (e.g. `https://github.com/YourUsername/football-trivia.git`)

**1b. In Cursor terminal (⌘ + `), run these 3 lines:**

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git remote add origin YOUR_GITHUB_URL_HERE
git push -u origin main
```

*(Replace `YOUR_GITHUB_URL_HERE` with the URL from 1a. If it says "remote already exists", run `git remote set-url origin YOUR_GITHUB_URL_HERE` first, then `git push -u origin main`)*

**1c. Check:** Refresh your GitHub repo page. You should see `package.json`, `src`, `index.html`, etc.

---

## Step 2: Vercel settings

**2a. Root Directory**
- Vercel → your project → **Settings** → **General** (or **Build and Deployment**)
- **Root Directory:** leave **empty** (clear any value)
- **Save**

**2b. Environment Variables**
- **Settings** → **Environment Variables**
- Add:
  - **Key:** `VITE_SUPABASE_URL` → **Value:** your Supabase Project URL
  - **Key:** `VITE_SUPABASE_ANON_KEY` → **Value:** your Supabase anon public key
- Check **Production** for both
- **Save**

---

## Step 3: Deploy

**3a. Redeploy**
- **Deployments** → **⋯** on latest → **Redeploy**
- Wait until **Ready** (1-2 min)

**3b. Visit**
- Click **Visit** (or the URL shown)
- You should see YunoBall!

---

## Step 4: Supabase URL (so sign-in works)

- Supabase → **Authentication** → **URL configuration**
- **Site URL:** your Vercel URL (e.g. `https://your-project.vercel.app`)
- **Redirect URLs:** add `https://your-project.vercel.app/**`
- **Save**

---

## Done!

Open your Vercel URL, sign up, and play. You're live!

**If you see 404:** Check **Deployments** → latest → **Logs**. If build failed, fix the error shown. If build succeeded, Root Directory might be wrong - set it to **empty** and redeploy.

**If you see "add Supabase URL":** Make sure Step 2b env vars are set and you **redeployed** after adding them.
