# Last Fix - Let Vercel Auto-Detect Everything

Exit 254 keeps happening. Let's remove ALL overrides and let Vercel auto-detect Vite.

---

## Step 1: Update vercel.json on GitHub (MINIMAL)

1. **GitHub** → your repo → **vercel.json** → **pencil icon** (Edit)
2. Replace with (ONLY rewrites - nothing else):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

3. **Commit changes**

---

## Step 2: In Vercel - Clear EVERYTHING

1. **Settings** → **Build and Deployment**
2. **Install Command:** CLEAR IT (remove override, leave empty)
3. **Build Command:** CLEAR IT (remove override, leave empty)  
4. **Output Directory:** set to **`dist`**
5. **Framework Preset:** set to **Vite** (or leave as auto-detected)
6. **Node.js Version:** set to **18.x** (or **20.x**)
7. **Root Directory:** leave **empty**
8. **Save**

---

## Step 3: Check these files are on GitHub

Make sure these exist in your GitHub repo:
- ✅ **package.json**
- ✅ **package-lock.json** (important!)
- ✅ **vite.config.ts**
- ✅ **index.html**
- ✅ **src/** folder

If **package-lock.json** is missing, upload it from Finder.

---

## Step 4: Redeploy

- **Deployments** → **⋯** → **Redeploy**
- Wait until **Ready**

---

**Why this works:** Vercel's Vite preset auto-detects and runs `npm install` + `npm run build` correctly. Overriding causes conflicts. Let Vercel handle it.
