# Deploy to production (Vercel)

**Why you see “A more recent Production Deployment has been created…”**  
That message appears when you try to **Redeploy** an **old** deployment in the Vercel dashboard. Vercel only lets you redeploy the **latest** deployment for that branch.

**Correct way to get new code live:**

1. Open a terminal and go into the app folder:
   ```bash
   cd football-trivia
   ```
2. Commit your changes (if you haven’t already):
   ```bash
   git add -A
   git commit -m "Your message"
   ```
3. Push to trigger a new Vercel deployment:
   ```bash
   npm run deploy
   ```
   Or: `git push origin main`

Each push to `main` creates a **new** production deployment. You don’t need to use the Redeploy button in Vercel.

**From Cursor:** You can use **Source Control** (Commit + Sync/Push) instead of the terminal; pushing from there also triggers a new deployment.
