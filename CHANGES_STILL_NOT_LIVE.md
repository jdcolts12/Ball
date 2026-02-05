# Changes Still Not Live – Fix It Step by Step

Your code is committed. To see it live you must **push**, then make sure **Vercel** is building the right repo and **you’re testing the right URL** without cache.

---

## Step 1: Push (do this first)

In Terminal, from the project folder:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push
```

If you see `Everything up-to-date`, your latest commit is already on GitHub. If you see a network error, wait and run `git push` again.

---

## Step 2: Check Vercel is using this repo

1. Go to **[vercel.com](https://vercel.com)** → your project.
2. **Settings** → **Git**.
3. Confirm:
   - **Repository:** `jdcolts12/Ball` (or your real repo).
   - **Production Branch:** `main`.

If it’s a different repo or branch, connect the correct one.

---

## Step 3: Set Root Directory correctly

Vercel must build from the folder that contains **package.json** and **src/**.

1. **Vercel** → your project → **Settings** → **General**.
2. Find **Root Directory**.
3. Choose one and **Save**:
   - If on GitHub the **root** of the repo has `package.json` and `src/` → leave Root Directory **empty**.
   - If on GitHub the app is in a **subfolder** (e.g. `football-trivia/`) → set Root Directory to **`football-trivia`** (no leading slash).

Wrong Root Directory is a very common reason “changes aren’t live.”

---

## Step 4: Trigger a new build (no cache)

1. **Vercel** → your project → **Deployments**.
2. Open the **latest** deployment (top of the list).
3. Click **⋯** (three dots) → **Redeploy**.
4. **Uncheck** “Use existing Build Cache”.
5. Click **Redeploy**.
6. Wait until status is **Ready** (about 1–2 minutes).

---

## Step 5: Use the real production URL

1. On the **Deployments** page, click **Visit** on the **production** deployment (or copy the **Production** URL from the top of the project).
2. The URL should look like: `https://your-project.vercel.app` (not a long preview URL with a hash).
3. Use **this exact URL** when testing.

---

## Step 6: Test in incognito (no cache)

1. Open a **new incognito/private** window:  
   Mac: `Cmd+Shift+N` (Chrome) · Windows: `Ctrl+Shift+N`
2. Paste the **production URL** from Step 5.
3. Check:
   - **Browser tab title:** “YunoBall – Daily NFL Trivia **(Jan 2026)**”
   - **Home screen:** Under the main text you should see:  
     **“Updated Jan 2026 — timer, leaderboard, one game per day”**

If you see that line and the new title, the new build **is** live. Then you can confirm:
- Timer: just the number in a pill (no “TIMER” text).
- One game per day: after one game, you can’t start again.
- Leaderboard: Refresh button and more rows.

---

## If you still don’t see the new text

Answer these and we can narrow it down:

1. After **Step 1**, does `git push` say “Everything up-to-date” or show a new push?
2. In **Step 4**, what is the **commit message** (or commit hash) of the deployment that you redeployed? It should match your latest commit (e.g. “Visible update label…” or “Timer UI, leaderboard…”).
3. In **Step 3**, what is **Root Directory** set to right now? (empty or a folder name)
4. What **exact URL** are you opening? (copy from the address bar)
5. Are you testing in an **incognito/private** window? (Yes/No)

---

## Summary

1. **Push** from the project folder.
2. **Vercel** → correct **repo/branch** and **Root Directory**.
3. **Redeploy** the latest deployment **without** “Use existing Build Cache”.
4. Open the **production** URL in **incognito** and look for **“Updated Jan 2026”** and the new tab title.

The “Updated Jan 2026” line is only in the new build; if you see it, your changes are live.
