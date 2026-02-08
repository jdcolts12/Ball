import { supabase } from '../lib/supabase';
import { getCareerPercentageBadges, getStreakBadge, calculatePerfectGameStreak } from '../lib/badges';
import type { Game } from '../types/database';

export interface LeaderboardRow {
  rank: number;
  /** User ID for linking to profile (may be missing on older all-time data) */
  userId?: string;
  username: string;
  score: number;
  /** Percent of correct answers (0–100). */
  pctCorrect: number;
  /** Badge IDs for this user */
  badges?: string[];
  /** Streak count (only for monthly leaderboard) */
  streakCount?: number;
}

function pctFromTotals(totalCorrect: number, totalQuestions: number): number {
  return totalQuestions <= 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);
}

/** Supabase API returns max 1000 rows per request. Paginate with offset so we get everyone. */
const DAILY_PAGE_SIZE = 1000;

type DailyRpcRow = { rank: number; user_id: string; username: string; score: number; total_correct?: number; total_questions?: number };

function mapDailyRow(r: DailyRpcRow): LeaderboardRow {
  const score = Number(r.score);
  const totalCorrect = Number(r.total_correct ?? 0);
  const totalQuestions = Number(r.total_questions ?? 0);
  const badges: string[] = score === 4 ? ['perfect'] : [];
  return {
    rank: Number(r.rank),
    userId: r.user_id ?? undefined,
    username: r.username ?? 'Anonymous',
    score,
    pctCorrect: totalQuestions > 0 ? pctFromTotals(totalCorrect, totalQuestions) : (score <= 0 ? 0 : Math.round((score / 4) * 100)),
    badges: badges.length > 0 ? badges : undefined,
  };
}

export async function getDailyLeaderboard(limit = 999999): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const allData: DailyRpcRow[] = [];
  let offset = 0;
  let usedFallback = false;
  while (true) {
    const params: { limit_rows: number; offset_rows?: number } = {
      limit_rows: DAILY_PAGE_SIZE,
      offset_rows: offset,
    };
    const { data, error } = await supabase.rpc('get_daily_leaderboard', params);
    if (error) {
      if (!usedFallback && (error.message.includes('function') || error.message.includes('does not exist'))) {
        usedFallback = true;
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('get_daily_leaderboard', {
          limit_rows: limit,
        });
        if (fallbackError) {
          console.error('Daily leaderboard error:', fallbackError);
          return { rows: [], error: new Error(fallbackError.message) };
        }
        const arr = (fallbackData ?? []) as DailyRpcRow[];
        console.log('Daily leaderboard (single call) returned', arr.length, 'rows. Run RUN_DAILY_LEADERBOARD_FIX.sql in Supabase to show everyone.');
        return { rows: arr.map(mapDailyRow), error: null };
      }
      console.error('Daily leaderboard error:', error);
      return { rows: [], error: new Error(error.message) };
    }
    const chunk = (data ?? []) as DailyRpcRow[];
    allData.push(...chunk);
    if (chunk.length < DAILY_PAGE_SIZE) break;
    offset += DAILY_PAGE_SIZE;
    if (offset >= limit) break;
  }
  console.log('Daily leaderboard returned', allData.length, 'rows');
  return { rows: allData.map(mapDailyRow), error: null };
}

export async function getMonthlyLeaderboard(limit = 500): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_monthly_leaderboard', { limit_rows: limit });
  if (error) return { rows: [], error: new Error(error.message) };
  
  // Get user_ids from leaderboard results
  const userIds = (data ?? []).map((r: { user_id: string }) => r.user_id).filter(Boolean);
  
  // Fetch only recent games (last 90 days) with a row limit — enough for streak calc, avoids slow fetch
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const since = ninetyDaysAgo.toISOString();

  let gamesByUserId = new Map<string, Game[]>();
  if (userIds.length > 0) {
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .in('user_id', userIds)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(2500);

    if (!gamesError && gamesData) {
      for (const game of gamesData as Game[]) {
        if (!gamesByUserId.has(game.user_id)) {
          gamesByUserId.set(game.user_id, []);
        }
        gamesByUserId.get(game.user_id)!.push(game);
      }
    }
  }
  
  const rows = (data ?? []).map((r: { rank: number; user_id: string; username: string; score: number; total_correct?: number; total_questions?: number }) => {
    const score = Number(r.score);
    const totalCorrect = Number(r.total_correct ?? 0);
    const totalQuestions = Number(r.total_questions ?? 0);
    const pctCorrect = totalQuestions > 0 ? pctFromTotals(totalCorrect, totalQuestions) : (score <= 0 ? 0 : Math.round((score / 3) * 100));
    const badges: string[] = [];
    
    // Streak badge for monthly
    const userGames = gamesByUserId.get(r.user_id) ?? [];
    const streakCount = calculatePerfectGameStreak(userGames);
    const streakBadge = getStreakBadge(streakCount);
    if (streakBadge) {
      badges.push(streakBadge.id);
    }
    
    return {
      rank: Number(r.rank),
      userId: r.user_id ?? undefined,
      username: r.username ?? 'Anonymous',
      score,
      pctCorrect,
      badges: badges.length > 0 ? badges : undefined,
      streakCount: streakCount >= 2 ? streakCount : undefined,
    };
  });
  return { rows, error: null };
}

export async function getAllTimeLeaderboard(limit = 500): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_all_time_leaderboard', { limit_rows: limit });
  if (error) return { rows: [], error: new Error(error.message) };
  const rows = (data ?? []).map((r: { rank: number; user_id?: string; username: string; total_correct: number; total_questions?: number }) => {
    const totalCorrect = Number(r.total_correct);
    const totalQuestions = Number(r.total_questions ?? 0);
    const pctCorrect = pctFromTotals(totalCorrect, totalQuestions);
    const careerBadges = getCareerPercentageBadges(totalCorrect, totalQuestions);
    return {
      rank: Number(r.rank),
      userId: r.user_id ?? undefined,
      username: r.username ?? 'Anonymous',
      score: totalCorrect,
      pctCorrect,
      badges: careerBadges.map(b => b.id),
    };
  });
  return { rows, error: null };
}
