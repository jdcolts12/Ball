# Fix "vite build exited with 127"

Exit 127 = command not found. Vercel isn't installing dependencies before building.

---

## Fix 1: Push updated vercel.json

I've added `installCommand` to vercel.json. **Upload this file to GitHub** (or push if you're using git).

The file is at: `/Users/joeydias/Desktop/Cursor Project 1/football-trivia/vercel.json`

---

## Fix 2: Set Install Command in Vercel

1. **Vercel** → your project → **Settings** → **Build and Deployment** (or **General**)
2. Find **Install Command**
3. Set it to: `npm install`
4. **Save**

---

## Fix 3: Set Node Version

Same page:
- **Node.js Version:** set to **18** or **20**
- **Save**

---

## Fix 4: Redeploy

- **Deployments** → **⋯** on latest → **Redeploy**
- Wait until **Ready**

---

**Summary:** Vercel needs to run `npm install` before `npm run build`. Set **Install Command** = `npm install` in Vercel settings, then redeploy.
