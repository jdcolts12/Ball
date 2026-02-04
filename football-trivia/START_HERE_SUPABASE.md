# Supabase SQL — do this first

You need to run one SQL file in Supabase. Follow these steps exactly.

---

## Step 1: Open the SQL file in Cursor

1. In the **left sidebar** (file tree), find the folder **`supabase`**.
2. Click **`supabase`** to expand it.
3. Click the file **`RUN_THIS_ONCE.sql`**.
4. The editor should show that file. **Check the very first line.** It should say:
   - `-- =============================================================================`
   - Or: `-- COPY ALL OF THIS FILE...`
   - It must **NOT** say: `# Deploy YunoBall` (that’s the wrong file).

If you see `# Deploy YunoBall` at the top, you have **DEPLOY.md** open. Click **`RUN_THIS_ONCE.sql`** in the left sidebar instead.

---

## Step 2: Copy the whole file

1. With **`RUN_THIS_ONCE.sql`** open and active (cursor inside that tab):
2. **Mac:** Press **Cmd + A**, then **Cmd + C**  
   **Windows:** Press **Ctrl + A**, then **Ctrl + C**
3. That copies the entire file. Don’t change tabs or click elsewhere before pasting in Supabase.

---

## Step 3: Paste and run in Supabase

1. Open your browser and go to **[supabase.com](https://supabase.com)**. Sign in and open your project.
2. In the **left sidebar**, click **SQL Editor**.
3. Click **+ New query**.
4. Click inside the big text box (where you type SQL).
5. **Mac:** Press **Cmd + V**  
   **Windows:** Press **Ctrl + V**
6. **Check the first line** in that box. It must start with:
   - `-- =============================================================================`  
   or  
   - `-- COPY ALL OF THIS FILE...`  
   It must **NOT** start with `# Deploy YunoBall`. If it does, you pasted the wrong file — go back to Step 1 and copy from **`RUN_THIS_ONCE.sql`**.
7. Click the green **Run** button (or press Cmd/Ctrl + Enter).
8. Wait a few seconds. You should see something like **Success. No rows returned**. That’s correct.

---

## If you still get an error about "#"

That means Supabase is still running text from **DEPLOY.md** (the deploy guide), not the SQL file.

- In Cursor, make sure the **tab** at the top says **`RUN_THIS_ONCE.sql`** (and not `DEPLOY.md`).
- In the left sidebar, click **`supabase`** → **`RUN_THIS_ONCE.sql`**.
- Then do **Cmd+A** (or Ctrl+A) and **Cmd+C** (or Ctrl+C) again.
- In Supabase, **select all** in the query box and delete it, then paste again. The **first line** in the box must start with `--` (two dashes), not `#`.

---

## After it works

- You’ll see **Success** in Supabase. Then you can get your **Project URL** and **anon key** from **Project Settings → API** and use them in Vercel (or your host) as described in **DEPLOY.md**.
