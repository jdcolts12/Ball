# Step-by-step: Get YunoBall live

Do every step in order. Don’t skip any.

---

## Part A: Open a terminal in Cursor

**Step A1.** In Cursor, look at the **top menu bar** (File, Edit, View, etc.).

**Step A2.** Click **Terminal**.

**Step A3.** In the menu that opens, click **New Terminal**.

A panel will open at the **bottom** of Cursor with a black or dark area and a line that ends with something like `%` or `$`. That line is where you type commands. This is your **terminal**.

*(You can also press **Ctrl + `** (backtick) or **Cmd + `** on Mac to open the terminal.)*

---

## Part B: Create a repo on GitHub (in your browser)

**Step B1.** Open a **web browser** and go to: [https://github.com](https://github.com)

**Step B2.** Sign in to your GitHub account.

**Step B3.** Click the **+** icon in the **top right** of the page.

**Step B4.** Click **New repository**.

**Step B5.** In **Repository name**, type: `football-trivia` (or `yunoball` — any short name you like).

**Step B6.** Leave **“Add a README file”** unchecked (no checkmark).

**Step B7.** Click the green **Create repository** button.

**Step B8.** On the next page, find the box that says **“…or push an existing repository from the command line.”** Under it you’ll see two lines. The second line looks like:
`https://github.com/YOUR_USERNAME/football-trivia.git`

**Step B9.** Copy that full URL (click the copy icon, or select it and Cmd+C). You’ll use it in Part C. Keep this browser tab open.

---

## Part C: Connect your project to GitHub (in the terminal)

Go back to **Cursor** and use the **terminal at the bottom**.

**Step C1.** Click inside the terminal (so the cursor is blinking there).

**Step C2.** Type this exactly and press **Enter**:
```
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
```
*(If your project is in a different folder, replace that path with your actual path.)*

You should see a new line appear; nothing else dramatic. That’s OK.

**Step C3.** Type this, but **replace the URL** with the one you copied in Step B9:
```
git remote add origin https://github.com/YOUR_USERNAME/football-trivia.git
```
Example: if your URL was `https://github.com/jdcolts12/football-trivia.git`, then you type:
```
git remote add origin https://github.com/jdcolts12/football-trivia.git
```
Press **Enter**.

- If it says **“fatal: remote origin already exists”**: run this next (with your URL), then go to Step C4:
  ```
  git remote set-url origin https://github.com/YOUR_USERNAME/football-trivia.git
  ```
- If it says something else, copy the exact message and ask for help.

**Step C4.** Type this and press **Enter**:
```
git push -u origin main
```

**Step C5.** If it asks for **Username**: type your GitHub username and press Enter.

**Step C6.** If it asks for **Password**: GitHub no longer accepts your normal password here. You must use a **Personal Access Token**:
- Open GitHub in your browser → click your profile picture (top right) → **Settings**.
- In the left sidebar, scroll down and click **Developer settings**.
- Click **Personal access tokens** → **Tokens (classic)**.
- Click **Generate new token** → **Generate new token (classic)**.
- Give it a name (e.g. “Cursor push”), choose an expiry, check **repo**.
- Click **Generate token**, then **copy the token** (you won’t see it again).
- Back in the terminal, when it asks for **Password**, **paste the token** (Cmd+V) and press Enter. Don’t type your GitHub password.

**Step C7.** Wait. You should see lines like “Writing objects: 100%” and “Branch 'main' set up to track…”. When the line with `%` or `$` comes back, the push is done.

**Step C8.** In your browser, go to your GitHub repo page and **refresh**. You should see folders like `src`, `supabase` and files like `package.json`. If you do, **Part C is done.**

---

## Part D: Deploy on Vercel (in your browser)

**Step D1.** Go to [https://vercel.com](https://vercel.com) and sign in. Choose **Continue with GitHub**.

**Step D2.** Click **Add New…** → **Project**.

**Step D3.** You’ll see a list of your GitHub repos. Find **football-trivia** (or whatever you named it) and click **Import** next to it.

**Step D4.** Before clicking Deploy, add environment variables:
- Find **Environment Variables** on the page (you may need to expand it).
- **Key:** type `VITE_SUPABASE_URL`  
  **Value:** open Supabase → **Project Settings** (gear) → **API** → copy **Project URL** and paste it here.
- Click **Add** or the next row, then:  
  **Key:** `VITE_SUPABASE_ANON_KEY`  
  **Value:** from the same Supabase API page, copy **anon public** and paste it here.

**Step D5.** Click **Deploy**. Wait until the page says the deployment is ready (usually 1–2 minutes).

**Step D6.** Click **Visit** (or the link that looks like `https://something.vercel.app`). That’s your **live site**. You should see YunoBall.

---

## Part E: Set the URL in Supabase (in your browser)

**Step E1.** Open [Supabase](https://supabase.com), open your project.

**Step E2.** In the left sidebar: **Authentication** → **URL configuration**.

**Step E3.** **Site URL:** paste your Vercel URL (e.g. `https://football-trivia-xxx.vercel.app`).

**Step E4.** Under **Redirect URLs**, add: your same Vercel URL followed by `/**`  
Example: `https://football-trivia-xxx.vercel.app/**`

**Step E5.** Click **Save**.

---

## Done

Open your Vercel URL, sign up or sign in, and play. You’re live.

If something doesn’t work, note which **Part** and **Step** you’re on and what the screen or terminal says, and ask for help with that.
