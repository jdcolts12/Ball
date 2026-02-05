# Fix 404 – do these in order

## Step 1: Check your GitHub repo structure

Open your repo on GitHub (e.g. github.com/YourUsername/YourRepo).

**What do you see at the top level?**

**A)** You see `package.json`, `index.html`, `src`, `vercel.json` at the **top level** (no folder wrapping them).  
→ In Vercel, **Root Directory** must be **empty**. Clear it if it has a value.

**B)** You see **one folder** (e.g. `football-trivia` or `YunoBall`), and when you open it you see `package.json`, `index.html`, `src`.  
→ In Vercel, **Root Directory** = that folder name exactly (e.g. `football-trivia`).

---

## Step 2: Set Vercel build settings

Vercel → your project → **Settings** → **Build and Deployment**.

| Setting            | Set to        |
|--------------------|---------------|
| **Root Directory** | See Step 1 (empty or folder name) |
| **Framework Preset** | Other (or leave as is) |
| **Build Command**  | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

Click **Save** if you changed anything.

---

## Step 3: Push the updated vercel.json

Your project now has explicit build settings in `vercel.json`. Push to GitHub:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
git add vercel.json FIX_404_NOW.md
git commit -m "Fix Vercel 404 - explicit build config"
git push
```

---

## Step 4: Redeploy

Vercel → **Deployments** → **⋯** on latest deployment → **Redeploy**.

Wait until status is **Ready**, then click **Visit**.

---

## Step 5: If still 404 – check build logs

Vercel → **Deployments** → click the latest deployment → **Logs** (or **Building**).

- If the build **failed** (red errors), fix the error shown (e.g. missing env vars, wrong Node version).
- If the build **succeeded**, the 404 is usually **Root Directory** wrong. Double-check Step 1 and Step 2, then redeploy.

---

**Summary:** Wrong **Root Directory** is the most common cause. Match it to your GitHub structure (empty if app is at repo root, folder name if app is inside a folder).
