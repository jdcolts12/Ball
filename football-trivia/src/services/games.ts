import { supabase } from '../lib/supabase';
import type { GameInsert, Stats } from '../types/database';

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

/** Include current player's answer in the percentage (game isn't saved until all 3 questions are done). */
export function includeCurrentPlayer(total: number, correct: number, currentCorrect: boolean): number {
  const newTotal = total + 1;
  const newCorrect = correct + (currentCorrect ? 1 : 0);
  return newTotal === 0 ? 0 : Math.round((100 * newCorrect) / newTotal);
}
