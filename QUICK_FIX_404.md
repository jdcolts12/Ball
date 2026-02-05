# Quick fix for 404 – do these 3 things

## 1. Check build logs (most important)

In Vercel: **Deployments** → click the latest deployment → open **Logs** (or **Building** tab).

**Did the build succeed?**
- ✅ **Yes** (green, says "Ready") → go to step 2.
- ❌ **No** (red errors) → fix the error shown. Common issues:
  - Missing env vars → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Settings** → **Environment Variables**.
  - Build command failed → check the error message.

---

## 2. Check Root Directory

In Vercel: **Settings** → **Build and Deployment** → **Root Directory**.

**On GitHub, when you open your repo:**
- Do you see **package.json** at the **top level** (no folder)? → Root Directory = **empty** (delete any value).
- Do you see **one folder** (e.g. `football-trivia`) and **package.json** inside it? → Root Directory = **football-trivia** (or that folder name).

**Save** if you changed it.

---

## 3. Check Output Directory

Same page: **Output Directory** must be **`dist`**.

**Save** if you changed it.

---

## 4. Redeploy

- **Deployments** → **⋯** on latest → **Redeploy**.
- Wait until **Ready**, then **Visit**.

---

**If still 404 after this:**

1. **Push the updated vercel.json** to GitHub (simplified rewrites).
2. In Vercel: **Deployments** → **⋯** → **Redeploy** (so it pulls the new vercel.json).

The updated vercel.json has simpler rewrites that should work.
