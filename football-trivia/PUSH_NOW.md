# Push Your Code to GitHub - Do This Now

Your code is **not** on GitHub yet. That's why Vercel says the repo is empty.

---

## Step 1: Get your GitHub repo URL

1. Open **github.com** → sign in
2. Click **+** (top right) → **New repository** (if you don't have one yet)
   - Name it: `football-trivia` (or any name)
   - **Don't** check "Add a README"
   - Click **Create repository**
3. On the next page, click green **Code** button
4. Copy the **HTTPS** URL (e.g. `https://github.com/YourUsername/football-trivia.git`)

---

## Step 2: Push in terminal

**In Cursor terminal (⌘ + `), run these 3 lines:**

**Line 1:**
```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
```

**Line 2** (replace `YOUR_URL` with the URL from Step 1):
```bash
git remote add origin YOUR_URL
```

**Line 3:**
```bash
git push -u origin main
```

**If it asks for password:** Use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → Generate new token → check "repo" → copy token → paste as password)

---

## Step 3: Check it worked

- Refresh your GitHub repo page
- You should see **package.json**, **src**, **index.html**, **vercel.json**, etc.

---

## Step 4: In Vercel

- **Settings** → **General** → **Root Directory:** leave **empty** → **Save**
- **Deployments** → **⋯** → **Redeploy**

Now Vercel will see your code and build it!
