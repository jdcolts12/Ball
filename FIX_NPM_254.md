# Fix "npm install exited with 254"

Exit 254 often means Node/npm version mismatch. Do these:

---

## Step 1: Add .nvmrc to your repo

I created a file **.nvmrc** in your project with just `18` so Vercel uses Node 18.

**Upload .nvmrc to GitHub:**
- In Cursor, open **.nvmrc** (it's in the football-trivia folder; you may need to show hidden files or search for it)
- It contains one line: `18`
- On GitHub: click **Add file** → **Create new file**
- Name the file: `.nvmrc`
- In the content box type: `18`
- Click **Commit changes**

---

## Step 2: In Vercel – clear Install Command

1. **Vercel** → your project → **Settings** → **Build and Deployment**
2. Find **Install Command** (or **Override**)
3. **Clear it** or **remove the override** so Vercel uses its default (it will run npm install automatically)
4. **Save**

---

## Step 3: Set Node.js Version in Vercel

Same page:
- **Node.js Version:** set to **18.x** or **20.x** (e.g. `18` or `20`)
- **Save**

---

## Step 4: Push updated vercel.json

I removed the custom installCommand from vercel.json. **Upload the updated vercel.json to GitHub** (replace the file or edit it to match):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Step 5: Redeploy

- **Deployments** → **⋯** on latest → **Redeploy**
- Wait until **Ready**

---

**Summary:** Use Node 18 (.nvmrc + Vercel Node version), don't override Install Command, then redeploy.
