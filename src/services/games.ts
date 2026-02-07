import { supabase } from '../lib/supabase';
import type { GameInsert, Stats, Game } from '../types/database';

/**
 * Record a completed game. The Supabase trigger updates stats.
 * Optional breakdown is used for badges (draft, college, career path).
 */
export async function recordCompletedGame(payload: {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  correctDraft?: boolean;
  correctCollege?: boolean;
  correctCareerPath?: boolean;
  userAnswerDraft?: string;
  userAnswerCollege?: string;
  userAnswerCareerPath?: string;
  userAnswerSeasonLeader?: string;
}): Promise<{ gameId: string | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { gameId: null, error: new Error('Not authenticated') };
  }

  const row: GameInsert = {
    user_id: user.id,
    score: payload.score,
    questions_answered: payload.questionsAnswered,
    correct_answers: payload.correctAnswers,
    correct_draft: payload.correctDraft ?? false,
    correct_college: payload.correctCollege ?? false,
    correct_career_path: payload.correctCareerPath ?? false,
    user_answer_draft: payload.userAnswerDraft ?? null,
    user_answer_college: payload.userAnswerCollege ?? null,
    user_answer_career_path: payload.userAnswerCareerPath ?? null,
    user_answer_season_leader: payload.userAnswerSeasonLeader ?? null,
  };

  const { data, error } = await supabase
    .from('games')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    return { gameId: null, error: new Error(error.message) };
  }
  return { gameId: data?.id ?? null, error: null };
}

/**
 * Fetch the current user's stats (updated after each completed game by the DB trigger).
 */
export async function getCurrentStats(): Promise<{ stats: Stats | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { stats: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('stats')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return { stats: null, error: new Error(error.message) };
  }
  return { stats: data as Stats | null, error: null };
}

/**
 * Get PST date boundaries (start and end of day) as ISO strings.
 * Handles both PST (UTC-8) and PDT (UTC-7) automatically by detecting DST.
 */
function getPSTDateBoundaries(): { startISO: string; endISO: string } {
  // Get current date in PST/PDT
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const pstDate = dateFormatter.format(now); // YYYY-MM-DD format
  const [year, month, day] = pstDate.split('-').map(Number);
  
  // Determine if DST is in effect by checking what time UTC noon is in PST
  // If UTC noon is 4am PST, it's PST (-08:00); if 5am PDT, it's PDT (-07:00)
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const pstHour = parseInt(utcNoon.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    hour12: false
  }));
  
  // UTC noon = 4am PST means offset is -8; UTC noon = 5am PDT means offset is -7
  const offset = pstHour === 4 ? '-08:00' : '-07:00';
  
  // Create ISO strings for PST midnight and end of day
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const startISO = new Date(`${dateStr}T00:00:00${offset}`).toISOString();
  const endISO = new Date(`${dateStr}T23:59:59.999${offset}`).toISOString();
  
  return { startISO, endISO };
}

/**
 * Get current PST week boundaries: Sunday 00:00 to Saturday 23:59:59.999 (America/Los_Angeles).
 * Used for weekly badge on profile.
 */
function getPSTWeekBoundaries(): { startISO: string; endISO: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value ?? '0', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value ?? '1', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value ?? '1', 10);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[weekday] ?? 0;
  const startDate = new Date(year, month - 1, day - dayOfWeek);
  const endDate = new Date(year, month - 1, day - dayOfWeek + 6);
  const isDST = now.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' }).includes('PDT');
  const offsetHours = isDST ? 7 : 8;
  const startUTC = new Date(Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    offsetHours,
    0,
    0,
    0
  ));
  const sundayNextWeek = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 7);
  const endUTC = new Date(Date.UTC(
    sundayNextWeek.getFullYear(),
    sundayNextWeek.getMonth(),
    sundayNextWeek.getDate(),
    offsetHours,
    0,
    0,
    0
  ) - 1);
  return { startISO: startUTC.toISOString(), endISO: endUTC.toISOString() };
}

/**
 * Get current user's correct % for the current week (Sunday–Saturday PST). For profile weekly badge.
 */
export async function getCurrentUserWeeklyPct(): Promise<{
  correct: number;
  total: number;
  pct: number;
  error: Error | null;
}> {
  const { games, error } = await getUserGameHistory();
  if (error) return { correct: 0, total: 0, pct: 0, error };
  const { startISO, endISO } = getPSTWeekBoundaries();
  let correct = 0;
  let total = 0;
  for (const g of games) {
    const at = g.created_at ?? '';
    if (at >= startISO && at <= endISO) {
      correct += g.correct_answers ?? 0;
      total += g.questions_answered ?? 0;
    }
  }
  const pct = total > 0 ? (correct / total) * 100 : 0;
  return { correct, total, pct, error: null };
}

/**
 * Fetch today's game for the current user (most recent game created today, PST timezone).
 * Uses PST midnight → PST end-of-day converted to ISO for UTC comparison.
 * This matches the SQL functions which use PST timezone.
 */
export async function getTodaysGame(): Promise<{ game: Game | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { game: null, error: new Error('Not authenticated') };
  }

  const { startISO, endISO } = getPSTDateBoundaries();

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startISO)
    .lte('created_at', endISO)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { game: null, error: new Error(error.message) };
  }
  return { game: data as Game | null, error: null };
}

/**
 * Returns true if the current user has already played today (server source of truth).
 */
export async function hasPlayedTodayFromServer(): Promise<{ played: boolean; error: Error | null }> {
  const { game, error } = await getTodaysGame();
  return { played: !!game, error };
}

/**
 * Fetch user's game history (for calculating streaks).
 */
export async function getUserGameHistory(): Promise<{ games: Game[]; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { games: [], error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { games: [], error: new Error(error.message) };
  }
  return { games: (data ?? []) as Game[], error: null };
}

export interface CorrectPctTodayResult {
  /** 0–100; includes current player's answer when you pass currentCorrect. */
  pct: number;
  total: number;
  correct: number;
  error: Error | null;
}

async function getCorrectStatsToday(rpcName: string): Promise<CorrectPctTodayResult> {
  const { data, error } = await supabase.rpc(rpcName);
  if (error) return { pct: 0, total: 0, correct: 0, error: new Error(error.message) };
  const row = Array.isArray(data) && data[0] ? (data[0] as { pct?: number; total?: number; correct?: number }) : data as { pct?: number; total?: number; correct?: number } | null;
  const total = Number(row?.total ?? 0);
  const correct = Number(row?.correct ?? 0);
  const pct = typeof row?.pct === 'number' ? row.pct : Number(row?.pct ?? 0);
  return { pct: Math.round(pct), total, correct, error: null };
}

/** Stats for draft question today. Use includeCurrentPlayer(result, currentCorrect) to get display %. */
export async function getDraftCorrectPctToday(): Promise<CorrectPctTodayResult> {
  return getCorrectStatsToday('get_draft_correct_pct_today');
}

/** Stats for college question today. Use includeCurrentPlayer(result, currentCorrect) to get display %. */
export async function getCollegeCorrectPctToday(): Promise<CorrectPctTodayResult> {
  return getCorrectStatsToday('get_college_correct_pct_today');
}

/** Stats for career path question today. Use includeCurrentPlayer(result, currentCorrect) to get display %. */
export async function getCareerPathCorrectPctToday(): Promise<CorrectPctTodayResult> {
  return getCorrectStatsToday('get_career_path_correct_pct_today');
}

/** Include current player's answer in the percentage (game isn't saved until all questions are done). */
export function includeCurrentPlayer(total: number, correct: number, currentCorrect: boolean): number {
  const newTotal = total + 1;
  const newCorrect = correct + (currentCorrect ? 1 : 0);
  return newTotal === 0 ? 0 : Math.round((100 * newCorrect) / newTotal);
}
