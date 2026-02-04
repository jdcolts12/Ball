# Deploy Timer & Username Uniqueness Changes

Follow these steps to deploy the new features:

## Changes Being Deployed

1. **30-second timer** on each question (auto-answers if expired)
2. **Username uniqueness** enforcement (prevents duplicate usernames)

---

## Step 1: Run Database Migration

1. Go to **[supabase.com](https://supabase.com)** → your project
2. Click **SQL Editor** → **+ New query**
3. Open the file: `supabase/migrations/010_username_availability_check.sql`
4. **Copy all** (Cmd/Ctrl+A, then Cmd/Ctrl+C)
5. **Paste** into Supabase SQL Editor
6. Click **Run** (or Cmd/Ctrl+Enter)
7. You should see: **Success. No rows returned** ✅

This creates the `check_username_available()` function needed for username validation.

---

## Step 2: Deploy Code Changes

### Option A: If using Vercel (auto-deploys from GitHub)

1. **Commit and push** your changes:
   ```bash
   cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
   git add .
   git commit -m "Add 30s timer and username uniqueness"
   git push
   ```

2. Vercel will **automatically deploy** the new code
3. Wait 1-2 minutes for deployment to complete
4. Visit your live site to test

### Option B: Manual deployment

If you're not using Vercel auto-deploy:

1. **Build the app**:
   ```bash
   cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service (Vercel, Netlify, etc.)

---

## Step 3: Test the Changes

### Test Timer:
1. Sign in to your app
2. Start a game
3. **Verify**: You should see a timer counting down from 30s in the top-right
4. **Wait 30 seconds** without answering → should auto-answer as wrong
5. **Answer quickly** → timer should stop

### Test Username Uniqueness:
1. Try to **sign up** with a username that already exists
2. **Verify**: You should see "This username is already taken. Please choose a different username."
3. Try a **unique username** → should work ✅

---

## Files Changed

- ✅ `src/screens/GameScreen.tsx` - Added 30s timer
- ✅ `src/services/auth.ts` - Added username availability checking
- ✅ `src/screens/AuthScreen.tsx` - Better error messages
- ✅ `supabase/migrations/010_username_availability_check.sql` - Database function

---

## Troubleshooting

**Timer not showing?**
- Clear browser cache and refresh
- Check browser console for errors

**Username check not working?**
- Make sure you ran migration `010_username_availability_check.sql`
- Check Supabase SQL Editor → Functions → should see `check_username_available`

**Deployment failed?**
- Check Vercel build logs for errors
- Verify all files are committed and pushed to GitHub

---

That's it! Your changes are now live. 🚀
