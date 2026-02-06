/**
 * Types matching Supabase tables: profiles (users), games, stats.
 * Use with Supabase generated types when you run codegen.
 */

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Public profile + stats returned by get_user_public_profile */
export interface UserPublicProfile {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  career_pct: number;
  total_correct: number;
  total_questions: number;
  /** Total games completed (for "Games played" display) */
  total_games: number;
  /** Consecutive days played (displayed as "Game streak") */
  consecutive_days_played: number;
  best_perfect_streak: number;
}

/** Friendship status with another user */
export type FriendshipStatus = 'friends' | 'pending_sent' | 'pending_received' | null;

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
  user_answer_draft?: string | null;
  user_answer_college?: string | null;
  user_answer_career_path?: string | null;
  user_answer_season_leader?: string | null;
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
  user_answer_draft?: string | null;
  user_answer_college?: string | null;
  user_answer_career_path?: string | null;
  user_answer_season_leader?: string | null;
}

export interface StatsUpdate {
  total_games?: number;
  total_questions?: number;
  total_correct?: number;
  best_score?: number;
  updated_at?: string;
  last_played?: string | null;
}
