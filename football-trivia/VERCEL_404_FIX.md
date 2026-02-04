# Fix 404 on Vercel – follow exactly

Do these in order. The build works locally, so the issue is Vercel settings.

---

## 1. Check if the build succeeded on Vercel

1. Vercel → your project → **Deployments**.
2. Click the **latest deployment** (top of the list).
3. Look at the status:
   - **Ready** (green) = build succeeded.
   - **Error** or **Failed** (red) = build failed.

4. Click **View Function Logs** or **Building** / **Logs** and scroll. Do you see any **red errors**?
   - If **yes** → copy the error message and fix it (e.g. missing env var, Node version). Then redeploy.
   - If **no** and status is Ready → go to step 2.

---

## 2. Override build settings in Vercel (don’t rely on auto-detect)

1. Vercel → your project → **Settings** → **Build and Deployment**.
2. Find **Build Command**. Click **Override** (or Edit).
3. Set **Build Command** to: `npm run build`
4. Find **Output Directory**. Click **Override**.
5. Set **Output Directory** to: `dist`
6. **Root Directory** = leave **empty** (your app is at repo root).
7. Click **Save**.

---

## 3. Redeploy without cache

1. Go to **Deployments**.
2. Click **⋯** (three dots) on the **latest** deployment.
3. Click **Redeploy**.
4. If you see **Use existing Build Cache** → **uncheck** it (do a clean build).
5. Confirm **Redeploy**.
6. Wait until status is **Ready** (1–2 min).
7. Click **Visit**.

---

## 4. Use the correct URL

- Use the **production** URL from the Vercel dashboard, e.g. `https://your-project-name.vercel.app`.
- Don’t use a long preview URL like `https://football-trivia-xxx-username.vercel.app` unless that’s your only deployment. Prefer the short production domain.

---

## 5. If still 404

Reply with:
1. **Build status** – Ready or Error?
2. **Any red errors** in the build logs? (copy the exact line.)
3. **The exact URL** you’re opening (e.g. `https://...vercel.app`).

The `vercel.json` in your repo now only has **rewrites** (all routes → index.html). Build command and output directory should be set in the Vercel dashboard (step 2) so they’re not overridden.
