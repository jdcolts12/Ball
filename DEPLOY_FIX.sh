#!/bin/bash
# Force deploy timer and username changes

echo "🚀 Pushing to GitHub to trigger Vercel deployment..."
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Push successful! Vercel will auto-deploy in 1-2 minutes."
    echo ""
    echo "Next steps:"
    echo "1. Go to vercel.com → Your project → Deployments"
    echo "2. Wait for status to show 'Ready' (green)"
    echo "3. Click 'Visit' button"
    echo "4. Open in incognito window (Cmd+Shift+N)"
    echo "5. Sign in → Start game → Look for 30-second timer"
else
    echo "❌ Push failed. Check your internet connection and try again."
fi
