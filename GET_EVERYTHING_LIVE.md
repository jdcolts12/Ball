# Get Everything Live – 3 Steps

Do these in order. Nothing else.

---

## Step 1: Push to GitHub

Open **Terminal** in Cursor (press `` Ctrl + ` ``), then run:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
/usr/bin/git push
```

If you see **"Everything up-to-date"** → you're done with Step 1; go to Step 2.

If you see a **network error** → wait 30 seconds and run the same command again.

---

## Step 2: Let Vercel Deploy

1. Go to **[vercel.com](https://vercel.com)** and open your project.
2. Open the **Deployments** tab.
3. The **top** deployment is the latest. Wait until its status is **Ready** (about 1–2 minutes).
4. If there’s no new deployment after your push, wait 1 minute and refresh the page.

---

## Step 3: Test in Incognito

1. Open a **new incognito/private window** (`Cmd+Shift+N` on Mac, `Ctrl+Shift+N` on Windows).
2. Go to your **live site** (use the **Visit** link from Vercel or your production URL).
3. Check that you see:
   - **Timer** (number in a pill, no “TIMER” text)
   - **One game per day** (can’t start a second game today)
   - **Leaderboard** with **badges** (🏆 perfect, 🔥 streak, 💎/⭐/🏅 career)
   - **“Already played” screen** with **Last played** and **Next game in** countdown
   - **View Leaderboard** at the top of the already-played screen

---

## If the Site Still Looks Old

- **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows).
- Or open the site again in a **new incognito** window.

---

## Summary

| Step | What to do |
|------|------------|
| 1 | Run `git push` in Terminal |
| 2 | Vercel → Deployments → wait for **Ready** |
| 3 | Open site in **incognito** and test |

That’s it. Push → wait for Vercel → test in incognito.
