#!/bin/bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

echo "📤 Force pushing NFL-themed UI updates to GitHub..."
echo "This will overwrite GitHub with your local changes."
echo ""

git push -u origin main --force

echo ""
echo "✅ Done! Vercel will automatically deploy the new changes."
echo "Check: https://vercel.com → Your project → Deployments"
