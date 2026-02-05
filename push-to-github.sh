#!/bin/bash
# Run this script to push your code to GitHub
# You'll need to provide your GitHub repo URL when it asks

echo "=== Pushing YunoBall to GitHub ==="
echo ""

# Go to project folder
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"

# Check if remote exists
if git remote get-url origin &>/dev/null; then
    echo "Remote 'origin' already exists."
    read -p "Enter your GitHub repo URL (or press Enter to keep current): " GITHUB_URL
    if [ ! -z "$GITHUB_URL" ]; then
        git remote set-url origin "$GITHUB_URL"
        echo "Updated remote URL."
    fi
else
    echo "No remote configured."
    read -p "Enter your GitHub repo URL (e.g. https://github.com/YourUsername/football-trivia.git): " GITHUB_URL
    if [ -z "$GITHUB_URL" ]; then
        echo "Error: GitHub URL required."
        exit 1
    fi
    git remote add origin "$GITHUB_URL"
    echo "Added remote."
fi

echo ""
echo "Pushing to GitHub..."
echo "If it asks for username: enter your GitHub username"
echo "If it asks for password: use a Personal Access Token (not your password)"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code is on GitHub."
    echo "Next: Go to Vercel and redeploy."
else
    echo ""
    echo "❌ Push failed. Check the error above."
    echo "Common fixes:"
    echo "  - Make sure the GitHub repo exists"
    echo "  - Use a Personal Access Token as password (not your GitHub password)"
fi
