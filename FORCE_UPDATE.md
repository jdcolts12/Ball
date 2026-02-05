# Force Site to Update - Cache Issue Fix

Deployment is successful ✅, but site isn't showing new changes. This is a **cache issue**.

---

## 🔄 Step 1: Hard Refresh Browser

**This clears your browser cache:**

### Mac:
- **Chrome/Edge:** `Cmd + Shift + R`
- **Safari:** `Cmd + Option + R`
- **Firefox:** `Cmd + Shift + R`

### Windows:
- **Chrome/Edge/Firefox:** `Ctrl + Shift + F5` or `Ctrl + F5`

### Or Use DevTools:
1. **Open DevTools:** Press `F12` or Right-click → Inspect
2. **Right-click the refresh button** (in browser toolbar)
3. **Click "Empty Cache and Hard Reload"**

---

## 🆕 Step 2: Test in Incognito/Private Window

**This bypasses ALL cache:**

1. **Open a new incognito/private window:**
   - Mac: `Cmd + Shift + N` (Chrome) or `Cmd + Shift + P` (Safari)
   - Windows: `Ctrl + Shift + N`
2. **Go to your live site**
3. **Sign in** → **Start game**
4. **Do you see the 30-second timer?**
   - ✅ YES → It's working! Your browser was caching the old version.
   - ❌ NO → Go to Step 3

---

## 🚀 Step 3: Force New Deployment

**Even if deployment shows "Ready", trigger a fresh one:**

1. **Vercel → Deployments**
2. Click **⋯** on latest deployment → **Redeploy**
3. **UNCHECK** ✅ "Use existing Build Cache"
4. Click **Redeploy**
5. Wait 2-3 minutes
6. **Test in incognito window** (Step 2)

---

## 🔍 Step 4: Verify Latest Commit is Deployed

**Check if Vercel is using the latest code:**

1. **Vercel → Deployments** → Click latest deployment
2. **Look for commit hash** (should show something like `0a05c1d`)
3. **Compare with your latest commit:**
   ```bash
   git log --oneline -1
   ```
4. **Do they match?**
   - ✅ YES → Code is deployed, it's a cache issue (use Step 1-2)
   - ❌ NO → Vercel hasn't deployed latest (use Step 3)

---

## 🎯 Step 5: Clear Service Worker Cache (If Using)

**If your app uses a service worker:**

1. **Open DevTools** (F12)
2. **Application tab** → **Service Workers**
3. **Click "Unregister"** if any are registered
4. **Hard refresh** (Step 1)

---

## ✅ Verify Changes Are Live

**After clearing cache, test:**

1. **Open site in incognito window**
2. **Sign in** → **Start game**
3. **Look for:**
   - ✅ **30-second countdown timer** on each question
   - ✅ **Timer turns red** when ≤5 seconds
   - ✅ **Timer turns amber** when ≤10 seconds

**Test username uniqueness:**
- Try signing up with an existing username
- Should see **"This username is already taken"** error

---

## 🔧 If Still Not Working

**Tell me:**
1. **What commit hash does Vercel show?** (Click deployment → see commit)
2. **What's your latest commit?** (Run `git log --oneline -1`)
3. **Do you see the timer in incognito?** (Yes/No)
4. **What URL are you checking?** (Copy from browser)

---

## 💡 Why This Happens

- **Browser cache** stores old JavaScript/CSS files
- **CDN cache** (Vercel) might serve old files
- **Service workers** cache app files

**Solution:** Hard refresh + incognito window = fresh version!

---

**Try Step 2 (incognito window) FIRST - that's the fastest test!** 🚀
