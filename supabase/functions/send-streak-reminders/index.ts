/**
 * Edge Function: Send daily reminder emails to all users who haven't played today
 * 
 * Sends reminders to ALL users who haven't played by 5 PM, with personalized messages:
 * - Users with streaks ≥2: "Don't lose your X-day streak!"
 * - Other users: "Don't forget to play today!"
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
const APP_URL = Deno.env.get('APP_URL') || 'https://your-app.vercel.app'

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

    // For each user, calculate their streak and send reminder to ALL users who haven't played today
    const usersToRemind: UserWithStreak[] = []
    
    for (const stat of stats) {
      // Get user email and username first
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(stat.user_id)
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', stat.user_id)
        .single()
      
      if (!authUser?.user?.email) continue
      
      // Fetch user's games to calculate streak (optional - for personalization)
      const { data: games, error: gamesError } = await supabaseAdmin
        .from('games')
        .select('created_at, correct_answers, questions_answered')
        .eq('user_id', stat.user_id)
        .order('created_at', { ascending: false })
        .limit(100) // Get recent games for streak calculation
      
      // Calculate streak (for personalization - show in email if they have one)
      const streak = gamesError || !games ? 0 : calculatePerfectGameStreak(games)
      
      // Send reminder to ALL users who haven't played today (not just those with streaks)
      usersToRemind.push({
        user_id: stat.user_id,
        email: authUser.user.email,
        username: profile?.username || 'Player',
        streak_count: streak,
        last_played: stat.last_played
      })
    }

    if (usersToRemind.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users need reminders today' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
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
            subject: user.streak_count >= 2 
              ? `🔥 Don't lose your ${user.streak_count}-day streak!` 
              : `⚽ Don't forget to play YunoBall today!`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(to bottom, #065f46, #047857); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">YunoBall</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <h2 style="color: #065f46; margin-top: 0;">Hey ${user.username}!</h2>
                  ${user.streak_count >= 2 
                    ? `<p style="font-size: 18px;">You're on a <strong style="color: #dc2626;">${user.streak_count}-day perfect game streak</strong> 🔥</p>
                       <p>Don't let it end! Play today to keep your streak alive.</p>`
                    : `<p style="font-size: 18px;">Don't forget to play today's NFL trivia!</p>
                       <p>Test your knowledge with 3 daily questions and compete on the leaderboard.</p>`
                  }
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${APP_URL}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Play Now →</a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    This is an automated reminder. You can manage your email preferences in your account settings.
                  </p>
                </div>
              </body>
              </html>
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
