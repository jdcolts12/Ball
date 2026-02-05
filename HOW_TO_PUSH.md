# How to Push to GitHub

Simple steps to push your code to GitHub and trigger Vercel deployment.

---

## Step 1: Open Terminal

**In Cursor:**
- Press `` Ctrl + ` `` (backtick) to open terminal
- Or: **Terminal** → **New Terminal** (top menu)

---

## Step 2: Navigate to Your Project

**Type this command:**

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
```

Press **Enter**.

---

## Step 3: Push to GitHub

**Type this command:**

```bash
git push
```

Press **Enter**.

---

## What Happens

1. **Git connects to GitHub**
2. **Uploads your commits** (timer changes)
3. **Vercel detects the push** automatically
4. **Vercel starts deploying** (1-2 minutes)

---

## If You See "Network Error"

**Error message:**
```
fatal: unable to access 'https://github.com/jdcolts12/Ball.git/': Could not resolve host: github.com
```

**This means:**
- Your internet connection is down
- Wait 30 seconds and try again
- Or check your WiFi/internet

---

## If You See "Authentication Required"

**You might need to:**
1. **Enter your GitHub username**
2. **Enter your GitHub password** (or personal access token)

**Or use GitHub Desktop app** instead (easier for some people).

---

## After Push Succeeds

**You'll see:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/jdcolts12/Ball.git
   abc0118..newhash  main -> main
```

**This means:** ✅ Push successful!

---

## Next Steps After Push

1. **Go to Vercel:** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click your project**
3. **Deployments tab** → Wait 1-2 minutes
4. **Status should show "Ready" (green)**
5. **Click "Visit"** → Test in **incognito window**

---

## Quick Copy-Paste Commands

**Copy and paste these one at a time:**

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
```

```bash
git push
```

---

**That's it! Just run `git push` in the terminal.** 🚀
