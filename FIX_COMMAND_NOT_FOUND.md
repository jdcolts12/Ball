# Fix "Command Not Found" Error

If you see "command not found" when trying `git push`, here's how to fix it:

---

## Option 1: Use Full Path to Git

Instead of just `git`, try:

```bash
/usr/bin/git push
```

Or:

```bash
/usr/local/bin/git push
```

---

## Option 2: Check You're in the Right Directory

Make sure you're in your project folder first:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
pwd
```

The `pwd` command should show: `/Users/joeydias/Desktop/Cursor Project 1/football-trivia`

Then try:

```bash
git push
```

---

## Option 3: Use GitHub Desktop (Easiest)

If git commands don't work, use **GitHub Desktop** app:

1. **Download GitHub Desktop:** [desktop.github.com](https://desktop.github.com)
2. **Install** and sign in with your GitHub account
3. **Add your repository:**
   - File → Add Local Repository
   - Browse to: `/Users/joeydias/Desktop/Cursor Project 1/football-trivia`
   - Click "Add Repository"
4. **Push:**
   - Click the **"Push origin"** button (or "Publish branch" if it's your first push)
   - Wait for it to finish

---

## Option 4: Check Terminal Type

Make sure you're using **Terminal** (not a different shell):

1. In Cursor, press `` Ctrl + ` `` to open terminal
2. Or: **Terminal** → **New Terminal** from the menu

---

## Option 5: Restart Terminal

Sometimes the terminal needs to reload:

1. **Close** the terminal in Cursor
2. **Open a new one** (`` Ctrl + ` ``)
3. Try the commands again

---

## What Error Did You See?

**"command not found: git"**
- Git might not be installed or not in your PATH
- Try Option 1 (full path) or Option 3 (GitHub Desktop)

**"command not found: cd"**
- Terminal issue - try Option 4 (restart terminal)

**"fatal: not a git repository"**
- You're not in the project folder - do Option 2 first

---

## Quick Test

Try this to see if git works:

```bash
/usr/bin/git --version
```

If that works, then use:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
/usr/bin/git push
```

---

**Easiest solution: Use GitHub Desktop (Option 3) - no command line needed!** 🚀
