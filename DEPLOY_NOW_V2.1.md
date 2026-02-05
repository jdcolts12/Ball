# DEPLOY VERSION 2.1 NOW

## Step 1: Push to GitHub

Run this in your terminal (or use GitHub Desktop):

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push origin main
```

**If it asks for authentication:** Use a GitHub Personal Access Token (not your password).

---

## Step 2: Verify Deployment

After pushing, Vercel should automatically start deploying. Check:

1. **Go to vercel.com** → Sign in
2. **Click your project** (YunoBall or football-trivia)
3. **Click "Deployments" tab** (top menu)
4. **Look for commit:** "Version 2.1 - Leaderboard and timer fixes - FORCE DEPLOY"
5. **Wait for status:** Should say "Building" then "Ready" (1-2 minutes)

---

## Step 3: Test the New Version

**Open your site in a NEW incognito window** (to bypass cache):
- Mac: `Cmd + Shift + N`
- Windows: `Ctrl + Shift + N`

**You should see:**
- ✅ **Title bar:** "YunoBall – Daily NFL Trivia (v2.1)"
- ✅ **Home page:** "Version 2.1 — Leaderboard & Timer Fix"
- ✅ **Timer:** Small pill (not large)
- ✅ **Leaderboard:** Fits screen, scrollable table

---

## If Vercel Doesn't Auto-Deploy

**Manual trigger:**

1. In Vercel → Your project → **Settings** → **Git**
2. Make sure your GitHub repo is connected
3. Go to **Deployments** → Click **"Create Deployment"**
4. Select branch: **main**
5. Click **Deploy**

---

## If Changes Still Don't Show

**Clear Vercel cache:**

1. **Deployments** → Click **⋯** on latest deployment
2. Click **Redeploy**
3. **UNCHECK** "Use existing Build Cache"
4. Click **Redeploy**
5. Wait for "Ready" status

---

## Quick Verification

**The new version is live when you see:**
- Browser tab title: **"YunoBall – Daily NFL Trivia (v2.1)"**
- Home page shows: **"Version 2.1 — Leaderboard & Timer Fix"**

If you see "v2.0" or "Version 2.0", the old version is still cached. Try incognito mode or wait 5 minutes for cache to clear.
