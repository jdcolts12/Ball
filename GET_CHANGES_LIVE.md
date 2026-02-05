# Get Timer & Username Changes Live - Checklist

Follow these steps in order to make your changes live.

---

## ✅ Step 1: Verify Code is Pushed to GitHub

1. Open your browser and go to: **https://github.com/jdcolts12/Ball**
2. Check if you see the latest commit: **"Add 30s timer and username uniqueness enforcement"**
3. Check if you see the file: **`supabase/migrations/010_username_availability_check.sql`**

**If the commit is NOT there:**
```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push
```

**If push fails** (authentication error):
- Use a Personal Access Token instead of password
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- Use the token as your password when Git asks

---

## ✅ Step 2: Run Database Migration (CRITICAL)

**This is required for username uniqueness to work!**

1. Go to **[supabase.com](https://supabase.com)** → your project
2. Click **SQL Editor** → **+ New query**
3. Open this file in Cursor: `supabase/migrations/010_username_availability_check.sql`
4. **Copy ALL** (Cmd+A, then Cmd+C)
5. **Paste** into Supabase SQL Editor
6. Click **Run** (or Cmd+Enter)
7. You should see: **Success. No rows returned** ✅

**Without this step, username checking won't work!**

---

## ✅ Step 3: Trigger Vercel Redeploy

Vercel should auto-deploy when you push, but if it didn't:

### Option A: Manual Redeploy
1. Go to **[vercel.com](https://vercel.com)** → your project
2. Click **Deployments** tab
3. Click **⋯** (three dots) on the latest deployment
4. Click **Redeploy**
5. Wait 1-2 minutes for it to finish

### Option B: Push a Small Change
```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

---

## ✅ Step 4: Check Vercel Build Status

1. Go to **Vercel** → your project → **Deployments**
2. Click the **latest deployment**
3. Check the status:
   - ✅ **Ready** (green) = Success! Go to Step 5
   - ❌ **Error** (red) = Check logs and fix errors

**If build failed:**
- Click **View Function Logs** or **Logs**
- Look for red error messages
- Common issues:
  - Missing environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - Build command errors
  - Node version issues

---

## ✅ Step 5: Test the Changes

### Test Timer:
1. Open your live site (e.g. `https://your-app.vercel.app`)
2. Sign in
3. Start a game
4. **Look for:** Timer counting down from 30s in top-right corner
5. **Wait 30 seconds** without answering → should auto-answer as wrong
6. **Answer quickly** → timer should stop

### Test Username Uniqueness:
1. Try to **sign up** with a username that already exists
2. **Should see:** "This username is already taken. Please choose a different username."
3. Try a **unique username** → should work ✅

---

## 🔍 Troubleshooting

### Timer not showing?
- **Clear browser cache:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- **Check browser console:** Press F12 → Console tab → look for errors
- **Verify code is deployed:** Check Vercel deployment logs

### Username check not working?
- **Did you run the migration?** (Step 2) - This is required!
- **Check Supabase:** SQL Editor → Functions → should see `check_username_available`
- **Check browser console** for errors

### Changes not appearing?
1. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Check Vercel deployment:** Make sure latest deployment is "Ready"
3. **Check GitHub:** Verify your commit is on GitHub
4. **Wait 1-2 minutes:** Vercel deployments take time

### Build failing on Vercel?
- **Check environment variables:** Vercel → Settings → Environment Variables
  - Must have: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Check build logs:** Vercel → Deployments → Latest → Logs
- **Check Node version:** May need to set in `package.json` or `.nvmrc`

---

## 📋 Quick Checklist

- [ ] Code pushed to GitHub (commit visible on GitHub)
- [ ] Database migration run (010_username_availability_check.sql)
- [ ] Vercel deployment is "Ready" (green status)
- [ ] Timer appears when playing game
- [ ] Username uniqueness works (can't use taken username)

---

**If you're still stuck, tell me:**
1. What step are you on?
2. What error messages do you see?
3. What's the status of your Vercel deployment?
