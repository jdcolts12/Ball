# Fix: None of the Updates Are Live

If the site looks exactly the same and none of the recent updates are there, **Vercel is almost certainly building the wrong folder.** Do these steps in order.

---

## Step 1: See What GitHub Has

1. Go to **https://github.com/jdcolts12/Ball** (or your repo URL).
2. Look at the **top level** of the repo.
3. **Do you see `package.json` and a folder named `src` at the top?**
   - **YES** → Your app is at the **root**. Use **Step 2A**.
   - **NO** → You probably see **one folder** (e.g. `football-trivia`). Your app is **inside that folder**. Use **Step 2B**.

---

## Step 2A: App at Repo Root

1. **Vercel** → your project → **Settings** → **General**.
2. Find **Root Directory**.
3. It must be **empty** (no value).
4. If it had a value (e.g. `football-trivia`), **clear it** and click **Save**.

---

## Step 2B: App Inside a Folder

1. **Vercel** → your project → **Settings** → **General**.
2. Find **Root Directory**.
3. Click **Edit** and set it to the **folder that contains `package.json`** (e.g. `football-trivia`). No leading slash.
4. Click **Save**.

---

## Step 3: Redeploy (No Cache)

1. **Vercel** → your project → **Deployments**.
2. Click the **⋮** (three dots) on the **latest** deployment.
3. Click **Redeploy**.
4. **Uncheck** “Use existing Build Cache”.
5. Click **Redeploy**.
6. Wait until status is **Ready** (1–2 minutes).

---

## Step 4: Push (If You Haven’t Lately)

In Terminal:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
/usr/bin/git push
```

---

## Step 5: Test in Incognito

1. Open a **new incognito window** (`Cmd+Shift+N`).
2. Go to your **production** URL (from Vercel **Visit**).
3. **Check the browser tab title:** it should say **“YunoBall – Daily NFL Trivia (v2.0)”**.
4. **Check the home screen:** you should see **“Version 2.0 — Feb 2026”** under the subtitle.

**If you see “Version 2.0” and the new title** → the new build is live. Then check timer, one game per day, badges, etc.

**If you still don’t see that** → Root Directory is still wrong. Try the other option (empty vs. `football-trivia`) and redeploy again.

---

## Summary

| Step | What to do |
|------|------------|
| 1 | Check GitHub: is `package.json` at repo root or inside a folder? |
| 2 | Vercel → Settings → General → **Root Directory**: empty if app at root, or folder name (e.g. `football-trivia`) if app in folder. Save. |
| 3 | Deployments → ⋮ → Redeploy → **uncheck** “Use existing Build Cache” → Redeploy. |
| 4 | Run `git push` from the project folder. |
| 5 | Open site in **incognito** and look for **“Version 2.0”** and new tab title. |

Wrong **Root Directory** is why updates don’t show. Fix that, redeploy without cache, then test in incognito.
