# Force Deploy Latest Changes

Your commit "Improve leaderboard UI and ordering, make timer smaller" is pushed to GitHub. Follow these steps to get it live on Vercel:

## Step 1: Check Latest Deployment Status

1. Go to **vercel.com** → your project → **Deployments**
2. Look at the **top deployment** (most recent)
3. Check the **commit message** — does it say "Improve leaderboard UI..."?
4. Check the **status**:
   - ✅ **Ready** (green) = deployed successfully
   - ⏳ **Building** = still deploying (wait 1-2 min)
   - ❌ **Error** = build failed (click it to see logs)

## Step 2: If Status is "Ready" but Changes Not Showing

**Force a clean redeploy:**

1. In **Deployments**, click **⋯** (three dots) on the latest deployment
2. Click **Redeploy**
3. **Uncheck** "Use existing Build Cache" (important!)
4. Click **Redeploy**
5. Wait until status is **Ready** (1-2 minutes)

## Step 3: Clear Browser Cache

After redeploy, test in a **new incognito/private window**:
- Mac: `Cmd + Shift + N`
- Windows: `Ctrl + Shift + N`

Or hard refresh:
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

## Step 4: Verify Changes Are Live

You should see:
- ✅ **Smaller timer** (small pill, thin progress bar)
- ✅ **Leaderboard fits screen** (no overflow, scrollable table)
- ✅ **Leaderboards ordered by % correct** (best to worst)

## Step 5: If Still Not Working

**Check build logs:**
1. Click the latest deployment
2. Open **Logs** or **Building** tab
3. Look for **red errors**
4. Copy any error messages and share them

**Check Vercel settings:**
1. **Settings** → **Build and Deployment**
2. **Root Directory:** should be **empty** (if package.json is at repo root)
3. **Output Directory:** should be **`dist`**
4. **Build Command:** should be **`npm run build`** (or default)

---

**Quick fix:** If nothing works, make a tiny change and push again to trigger a new deployment:
```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
echo "" >> README.md
git add README.md
git commit -m "Trigger redeploy"
git push origin main
```
