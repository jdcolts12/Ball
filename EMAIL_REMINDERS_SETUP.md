# Email Reminders for Streak Protection

This guide shows how to set up email reminders to users before they lose their perfect game streak.

---

## Overview

**What it does:**
- Sends daily email reminders to ALL users who haven't played by 5 PM
- Personalized messages: Users with streaks ≥2 get streak-specific reminders
- General reminders: All other users get "don't forget to play" messages
- Uses Supabase Edge Functions + Resend (or SendGrid) for email delivery

**Requirements:**
- Users already have emails (captured during signup via Supabase Auth)
- Streak calculation already exists (`calculatePerfectGameStreak`)
- Need to add: Email service + Scheduled function

---

## Option 1: Supabase Edge Functions + Resend (Recommended)

### Step 1: Set up Resend Account

1. Go to **[resend.com](https://resend.com)** and sign up (free tier: 3,000 emails/month)
2. Verify your domain (or use Resend's test domain for development)
3. Get your API key: **API Keys** → **Create API Key** → Copy the key

### Step 2: Add Resend API Key to Supabase

1. Go to **Supabase** → your project → **Settings** → **Edge Functions** → **Secrets**
2. Add secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
3. Click **Save**

### Step 3: Create Edge Function

Create a new file: `supabase/functions/send-streak-reminders/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'

interface UserWithStreak {
  user_id: string
  email: string
  username: string
  streak_count: number
  last_played: string
}

serve(async (req) => {
  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]
    
    // Get all users who played yesterday or earlier (haven't played today)
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('stats')
      .select('user_id, last_played')
      .not('last_played', 'is', null)
      .neq('last_played', today) // Haven't played today
    
    if (statsError) {
      throw new Error(`Failed to fetch stats: ${statsError.message}`)
    }

    if (!stats || stats.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users need reminders today' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // For each user, calculate their streak and send reminder if streak >= 2
    const usersToRemind: UserWithStreak[] = []
    
    for (const stat of stats) {
      // Fetch user's games
      const { data: games, error: gamesError } = await supabaseAdmin
        .from('games')
        .select('created_at, correct_answers, questions_answered')
        .eq('user_id', stat.user_id)
        .order('created_at', { ascending: false })
        .limit(100) // Get recent games for streak calculation
      
      if (gamesError) continue
      
      // Calculate streak (using same logic as badges.ts)
      const streak = calculatePerfectGameStreak(games || [])
      
      if (streak >= 2) {
        // Get user email and username
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(stat.user_id)
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('username')
          .eq('id', stat.user_id)
          .single()
        
        if (authUser?.user?.email) {
          usersToRemind.push({
            user_id: stat.user_id,
            email: authUser.user.email,
            username: profile?.username || 'Player',
            streak_count: streak,
            last_played: stat.last_played
          })
        }
      }
    }

    // Send emails via Resend
    const results = []
    for (const user of usersToRemind) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: user.email,
            subject: `🔥 Don't lose your ${user.streak_count}-day streak!`,
            html: `
              <h2>Hey ${user.username}!</h2>
              <p>You're on a <strong>${user.streak_count}-day perfect game streak</strong> 🔥</p>
              <p>Don't let it end! Play today to keep your streak alive.</p>
              <p><a href="${Deno.env.get('APP_URL')}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Play Now →</a></p>
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">This is an automated reminder. You can unsubscribe in your account settings.</p>
            `,
          }),
        })

        const emailData = await emailResponse.json()
        results.push({ user: user.email, success: emailResponse.ok, id: emailData.id })
      } catch (error) {
        results.push({ user: user.email, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${usersToRemind.length} users`,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Streak calculation function (same as badges.ts)
function calculatePerfectGameStreak(games: Array<{ created_at: string; correct_answers: number; questions_answered: number }>): number {
  if (games.length === 0) return 0
  
  const sorted = [...games].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  const gamesByDate = new Map<string, typeof games>()
  for (const game of sorted) {
    const date = new Date(game.created_at).toISOString().split('T')[0]
    if (!gamesByDate.has(date)) {
      gamesByDate.set(date, [])
    }
    gamesByDate.get(date)!.push(game)
  }
  
  let streak = 0
  const dates = Array.from(gamesByDate.keys()).sort((a, b) => b.localeCompare(a))
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const dayGames = gamesByDate.get(date)!
    const hasPerfectGame = dayGames.some(g => g.correct_answers === 3 && g.questions_answered === 3)
    
    if (!hasPerfectGame) break
    
    if (i === 0) {
      streak = 1
    } else {
      const prevDate = dates[i - 1]
      const currentDateObj = new Date(date + 'T00:00:00')
      const prevDateObj = new Date(prevDate + 'T00:00:00')
      const daysDiff = Math.floor((prevDateObj.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        streak++
      } else {
        break
      }
    }
  }
  
  return streak
}
```

### Step 4: Deploy Edge Function

```bash
cd "/Users/joeydias/Desktop/Cursor Project 1/football-trivia"
npx supabase functions deploy send-streak-reminders
```

### Step 5: Set up Cron Job

In Supabase → **Database** → **Cron Jobs** (or use pg_cron):

```sql
-- Run daily at 6 PM (18:00) in user's timezone
SELECT cron.schedule(
  'send-streak-reminders',
  '0 18 * * *', -- 6 PM daily
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-streak-reminders',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

---

## Option 2: Simpler - Use Vercel Cron + Resend API

### Step 1: Create API Route

Create: `src/api/send-reminders.ts` (or use Vercel serverless function)

```typescript
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: Request) {
  // Verify it's a cron job request (add secret header)
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin access
  )

  // ... same logic as Edge Function above ...
}
```

### Step 2: Add Vercel Cron Job

In `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/send-reminders",
    "schedule": "0 18 * * *"
  }]
}
```

---

## Option 3: Use Supabase Database Functions + Email Extension

Simpler but requires Supabase Pro plan for email sending.

---

## Recommended: Option 1 (Supabase Edge Functions)

**Pros:**
- Free tier available
- Integrated with Supabase
- Easy to deploy
- Can use Resend (3,000 free emails/month)

**Setup Time:** ~30 minutes

---

## Testing

1. Create a test user with a streak
2. Manually trigger the function:
   ```bash
   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-streak-reminders \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
3. Check email inbox

---

## Email Template Customization

Edit the HTML in the Edge Function to match your brand:
- Add your logo
- Customize colors
- Add unsubscribe link
- Personalize messaging

---

## Next Steps

1. Choose an option (recommend Option 1)
2. Set up Resend account
3. Create the Edge Function
4. Deploy and test
5. Set up cron job

Want me to implement Option 1 for you?
