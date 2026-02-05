#!/bin/bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

# Add remote if it doesn't exist
if ! git remote | grep -q origin; then
  git remote add origin https://github.com/jdcolts12/Ball.git
else
  git remote set-url origin https://github.com/jdcolts12/Ball.git
fi

# Push the changes
git push -u origin main

echo ""
echo "✅ Changes pushed! Vercel should automatically deploy."
echo "Check: https://vercel.com → Your project → Deployments"
