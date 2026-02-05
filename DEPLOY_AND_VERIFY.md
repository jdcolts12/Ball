# Deploy and Verify – Site Not Updating Fix

Changes made so you can **see** when a new version is live and **stop caching** from hiding updates.

---

## What Was Changed

1. **Build ID on game screen**  
   When you play, you’ll see something like **"v 2025-01-30 12:34"** (date/time of the build).  
   - **New date/time after deploy** = new version is live.  
   - **Same old date/time** = you’re still seeing a cached version.

2. **No-cache for HTML**  
   - `index.html`: no-cache meta tags + Vercel header so the shell isn’t cached.  
   - `vercel.json`: `Cache-Control: no-cache, no-store` for `/index.html`.

3. **Timer**  
   - Still **"⏱️ TIMER: 30s"** on the game screen (unchanged).

---

## Step 1: Push to GitHub

In the project folder, run:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push
```

---

## Step 2: Vercel – Root Directory (Important)

If the repo on GitHub has the app **inside a folder** (e.g. `football-trivia/`):

1. **Vercel** → your project → **Settings** → **General**.
2. Find **Root Directory**.
3. If you see a path like `football-trivia`, leave it.
4. If the repo root is **only** the app (no subfolder), leave Root Directory **empty**.

If the site never updated before, try:

- Set **Root Directory** to `football-trivia` and save, then redeploy.  
  **or**
- Set **Root Directory** to empty and save, then redeploy.

Use whichever matches your repo layout (app in subfolder vs app at root).

---

## Step 3: Redeploy Without Cache

1. **Vercel** → your project → **Deployments**.
2. Open the **latest** deployment (from the push).
3. Click **⋯** → **Redeploy**.
4. **Uncheck** “Use existing Build Cache”.
5. Click **Redeploy**.
6. Wait until status is **Ready**.

---

## Step 4: Verify New Version (Build ID)

1. Open your site in an **incognito/private** window  
   (e.g. `Cmd+Shift+N` / `Ctrl+Shift+N`).
2. Sign in and **start a game**.
3. On the game screen, find the small **"v …"** text (build date/time), e.g. **"v 2025-01-30 12:34"**.
4. Compare with the time you just deployed:
   - **Matches** = new build is live.
   - **Older** = still cached; try another incognito window or clear cache and reload.

---

## Step 5: Confirm Timer

On the same game screen you should see:

- **⏱️ TIMER: 30s** (and countdown).
- Build ID **"v …"** (confirms which build you’re on).

If you see the **new build ID** but **no timer**, say what you do see (e.g. “no timer”, “old layout”) and we can fix the next piece.

---

## If It Still Doesn’t Update

1. **Confirm push**  
   `git log -1 --oneline` and compare with the commit Vercel shows for the latest deployment.

2. **Confirm Root Directory**  
   Vercel must build from the directory that contains `package.json` and `src/`.  
   - Repo = only app → Root Directory empty.  
   - Repo = parent folder with `football-trivia/` inside → Root Directory = `football-trivia`.

3. **Always test in incognito**  
   So browser cache doesn’t show an old build even when Vercel deployed the new one.

---

## Short Checklist

- [ ] Pushed: `git push`
- [ ] Vercel Root Directory correct (empty or `football-trivia`)
- [ ] Redeployed **without** “Use existing Build Cache”
- [ ] Opened site in **incognito**
- [ ] Started a game and checked **"v …"** build ID
- [ ] Confirmed **⏱️ TIMER: 30s** on game screen

Using the **build ID** tells you for sure whether the new changes are live or if it’s still a cache issue.
