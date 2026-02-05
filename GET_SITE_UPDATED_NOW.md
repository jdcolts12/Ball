# Get Site Updated - Quick Steps

Your timer and username changes are committed ✅. Here's how to get them live:

---

## Option 1: Manual Vercel Redeploy (FASTEST - No Git Push Needed)

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com](https://vercel.com) → Sign in
   - Click your **football-trivia** project

2. **Redeploy:**
   - Click **Deployments** tab
   - Find the **latest deployment** (top of list)
   - Click **⋯** (three dots) → **Redeploy**
   - **Uncheck** "Use existing Build Cache"
   - Click **Redeploy**
   - Wait 1-2 minutes for status to show **Ready**

3. **Visit Site:**
   - Click **Visit** button
   - **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## Option 2: Push Empty Commit (When Network Works)

When your internet is working:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git push
```

This will trigger Vercel to auto-deploy.

---

## Verify Changes Are Live

After deployment:

1. **Open your live site**
2. **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. **Test timer:**
   - Sign in → Start game
   - Should see **30-second countdown** on each question
4. **Test username:**
   - Try signing up with existing username
   - Should see **"username already taken"** error

---

## Why Hard Refresh?

Your browser caches the old version. Hard refresh forces it to load the new code.

---

**Try Option 1 first - it's the fastest way to get updates live!** 🚀
