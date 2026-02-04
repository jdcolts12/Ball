# Get Live - Do These 3 Things

I can't do these for you (they need your accounts), but they're quick:

---

## Thing 1: Run the push script

**In Cursor terminal (⌘ + `), run:**

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
chmod +x push-to-github.sh
./push-to-github.sh
```

When it asks for your GitHub URL, paste it (from github.com → your repo → Code → HTTPS).

If it asks for password, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens).

---

## Thing 2: Vercel Root Directory

1. **vercel.com** → your project → **Settings** → **General**
2. **Root Directory:** clear it (make it **empty**)
3. **Save**

---

## Thing 3: Vercel Environment Variables

1. **Settings** → **Environment Variables**
2. Add:
   - **VITE_SUPABASE_URL** = your Supabase Project URL
   - **VITE_SUPABASE_ANON_KEY** = your Supabase anon public key
3. Check **Production** for both
4. **Save**
5. **Deployments** → **⋯** → **Redeploy**

---

## Done!

After Thing 3 redeploys, click **Visit**. You're live!

**If 404:** Root Directory must be **empty**. Redeploy.

**If "add Supabase URL":** Make sure Thing 3 env vars are set and you redeployed.
