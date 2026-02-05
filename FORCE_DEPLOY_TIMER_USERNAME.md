# Force Deploy Timer & Username Changes

Your code is pushed to GitHub ✅. Now let's make sure Vercel deploys it.

---

## Step 1: Check Vercel Deployment Status

1. Go to [vercel.com](https://vercel.com) → Sign in
2. Click your **football-trivia** project
3. Go to **Deployments** tab
4. Look at the **latest deployment** (top of list):
   - ✅ **Ready** (green) = Deployed successfully
   - ⏳ **Building** = Still deploying (wait 1-2 min)
   - ❌ **Error** = Build failed (check logs)

---

## Step 2: If Deployment is Ready but Site Not Updated

**Option A: Hard Refresh Browser**
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`
- This clears cache and loads the new version

**Option B: Manual Redeploy**
1. Vercel → **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. **Uncheck** "Use existing Build Cache" (clean build)
5. Click **Redeploy**
6. Wait for status to be **Ready** (1-2 min)
7. Click **Visit**

---

## Step 3: Verify Changes Are Live

1. Open your live site
2. **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. **Test timer:**
   - Sign in → Start game
   - Should see **30-second countdown** timer on each question
4. **Test username:**
   - Try signing up with an existing username
   - Should see **"This username is already taken"** error

---

## Step 4: If Still Not Working

**Check these:**

1. **Are you on the right URL?**
   - Use the **Production** URL from Vercel dashboard
   - Not a preview URL

2. **Is the build successful?**
   - Vercel → Deployments → Latest → Check logs for errors

3. **Are environment variables set?**
   - Vercel → Settings → Environment Variables
   - Should have `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Quick Fix: Trigger New Deployment

If nothing works, create an empty commit to trigger deployment:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

Then wait 1-2 minutes and check Vercel → Deployments.

---

**Your commits are pushed ✅ - Vercel should auto-deploy. If not, manually redeploy!**
