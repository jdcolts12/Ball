# Try This - Combine Install + Build

Exit 254 from npm install keeps happening. Let's combine install and build into ONE command.

---

## Step 1: Update vercel.json on GitHub

**GitHub** → your repo → **vercel.json** → **Edit** → Replace with:

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Commit changes**

---

## Step 2: In Vercel

**Settings** → **Build and Deployment**:

- **Install Command:** CLEAR IT (leave empty - we're doing install in buildCommand)
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`
- **Root Directory:** (empty)

**Save**

---

## Step 3: Redeploy

**Deployments** → **⋯** → **Redeploy**

---

**Why:** Combining install + build in one command ensures install runs before build. No separate install step that can fail.
