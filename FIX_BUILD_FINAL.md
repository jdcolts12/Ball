# Fix Build - Let Vercel Auto-Detect

npm ci exit 1 = package-lock.json missing or out of sync on GitHub.
npm install exit 254 = version/install issue.

**Fix:** Don't override Install/Build. Let Vercel auto-detect Vite and run its default pipeline.

---

## Step 1: Update vercel.json on GitHub

1. **GitHub** → your repo → **vercel.json** → **pencil icon** (Edit)
2. Replace with (only framework, output, rewrites - no install/build override):

```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

3. **Commit changes**

---

## Step 2: In Vercel - Clear Overrides

1. **Settings** → **Build and Deployment**
2. **Install Command:** clear it (remove override) - leave empty
3. **Build Command:** clear it (remove override) - leave empty
4. **Output Directory:** set to **`dist`** (or leave empty - vercel.json has it)
5. **Framework Preset:** set to **Vite** (or leave as detected)
6. **Node.js Version:** set to **18** (or **18.x**)
7. **Root Directory:** leave **empty**
8. **Save**

---

## Step 3: Make sure package-lock.json is on GitHub

- On GitHub, check if **package-lock.json** exists in your repo.
- If it's **missing**, upload it (Finder → football-trivia → drag **package-lock.json** to GitHub upload).
- Vercel needs it for reliable installs.

---

## Step 4: Redeploy

- **Deployments** → **⋯** → **Redeploy**
- Wait until **Ready**

---

**Summary:** Let Vercel use its Vite preset (no custom install/build). Ensure package-lock.json is on GitHub. Set Node 18.
