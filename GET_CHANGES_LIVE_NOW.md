# Get Changes Live – Why Redeploy Didn’t Update

**What’s going on:** The changes (timer, leaderboard, daily limit) were only on your machine. They were **not committed or pushed**, so Vercel was redeploying the **old** code.

**What’s done:** Those changes are now **committed** locally. You only need to **push** so Vercel can build and deploy the new code.

---

## Step 1: Push to GitHub

In the project folder, run:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push
```

If you get a network error, wait a moment and run `git push` again.

---

## Step 2: Let Vercel Deploy

1. Go to [vercel.com](https://vercel.com) → your project → **Deployments**.
2. A **new deployment** should start automatically (triggered by the push).
3. Wait until its status is **Ready** (about 1–2 minutes).

---

## Step 3: Test in Incognito

So you don’t see an old cached version:

1. Open a **new incognito/private** window (`Cmd+Shift+N` on Mac, `Ctrl+Shift+N` on Windows).
2. Open your live site (use the URL from Vercel’s “Visit”).
3. Sign in and check:
   - **Timer:** Just the number in a pill (no “TIMER” text).
   - **Daily limit:** After one game, you see “already played” and can’t start again.
   - **Leaderboard:** “Refresh” button and more rows (up to 100).

---

## Why This Happens

- **Redeploy in Vercel** = “Build and deploy again using whatever is on GitHub.”
- If you never **push** your latest commits, GitHub (and so Vercel) still has the old code.
- So: **commit** (done) → **push** (you do this) → Vercel gets new code and deploys it.

---

## Checklist

- [ ] Run `git push` from the project folder.
- [ ] Wait for the new Vercel deployment to show **Ready**.
- [ ] Open the site in an **incognito** window and confirm timer, daily limit, and leaderboard.

After you push, the new deployment will include the timer, leaderboard, and server-side daily limit.
