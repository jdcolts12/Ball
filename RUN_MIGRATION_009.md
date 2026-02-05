# Run Migration 009 - Badge System Update

This migration adds `user_id` to the leaderboard functions so badges can be calculated correctly.

## Steps:

1. **Open the migration file**:
   - File: `supabase/migrations/009_leaderboard_user_id.sql`
   - Copy all contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)

2. **Go to Supabase**:
   - Open [supabase.com](https://supabase.com)
   - Sign in and open your project

3. **Run the SQL**:
   - Click **SQL Editor** in the left sidebar
   - Click **+ New query**
   - Paste the SQL (Cmd/Ctrl + V)
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned" - that's correct!

4. **Test it**:
   - After running, your leaderboard badges will work:
     - **Daily tab**: Shows 🏆 for perfect games (score = 3)
     - **Monthly tab**: Shows 🔥 for streaks (2+ consecutive perfect games)
     - **Career tab**: Shows 🏅/⭐/💎 for career percentages (75%/85%/95%)

That's it! The migration updates the database functions to include `user_id` so the TypeScript code can calculate badges properly.
