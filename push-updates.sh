#!/bin/bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main --no-rebase --allow-unrelated-histories || git pull origin main --no-rebase

echo ""
echo "📤 Pushing your NFL-themed UI updates..."
git push -u origin main

echo ""
echo "✅ Done! Check Vercel → Deployments for the new build."
