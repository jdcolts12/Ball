# Get YunoBall live – do these in order

All code fixes are committed. Do **Step 1** and **Step 2** below.

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

## Step 2: Vercel settings and redeploy

1. Open **vercel.com** → your project → **Settings**.
2. **General** (or **Build and Deployment**):
   - **Root Directory:** leave **empty** (your app is at repo root).
   - **Build Command:** override to `npm run build` if you see an Override option.
   - **Output Directory:** override to `dist` if you see an Override option.
   - **Node.js Version:** set to **18** or **20** if you see it.
   - **Save**.
3. **Deployments** → click **⋯** on the latest deployment → **Redeploy**.
4. Wait until status is **Ready**, then click **Visit**.

---

## Step 3: Supabase URL (so sign-in works)

- Supabase → **Authentication** → **URL configuration**.
- **Site URL:** your Vercel URL (e.g. `https://your-project.vercel.app`).
- **Redirect URLs:** add `https://your-project.vercel.app/**`.
- **Save**.

---

## Step 4: Env vars (if you still see "add Supabase URL and anon key")

- Vercel → **Settings** → **Environment Variables**.
- Add **VITE_SUPABASE_URL** = your Supabase Project URL.
- Add **VITE_SUPABASE_ANON_KEY** = your Supabase anon public key.
- **Save**, then **Deployments** → **⋯** → **Redeploy**.

---

You’re done when: the Vercel URL loads YunoBall, you can sign up/sign in, and you can play a game.
