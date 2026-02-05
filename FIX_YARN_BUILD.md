# Fix Yarn Build (exit 1)

Yarn install worked. Build failed. Do these:

---

## Step 1: Use yarn in vercel.json (already set)

**GitHub** → **vercel.json** → **Edit** → Replace with:

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

**Commit changes**

---

## Step 2: Fix the build error - update dailyGameQuestions.ts on GitHub

The build fails because **CareerPathQuestion** type is missing **position**. On GitHub:

1. **GitHub** → your repo → **src** → **lib** → **dailyGameQuestions.ts** → **Edit**
2. Find this block (around line 26):

```typescript
export type CareerPathQuestion = {
  type: 'careerPath';
  college: string;
```

3. Change it to (add **position: string;**):

```typescript
export type CareerPathQuestion = {
  type: 'careerPath';
  position: string;
  college: string;
```

4. **Commit changes**

---

## Step 3: In Vercel

**Settings** → **Build and Deployment**:

- **Install Command:** `yarn install`
- **Build Command:** `yarn build`
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`
- **Root Directory:** (empty)

**Save**

---

## Step 4: Redeploy

**Deployments** → **⋯** → **Redeploy**

---

**Summary:** npm keeps failing (254). Yarn install works. Fix the TypeScript error on GitHub (add `position: string` to CareerPathQuestion), then redeploy.
