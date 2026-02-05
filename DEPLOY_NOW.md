# Deploy (detailed version)

**Prefer the short version:** see **START_HERE.md**.

---

## 1. Push to GitHub

- Folder: `football-trivia` (that folder is the git repo).
- Terminal: `cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"` then `git add -A && git commit -m "Updates" && git push origin main`.
- Or GitHub Desktop: open `football-trivia`, then Commit → Push.

## 2. Vercel

- **Settings** → **General** → **Root Directory**: leave *empty* (clear if it says `football-trivia`). Save.
- **Deployments** → ⋯ on latest → **Redeploy** → uncheck “Redeploy with existing Build Cache” → **Redeploy**.

## 3. Test

- Open your live URL in a **new incognito** window.
- You should see “Version 2.0 — Feb 2026” on the home screen and “YunoBall – Daily NFL Trivia (v2.0)” in the tab title.

## 4. If it still doesn’t update

- Vercel → **Settings** → **Environment Variables**: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set for Production.
- Try another browser or device in incognito.
