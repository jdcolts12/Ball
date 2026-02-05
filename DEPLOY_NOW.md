# Get YunoBall v2.0 Live on Vercel (one checklist)

Use this **exact order** so the site shows the latest build (timer, daily limit, badges, version label).

---

## 1. Push your code to GitHub

Your app lives in the **football-trivia** folder and that folder is the git repo.

1. Open **Terminal** (or Cursor’s terminal).
2. Go to the app folder and push:

   ```bash
   cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
   git status
   git add -A
   git commit -m "Deploy v2.0: timer, daily limit, badges, version label"
   git push origin main
   ```

   If `git` isn’t found, use **GitHub Desktop**: open the `football-trivia` folder as the repository, then **Commit** and **Push**.

3. Confirm on GitHub that the latest commit is there (refresh the repo page).

---

## 2. Set Vercel Root Directory correctly

Your **GitHub repo root** is the app (it has `package.json` and `index.html` at the top).

1. Go to [vercel.com](https://vercel.com) → your project → **Settings** → **General**.
2. Find **Root Directory**.
3. It must be **empty** (or `.`).  
   - If it’s set to `football-trivia`, **clear it** and save.  
   - Wrong root = Vercel builds the wrong thing and the site won’t update.

---

## 3. Redeploy without cache

1. In Vercel: **Deployments** tab.
2. Open the **⋯** menu on the latest deployment → **Redeploy**.
3. Check **“Redeploy with existing Build Cache”** → turn it **OFF** (uncheck).
4. Click **Redeploy** and wait until it’s **Ready**.

---

## 4. Test in a private/incognito window

Caches can make the old site stick. Test in a **new incognito/private** window:

1. Open the **live URL** (e.g. `https://your-app.vercel.app`).
2. Check:
   - **Browser tab title** is: `YunoBall – Daily NFL Trivia (v2.0)`  
   - **Home screen** shows: `Version 2.0 — Feb 2026` under the tagline  
3. If you see those two, the **new build is live**. Then test:
   - Timer on each question
   - One game per day (already-played screen with “Last played” and “Next game in”)
   - Leaderboard with Refresh and badges (if you have qualifying data)

If the tab title and version label are still old, repeat step 3 (redeploy without cache) and test again in a **new** incognito window.

---

## 5. If it still doesn’t update

- **Vercel** → **Settings** → **Environment Variables**: confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for Production.
- **Vercel** → **Deployments**: confirm the latest deployment is from the commit you just pushed (same time/message).
- Try a different browser or device in incognito to rule out local cache.

---

**Summary:** Push from `football-trivia` → Root Directory empty on Vercel → Redeploy **without** cache → Test in incognito for “v2.0” in title and “Version 2.0 — Feb 2026” on the home screen.
