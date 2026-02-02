/**
 * Types matching Supabase tables: profiles (users), games, stats.
 * Use with Supabase generated types when you run codegen.
 */

export interface Profile {
  id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  user_id: string;
  score: number;
  questions_answered: number;
  correct_answers: number;
  created_at: string;
  correct_draft?: boolean;
  correct_college?: boolean;
  correct_career_path?: boolean;
}

export interface Stats {
  user_id: string;
  total_games: number;
  total_questions: number;
  total_correct: number;
  best_score: number;
  updated_at: string;
  /** Date the user last completed a game (YYYY-MM-DD). */
  last_played: string | null;
}

export interface GameInsert {
  user_id: string;
  score: number;
  questions_answered: number;
  correct_answers: number;
  correct_draft?: boolean;
  correct_college?: boolean;
  correct_career_path?: boolean;
}

export interface StatsUpdate {
  total_games?: number;
  total_questions?: number;
  total_correct?: number;
  best_score?: number;
  updated_at?: string;
  last_played?: string | null;
}
