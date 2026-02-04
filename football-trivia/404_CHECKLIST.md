# 404 still? Do these in order

## 1. Confirm the build succeeded

- Vercel → your project → **Deployments**
- Click the **latest** deployment (top of list)
- Status must be **Ready** (green). If it says **Error** or **Failed**, click it and read the build logs – fix the error, then redeploy
- If status is **Ready**, go to step 2

---

## 2. Confirm Vercel build settings

- **Settings** → **Build and Deployment**
- **Root Directory:** must be **empty** (your app is at repo root)
- **Build Command:** click **Override** → set to `npm run build`
- **Output Directory:** click **Override** → set to `dist`
- **Save**

---

## 3. Use the correct URL

- In the project, click **Visit** (or copy the **Production** URL from the top)
- Use that exact URL, e.g. `https://your-project-name.vercel.app`
- Do **not** use an old or preview URL like `https://football-trivia-abc123-username.vercel.app` unless that is the only one that exists

---

## 4. Push latest vercel.json and redeploy

Your repo now has `buildCommand` and `outputDirectory` in `vercel.json`. Push and let Vercel redeploy:

**In Cursor terminal (⌘ + `):**

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git add vercel.json 404_CHECKLIST.md
git commit -m "Vercel: explicit build and output"
git push
```

Then in Vercel: **Deployments** → wait for the new deployment to be **Ready** → **Visit**.

---

## 5. If still 404

Reply with:
1. **Deployment status** – Ready or Error?
2. **The exact URL** you’re opening (copy from the browser bar)
3. **Screenshot or copy** of what you see (e.g. “404 Not Found” or “Application error”)

Then we can fix it from there.
