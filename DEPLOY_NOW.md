# Get fixes live

## 1. Run SQL in Supabase (Database)

In **Supabase → SQL Editor**, run these **in order** (copy entire file, paste, Run):

1. **Daily leaderboard (show everyone who played today)**  
   Open `supabase/RUN_DAILY_LEADERBOARD_FIX.sql` → copy all → paste in SQL Editor → Run.

2. **Career tab (order from top % to lowest %)**  
   Open `supabase/RUN_CAREER_LEADERBOARD_ORDER.sql` → copy all → paste in SQL Editor → Run.

## 2. Deploy the app (Vercel)

From the project folder, push to GitHub so Vercel can deploy:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push origin main
```

If Vercel is connected to this repo, a production deploy will start automatically.

**Or** deploy from the CLI:

```bash
npx vercel --prod
```

(Use `vercel login` first if needed.)

## 3. Hard refresh

After deploy, do a hard refresh (or open in incognito) on the live URL so you get the new JS.
