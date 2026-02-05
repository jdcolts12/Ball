# Fix It Now - 2 Things on GitHub

Do these 2 things on GitHub, then redeploy. That's it.

---

## 1. Fix dailyGameQuestions.ts on GitHub

1. **GitHub** → your repo → **src** → **lib** → **dailyGameQuestions.ts** → click **pencil** (Edit)
2. Find this (around line 26):

```
export type CareerPathQuestion = {
  type: 'careerPath';
  college: string;
```

3. Change it to (add **position: string;** on the line after type: 'careerPath';):

```
export type CareerPathQuestion = {
  type: 'careerPath';
  position: string;
  college: string;
```

4. Click **Commit changes**

---

## 2. Fix vercel.json on GitHub

1. **GitHub** → your repo → **vercel.json** → click **pencil** (Edit)
2. Replace everything with:

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

3. Click **Commit changes**

---

## 3. In Vercel

**Settings** → **Build and Deployment**:
- **Install Command:** `yarn install`
- **Build Command:** `yarn build`
- **Output Directory:** `dist`
- **Root Directory:** (empty)
**Save**

---

## 4. Redeploy

**Deployments** → **⋯** → **Redeploy** → wait for **Ready** → **Visit**

---

**That's it.** The build was failing because GitHub had the old type (no `position`). Add that one line, keep yarn, redeploy.
