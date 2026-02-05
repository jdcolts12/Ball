# Run Locally to See Your Changes

## Step 1: Stop any running dev server
Press `Ctrl + C` in any terminal windows running `npm run dev`

## Step 2: Start the dev server
Open a terminal in Cursor (⌘ + `) and run:

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
npm run dev
```

## Step 3: Open in browser
Look for a message like:
- `Local: http://127.0.0.1:5173/`
- `Local: http://localhost:5173/`

Open that URL in your browser.

## What you should see:
✅ Green football field gradient background
✅ "Daily NFL trivia. 3 questions, one round per day. Test Your Ball Knowledge" text
✅ NFL-themed styling with white text

## If you see old styling:
1. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Clear browser cache
3. Try incognito/private window

## If port 5173 is busy:
The server will try the next available port (5174, 5175, etc.)
Check the terminal output for the actual URL.
