# Use Yarn Instead - Do These Steps

---

## Step 1: Update vercel.json on GitHub

1. **GitHub** → your repo → **vercel.json** → **pencil icon** (Edit)
2. Replace with:

```json
{
  "installCommand": "yarn install",
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

3. **Commit changes**

---

## Step 2: In Vercel Settings

**Settings** → **Build and Deployment**:

- **Install Command:** `yarn install`
- **Build Command:** `yarn build`
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`
- **Root Directory:** (empty)

**Save**

---

## Step 3: Redeploy

**Deployments** → **⋯** → **Redeploy** → Wait for **Ready**

---

**Yarn should work better than npm on Vercel. This should fix the exit 254 error.**
