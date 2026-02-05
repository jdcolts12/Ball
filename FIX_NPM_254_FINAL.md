# Fix npm install exit 254 - Use npm ci

Exit 254 = dependency issue. Use `npm ci` (clean install) instead of `npm install`.

---

## Step 1: Update vercel.json on GitHub

1. **GitHub** → your repo → **vercel.json** → **pencil icon** (Edit)
2. Replace with:

```json
{
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

3. **Commit changes**

---

## Step 2: In Vercel Settings

1. **Settings** → **Build and Deployment**
2. **Install Command:** set to **`npm ci`**
3. **Build Command:** set to **`npm run build`**
4. **Node.js Version:** set to **18** (or **18.x**)
5. **Save**

---

## Step 3: Redeploy

- **Deployments** → **⋯** → **Redeploy**
- Wait until **Ready**

---

**Why `npm ci`:** Clean install from package-lock.json - faster and more reliable in CI/CD. If it still fails, we may need to regenerate package-lock.json.
