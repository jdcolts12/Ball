# Push All Updates – Get Everything Live

Summary of what’s fixed and how to deploy.

---

## What Was Fixed

### 1. **Daily leaderboard “random” refresh**
- **Cause:** The leaderboard refetched every time the browser tab got focus (e.g. switching back to the tab).
- **Change:** Removed the `window focus` listener. The leaderboard now loads only when you open it or switch tabs (Daily/Monthly/Career), or when you click **Refresh**.

### 2. **Daily leaderboard not showing all users**
- **Cause:** The app only asked for 50–100 rows from the server.
- **Change:** Daily, Monthly, and Career leaderboards now request up to **500** rows so more users are shown. Use the **Refresh** button to reload.

### 3. **All updates not live**
- **Cause:** Some changes were only on your machine and never pushed.
- **Change:** All app updates are committed. You only need to **push** so Vercel can deploy.

---

## Deploy (one-time)

From your project folder, run:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push
```

If you get a network error, wait a moment and run `git push` again.

---

## After Push

1. **Vercel** will start a new deployment (1–2 minutes).
2. When it shows **Ready**, open your **production** URL.
3. Prefer an **incognito** window so you don’t see an old cached version.

---

## Supabase (leaderboard “all users”)

If the daily leaderboard still doesn’t show everyone:

1. In **Supabase** go to **SQL Editor**.
2. Run the migration that defines the leaderboard (e.g. `009_leaderboard_user_id.sql`) if you haven’t already, so the RPC exists and returns the right columns.
3. The app now passes `limit_rows: 500`; the DB will return up to 500 rows. No new migration is required for that.

---

## Checklist

- [ ] Run `git push` from the project folder.
- [ ] Wait for Vercel deployment to be **Ready**.
- [ ] Open the site in **incognito** and test:
  - [ ] One game per day (can’t start twice).
  - [ ] Daily leaderboard: open once, use **Refresh** to reload; no refresh just from switching browser tabs.
  - [ ] Daily leaderboard shows more users (up to 500).

After you push, all of these updates will be live.
