import { useState, useEffect } from 'react';
import type { GameResultBreakdown } from './GameScreen';
import { getGameBadges, getStreakBadge, calculatePerfectGameStreak, type Badge } from '../lib/badges';
import { getUserGameHistory } from '../services/games';
import { getUserPublicProfile } from '../services/profile';

interface ResultsScreenProps {
  score: number;
  correct: number;
  total: number;
  breakdown: GameResultBreakdown;
  currentUserId: string;
  onLeaderboard: () => void;
  onHome: () => void;
  onOpenProfile: (userId: string) => void;
}

export function ResultsScreen({ score, correct, total, breakdown, currentUserId, onLeaderboard, onHome, onOpenProfile }: ResultsScreenProps) {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStreak, setGameStreak] = useState<number>(0);

  useEffect(() => {
    async function calculateBadges() {
      setLoading(true);
      // Get game badges (Perfect Game)
      const gameBadges = getGameBadges(breakdown);
      
      // If perfect game, check for streak
      if (gameBadges.length > 0) {
        const { games, error } = await getUserGameHistory();
        if (!error && games.length > 0) {
          const streak = calculatePerfectGameStreak(games);
          const streakBadge = getStreakBadge(streak);
          if (streakBadge) {
            gameBadges.push(streakBadge);
          }
        }
      }
      
      setEarnedBadges(gameBadges);
      setLoading(false);
    }
    
    async function fetchGameStreak() {
      try {
        const { profile, error } = await getUserPublicProfile(currentUserId);
        if (!error && profile) {
          setGameStreak(profile.consecutive_days_played ?? 0);
        } else {
          // Default to 0 if fetch fails
          setGameStreak(0);
        }
      } catch (err) {
        // Default to 0 on error
        setGameStreak(0);
      }
    }
    
    calculateBadges();
    fetchGameStreak();
  }, [breakdown, currentUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Football field pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
        }}></div>
      </div>
      
      <div className="text-center space-y-6 max-w-md relative z-10">
        <h1 className="text-4xl font-black text-white" style={{ 
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          Game Over
        </h1>
        <div className="h-1 w-24 bg-white mx-auto rounded-full"></div>
        <p className="text-3xl font-black text-white">
          {correct} / {total} correct
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border-2 border-white/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <p className="text-white/80 text-sm uppercase tracking-wide">Game Streak</p>
          </div>
          <p className="text-3xl font-black text-white">
            {gameStreak} {gameStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        {!loading && earnedBadges.length > 0 && (
          <div className="space-y-3 bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/20">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">Badges Earned</p>
            <div className="flex flex-wrap justify-center gap-2">
              {earnedBadges.map((badge) => (
                <span
                  key={badge.id + (badge.streakCount ?? '')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 text-white border-2 border-white/30 text-sm font-bold"
                  title={badge.label}
                >
                  <span className="text-lg">{badge.emoji}</span>
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-white text-lg font-semibold">
          Come back tomorrow for 4 more questions
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={onLeaderboard}
            className="px-6 py-3 bg-white text-green-900 hover:bg-yellow-400 font-black text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wide"
          >
            View leaderboard
          </button>
          <button
            type="button"
            onClick={() => onOpenProfile(currentUserId)}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 hover:border-white/60 font-bold text-base rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            My Profile
          </button>
          <button
            type="button"
            onClick={onHome}
            className="text-white/80 hover:text-white text-sm font-semibold transition-colors underline decoration-white/30 hover:decoration-white"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
