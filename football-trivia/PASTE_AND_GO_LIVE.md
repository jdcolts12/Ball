# Copy, paste, and go live

Do these in order. Replace the placeholders with your real values.

---

## 1. Get your Supabase keys (copy these somewhere)

1. Open [Supabase](https://supabase.com) → your project → **Project Settings** (gear) → **API**.
2. Copy and save:
   - **Project URL** (long URL like `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

You’ll paste these into Vercel in step 3.

---

## 2. Put your code on GitHub

**Option A – Upload in the browser (no terminal)**

1. Create a repo: [github.com](https://github.com) → **+** → **New repository** → name it (e.g. `football-trivia`) → **Create repository** (do not add README).
2. On the new repo page, click **“uploading an existing file”**.
3. On your Mac: open **Finder** → **Desktop** → **Cursor Project 1** → **football-trivia**.
4. Select everything **except** `node_modules` and `.env`. Drag those files/folders into the GitHub upload area.
5. Click **Commit changes**.
6. Confirm you see `src`, `package.json`, `index.html`, `vercel.json` in the repo.

**Option B – Terminal**

In Cursor press **⌘ + `** to open the terminal, then run (use your real GitHub URL in line 2):

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

(If it says “remote origin already exists”:  
`git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`  
then `git push -u origin main` again.)

---

## 3. Deploy on Vercel (copy-paste values)

1. Go to [vercel.com](https://vercel.com) → sign in with **GitHub**.
2. **Add New…** → **Project** → select your repo → **Import**.
3. **Before** clicking Deploy, add **Environment Variables**:

   **First variable**
   - Key (copy exactly): `VITE_SUPABASE_URL`
   - Value: paste your Supabase **Project URL**

   **Second variable**
   - Key (copy exactly): `VITE_SUPABASE_ANON_KEY`
   - Value: paste your Supabase **anon public** key

4. If your repo has the app inside a folder (e.g. you only see one folder like `football-trivia` in the repo): under **Root Directory** choose that folder (e.g. `football-trivia`). If `package.json` is at the repo root, leave Root Directory blank.
5. Click **Deploy**. Wait until it finishes.
6. Click **Visit**. That’s your live URL (e.g. `https://football-trivia-xxx.vercel.app`).

**If you get 404:**  
Vercel → your project → **Settings** → **General** → **Root Directory**. Set it to the folder that contains `package.json` and `index.html` (e.g. `football-trivia`), then **Redeploy** from the **Deployments** tab.

---

## 4. Tell Supabase your live URL (copy-paste)

1. Supabase → **Authentication** → **URL configuration**.
2. **Site URL:** paste your Vercel URL, e.g.:
   ```
   https://football-trivia-xxx.vercel.app
   ```
3. **Redirect URLs:** add (same URL + `/**`):
   ```
   https://football-trivia-xxx.vercel.app/**
   ```
4. **Save**.

---

## 5. You’re live

Open your Vercel URL in the browser. Sign up or sign in and play.

---

## Quick reference

| What | Where |
|------|--------|
| Supabase Project URL | Supabase → Project Settings → API |
| Supabase anon key | Same page, “anon public” |
| GitHub repo URL | github.com → your repo → Code → copy HTTPS |
| Live site URL | Vercel dashboard after Deploy → Visit |
