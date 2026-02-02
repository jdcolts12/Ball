import type { GameResultBreakdown } from './GameScreen';

const BADGES: { id: string; label: string; emoji: string; earned: (b: GameResultBreakdown) => boolean }[] = [
  { id: 'perfect', label: 'Perfect Game', emoji: '🏆', earned: (b) => b.draftCorrect && b.collegeCorrect && b.careerPathCorrect },
  { id: 'draft', label: 'Draft Master', emoji: '📋', earned: (b) => b.draftCorrect },
  { id: 'college', label: 'College Expert', emoji: '🎓', earned: (b) => b.collegeCorrect },
  { id: 'career', label: 'Career Path Pro', emoji: '🛤️', earned: (b) => b.careerPathCorrect },
];

interface ResultsScreenProps {
  score: number;
  correct: number;
  total: number;
  breakdown: GameResultBreakdown;
  onLeaderboard: () => void;
  onHome: () => void;
}

export function ResultsScreen({ score, correct, total, breakdown, onLeaderboard, onHome }: ResultsScreenProps) {
  const earnedBadges = BADGES.filter((badge) => badge.earned(breakdown));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold text-white">Game over</h1>
        <p className="text-2xl text-amber-400">
          {correct} / {total} correct
        </p>
        {earnedBadges.length > 0 && (
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Badges earned this game</p>
            <div className="flex flex-wrap justify-center gap-2">
              {earnedBadges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-sm font-medium"
                  title={badge.label}
                >
                  <span>{badge.emoji}</span>
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-slate-400">
          Come back tomorrow for 3 more questions. {breakdown ? 'Your stats are saved.' : ''}
        </p>
        <div className="flex flex-col gap-2 pt-4">
          <button
            type="button"
            onClick={onLeaderboard}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            View leaderboard
          </button>
          <button
            type="button"
            onClick={onHome}
            className="text-slate-400 hover:text-white text-sm"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
