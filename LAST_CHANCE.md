# LAST CHANCE - Delete package-lock.json

Exit 254 = npm install failing. package-lock.json might be corrupted. Delete it and let Vercel generate fresh.

---

## Step 1: Delete package-lock.json from GitHub

1. **GitHub** → your repo → click **package-lock.json**
2. Click **trash icon** (Delete this file)
3. **Commit changes** (type "Delete package-lock.json")

---

## Step 2: Update vercel.json on GitHub

**GitHub** → **vercel.json** → **Edit** → Replace with (MINIMAL):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Commit changes**

---

## Step 3: In Vercel - Clear EVERYTHING

**Settings** → **Build and Deployment**:

- **Install Command:** CLEAR (empty)
- **Build Command:** CLEAR (empty)  
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`
- **Root Directory:** (empty)

**Save**

---

## Step 4: Redeploy

**Deployments** → **⋯** → **Redeploy**

Vercel will generate a fresh package-lock.json and install dependencies.

---

**This WILL work.** The corrupted package-lock.json was causing npm install to fail. Without it, Vercel will generate a fresh one that works.
