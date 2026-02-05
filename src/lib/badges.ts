/**
 * Badge system for YunoBall
 * 
 * Badges:
 * - Perfect Game: Get all 4 questions correct in one game
 * - Perfect Game Streak: Consecutive days with perfect games (x2, x3, etc.)
 * - Career Percentage Badges: 75%, 85%, 95% career correct percentage
 */

export type BadgeId = 'perfect' | 'streak' | 'career75' | 'career85' | 'career95';

export interface Badge {
  id: BadgeId;
  label: string;
  emoji: string;
  /** For streak badges, the streak count */
  streakCount?: number;
}

/**
 * Calculate perfect game streak from game history.
 * Returns the current streak count (0 if no streak).
 */
export function calculatePerfectGameStreak(games: Array<{ created_at: string; correct_answers: number; questions_answered: number }>): number {
  if (games.length === 0) return 0;
  
  // Sort by date descending (most recent first)
  const sorted = [...games].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Group by date (YYYY-MM-DD)
  const gamesByDate = new Map<string, typeof games>();
  for (const game of sorted) {
    const date = new Date(game.created_at).toISOString().split('T')[0];
    if (!gamesByDate.has(date)) {
      gamesByDate.set(date, []);
    }
    gamesByDate.get(date)!.push(game);
  }
  
  // Check consecutive days for perfect games (all questions correct - 3 for old games, 4 for new games)
  let streak = 0;
  const dates = Array.from(gamesByDate.keys()).sort((a, b) => b.localeCompare(a)); // Most recent first
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayGames = gamesByDate.get(date)!;
    // Check if any game that day was perfect (all questions correct - works for both 3 and 4 question games)
    const hasPerfectGame = dayGames.some(g => g.correct_answers === g.questions_answered && g.questions_answered >= 3);
    
    if (!hasPerfectGame) {
      break; // Streak broken
    }
    
    // Check if this is the first day OR if the previous day is exactly 1 day before
    if (i === 0) {
      streak = 1;
    } else {
      const prevDate = dates[i - 1];
      const currentDateObj = new Date(date + 'T00:00:00');
      const prevDateObj = new Date(prevDate + 'T00:00:00');
      const daysDiff = Math.floor((prevDateObj.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break; // Not consecutive days
      }
    }
  }
  
  return streak;
}

/**
 * Get career percentage badge based on total correct percentage.
 * Returns only the highest badge earned (one badge per player).
 */
export function getCareerPercentageBadges(totalCorrect: number, totalQuestions: number): Badge[] {
  if (totalQuestions === 0) return [];
  
  const pct = (totalCorrect / totalQuestions) * 100;
  
  // Return only the highest badge earned
  if (pct >= 95) {
    return [{ id: 'career95', label: '95% Career', emoji: '💎' }];
  }
  if (pct >= 85) {
    return [{ id: 'career85', label: '85% Career', emoji: '⭐' }];
  }
  if (pct >= 75) {
    return [{ id: 'career75', label: '75% Career', emoji: '🏅' }];
  }
  
  return [];
}

/**
 * Get badges for a single game result.
 */
export function getGameBadges(breakdown: { draftCorrect: boolean; collegeCorrect: boolean; careerPathCorrect: boolean; seasonLeaderCorrect?: boolean }): Badge[] {
  const badges: Badge[] = [];
  
  // Perfect game: all questions correct
  // Old games (3 questions): check 3 fields
  // New games (4 questions): check all 4 fields
  const isPerfect = breakdown.seasonLeaderCorrect !== undefined
    ? breakdown.draftCorrect && breakdown.collegeCorrect && breakdown.careerPathCorrect && breakdown.seasonLeaderCorrect
    : breakdown.draftCorrect && breakdown.collegeCorrect && breakdown.careerPathCorrect;
  if (isPerfect) {
    badges.push({ id: 'perfect', label: 'Perfect Game', emoji: '🏆' });
  }
  
  return badges;
}

/**
 * Get streak badge if streak >= 2.
 */
export function getStreakBadge(streakCount: number): Badge | null {
  if (streakCount >= 2) {
    return { 
      id: 'streak', 
      label: `Perfect Game Streak x${streakCount}`, 
      emoji: '🔥',
      streakCount 
    };
  }
  return null;
}
