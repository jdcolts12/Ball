import { useState, useEffect } from 'react';
import { getTimeUntilMidnightPST } from '../lib/dailyPlayLimit';
import { getUserPublicProfile } from '../services/profile';
import { getAllTimeLeaderboard } from '../services/leaderboard';

interface QuizFinishedPopupProps {
  correct: number;
  total: number;
  userId: string;
  /** User's career leaderboard rank before this game (1-based), or null if unknown. */
  careerRankBefore: number | null;
  /** Close popup and go to Today's Stats screen. */
  onClose: () => void;
}

export function QuizFinishedPopup({
  correct,
  total,
  userId,
  careerRankBefore,
  onClose,
}: QuizFinishedPopupProps) {
  const todayPct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const isPerfectGame = total > 0 && correct === total;
  const [streak, setStreak] = useState<number | null>(null);
  const [careerMovement, setCareerMovement] = useState<number | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>(() => getTimeUntilMidnightPST());

  useEffect(() => {
    setTimeUntilNext(getTimeUntilMidnightPST());
    const interval = setInterval(() => setTimeUntilNext(getTimeUntilMidnightPST()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getUserPublicProfile(userId).then(({ profile, error }) => {
      if (!cancelled && !error && profile) {
        setStreak(profile.consecutive_days_played ?? 0);
      } else if (!cancelled) {
        setStreak(0);
      }
    });

    getAllTimeLeaderboard(500).then(({ rows, error }) => {
      if (cancelled || error || !rows.length) return;
      const myRow = rows.find((r) => r.userId === userId);
      const newRank = myRow ? myRow.rank : null;
      if (careerRankBefore != null && newRank != null) {
        setCareerMovement(careerRankBefore - newRank);
      } else {
        setCareerMovement(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId, careerRankBefore]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-green-900 to-green-800 border-2 border-white/20 shadow-2xl overflow-hidden">
        {/* X button - top right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-bold transition-colors z-10"
          aria-label="Close and go to Today's Stats"
        >
          ×
        </button>

        <div className="p-6 pt-10 pb-6 space-y-5 text-white">
          {isPerfectGame && (
            <p className="text-center text-amber-300 font-black text-lg uppercase tracking-wide py-2 px-4 rounded-xl bg-amber-500/20 border-2 border-amber-400/50">
              Perfect Game
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
              <div className="text-3xl font-black text-amber-300">{todayPct}%</div>
              <div className="text-sm text-white/90 font-semibold uppercase tracking-wide mt-1">Today&apos;s score</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
              <div className="text-3xl font-black text-white">{streak ?? '—'}</div>
              <div className="text-sm text-white/90 font-semibold uppercase tracking-wide mt-1">Game streak</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20 col-span-2">
              <div className="text-2xl font-black font-mono text-amber-300">{timeUntilNext}</div>
              <div className="text-sm text-white/90 font-semibold uppercase tracking-wide mt-1">Next game in</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20 col-span-2">
              <div className="text-2xl font-black text-white">
                {careerMovement === null
                  ? '—'
                  : careerMovement > 0
                    ? `↑ ${careerMovement} spot${careerMovement === 1 ? '' : 's'}`
                    : careerMovement < 0
                      ? `↓ ${Math.abs(careerMovement)} spot${Math.abs(careerMovement) === 1 ? '' : 's'}`
                      : 'No change'}
              </div>
              <div className="text-sm text-white/90 font-semibold uppercase tracking-wide mt-1">Career leaderboard</div>
            </div>
          </div>

          <p className="text-center text-white/70 text-sm">
            Tap × to view Today&apos;s Stats
          </p>
        </div>
      </div>
    </div>
  );
}
