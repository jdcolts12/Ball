# FINAL FIX - Do These 3 Things

---

## 1. Update vercel.json on GitHub

**GitHub** → your repo → **vercel.json** → **Edit** → Replace with:

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Commit changes**

---

## 2. In Vercel Dashboard

**Settings** → **Build and Deployment**:

- **Install Command:** `npm install`
- **Build Command:** `npm run build`  
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`
- **Node.js Version:** `18.x`
- **Root Directory:** (empty)

**Save**

---

## 3. Make sure package-lock.json is on GitHub

- Check your GitHub repo has **package-lock.json**
- If missing: Upload it (Finder → football-trivia → drag package-lock.json to GitHub)

---

## 4. Redeploy

**Deployments** → **⋯** → **Redeploy** → Wait for **Ready**

---

**That's it. If it still fails, the issue is package-lock.json missing or Node version wrong.**
