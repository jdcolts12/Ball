# Back to npm - Yarn install worked but build failed

Yarn install succeeded! But build failed. Let's use npm with flags to avoid exit 254.

---

## Step 1: Update vercel.json on GitHub

**GitHub** → **vercel.json** → **Edit** → Replace with:

```json
{
  "installCommand": "npm install --no-audit --no-fund",
  "buildCommand": "npm run build",
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

- **Install Command:** `npm install --no-audit --no-fund`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`
- **Root Directory:** (empty)

**Save**

---

## Step 3: Redeploy

**Deployments** → **⋯** → **Redeploy**

---

**The --no-audit --no-fund flags skip security checks that might cause exit 254. Since yarn install worked, npm should work with these flags.**
