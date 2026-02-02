# YunoBall setup & testing

Everyone needs an account (username, email, password). To test the app you need Supabase configured.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → pick an org and a project name (e.g. `yunoball`) → set a database password → Create.

---

## 2. Get your API keys

1. In the project, go to **Settings** (gear) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys").

---

## 3. Configure the app

1. In this folder, open or create a file named `.env`.
2. Put this in it (use your real URL and key):

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Save the file.

---

## 4. Run the database migrations

1. In Supabase, open **SQL Editor** → **New query**.
2. Open each file in `supabase/migrations/` in this project and run its contents **in order**:
   - `001_create_tables.sql`
   - `002_add_last_played.sql`
   - `003_leaderboards.sql`
   - `004_game_question_breakdown.sql`

---

## 5. (Recommended for testing) Disable email confirmation

1. In Supabase: **Authentication** → **Providers** → **Email**.
2. Turn **off** “Confirm email” so you can sign in right after sign-up without checking email.
3. Save.

---

## 6. Run the app and test

1. In a terminal, from this folder run:

   ```bash
   npm run dev
   ```

2. Open the URL Vite prints (e.g. **http://127.0.0.1:5173**) in your browser.

3. **Sign up**
   - Click “Don’t have an account? Sign up”.
   - Enter a **username**, **email**, and **password**.
   - Click “Create account”.
   - (If email confirmation is off) You should be signed in and see the home screen.

4. **Play**
   - Click “Start game”.
   - Answer the 3 questions (draft, college, career path).
   - Submit and check your score and badges on the results screen.

5. **Leaderboard**
   - From home, click “View leaderboard”.
   - Switch between Daily / Monthly / Career to see rankings.

6. **Sign out**
   - Click “Sign out” on the home screen, then sign in again with the same email and password to confirm sign-in works.

---

## Troubleshooting

- **“Invalid API key” or blank auth screen**  
  Make sure `.env` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart the dev server (`npm run dev`).

- **“Email not confirmed”**  
  Either confirm the email from the link Supabase sent, or turn off “Confirm email” in Supabase (step 5).

- **Leaderboard empty or errors**  
  Ensure all four migration files were run in order in the Supabase SQL Editor.
