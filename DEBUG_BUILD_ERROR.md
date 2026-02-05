# Debug "npm run build" exit code 254

Exit code 254 is unusual. We need to see the **actual error message** from Vercel.

---

## Step 1: Get the error message

1. Go to **Vercel** → your project → **Deployments**.
2. Click the **latest deployment** (the one that failed).
3. Click **Building** or **Logs** (or expand the build section).
4. Scroll through the logs and find any **red error messages**.
5. **Copy the exact error text** (the last few lines before it says "Command exited with 254").

Common things to look for:
- TypeScript errors (e.g. "Property 'X' does not exist")
- Missing dependencies (e.g. "Cannot find module")
- Environment variable errors
- Node version issues
- File not found errors

---

## Step 2: Common fixes based on error

### If you see TypeScript errors:
- The code on GitHub might be different from local
- Make sure `src/lib/dailyGameQuestions.ts` has `position: string;` in `CareerPathQuestion` type
- Push the latest code to GitHub

### If you see "Cannot find module" or missing dependencies:
- Make sure `package-lock.json` is committed to GitHub
- Vercel might need `npm ci` instead of `npm install`

### If you see environment variable errors:
- Vite should handle missing env vars gracefully, but check if there's a build-time check failing

### If you see Node version errors:
- Make sure Vercel is using Node 18 or 20
- Check **Settings** → **Build and Deployment** → **Node.js Version**

---

## Step 3: Try a clean build

1. **Deployments** → **⋯** on latest → **Redeploy**.
2. **Uncheck** "Use existing Build Cache" (do a clean build).
3. Click **Redeploy**.
4. Watch the build logs in real-time.

---

**Please share the exact error message from the Vercel build logs** so we can fix it.
