import { supabase } from '../lib/supabase';

export interface LeaderboardRow {
  rank: number;
  username: string;
  score: number;
  /** Percent of correct answers (0–100). */
  pctCorrect: number;
}

function pctFromTotals(totalCorrect: number, totalQuestions: number): number {
  return totalQuestions <= 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);
}

export async function getDailyLeaderboard(limit = 50): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_daily_leaderboard', { limit_rows: limit });
  if (error) return { rows: [], error: new Error(error.message) };
  const rows = (data ?? []).map((r: { rank: number; username: string; score: number; total_correct?: number; total_questions?: number }) => {
    const score = Number(r.score);
    const totalCorrect = Number(r.total_correct ?? 0);
    const totalQuestions = Number(r.total_questions ?? 0);
    return {
      rank: Number(r.rank),
      username: r.username ?? 'Anonymous',
      score,
      pctCorrect: totalQuestions > 0 ? pctFromTotals(totalCorrect, totalQuestions) : (score <= 0 ? 0 : Math.round((score / 3) * 100)),
    };
  });
  return { rows, error: null };
}

export async function getMonthlyLeaderboard(limit = 50): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_monthly_leaderboard', { limit_rows: limit });
  if (error) return { rows: [], error: new Error(error.message) };
  const rows = (data ?? []).map((r: { rank: number; username: string; score: number; total_correct?: number; total_questions?: number }) => {
    const score = Number(r.score);
    const totalCorrect = Number(r.total_correct ?? 0);
    const totalQuestions = Number(r.total_questions ?? 0);
    return {
      rank: Number(r.rank),
      username: r.username ?? 'Anonymous',
      score,
      pctCorrect: totalQuestions > 0 ? pctFromTotals(totalCorrect, totalQuestions) : (score <= 0 ? 0 : Math.round((score / 3) * 100)),
    };
  });
  return { rows, error: null };
}

export async function getAllTimeLeaderboard(limit = 50): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_all_time_leaderboard', { limit_rows: limit });
  if (error) return { rows: [], error: new Error(error.message) };
  const rows = (data ?? []).map((r: { rank: number; username: string; total_correct: number; total_questions?: number }) => {
    const totalCorrect = Number(r.total_correct);
    const totalQuestions = Number(r.total_questions ?? 0);
    return {
      rank: Number(r.rank),
      username: r.username ?? 'Anonymous',
      score: totalCorrect,
      pctCorrect: pctFromTotals(totalCorrect, totalQuestions),
    };
  });
  return { rows, error: null };
}
