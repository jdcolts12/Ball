import { useState, useEffect, useCallback } from 'react';
import { getDailyLeaderboard, getMonthlyLeaderboard, getAllTimeLeaderboard, type LeaderboardRow } from '../services/leaderboard';
import type { BadgeId } from '../lib/badges';

const BADGE_EMOJIS: Record<BadgeId, string> = {
  perfect: '🏆',
  streak: '🔥',
  career75: '🏅',
  career85: '⭐',
  career95: '💎',
};

const BADGE_LABELS: Record<BadgeId, string> = {
  perfect: 'Perfect',
  streak: 'Streak',
  career75: '75%',
  career85: '85%',
  career95: '95%',
};

type Tab = 'daily' | 'monthly' | 'alltime';

interface LeaderboardScreenProps {
  onBack: () => void;
}

/** Request enough rows to show everyone who played (daily can have many users). */
const LEADERBOARD_LIMIT = 500;

function fetchLeaderboard(tab: Tab): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const fn = tab === 'daily' ? getDailyLeaderboard : tab === 'monthly' ? getMonthlyLeaderboard : getAllTimeLeaderboard;
  return fn(LEADERBOARD_LIMIT);
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [tab, setTab] = useState<Tab>('daily');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLeaderboard(tab).then(({ rows: r, error: e }) => {
      setRows(r);
      setError(e?.message ?? null);
      setLoading(false);
    });
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  // No auto-refresh on window focus so the daily leaderboard doesn't "randomly" refresh when switching tabs

  const label = tab === 'daily' ? 'Daily' : tab === 'monthly' ? 'Monthly' : 'Career';
  const scoreLabel = tab === 'alltime' ? 'Total correct' : 'Points';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col p-6 relative overflow-hidden">
      {/* Football field pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
        }}></div>
      </div>
      
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-black text-white" style={{ 
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          Leaderboard
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg text-sm font-semibold transition-all backdrop-blur-sm disabled:opacity-50"
            title="Refresh"
          >
            ↻ Refresh
          </button>
          <button type="button" onClick={onBack} className="px-4 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg text-sm font-semibold transition-all backdrop-blur-sm">
            Back
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {(['daily', 'monthly', 'alltime'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === t ? 'bg-white text-green-900 shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/20 border-2 border-white/30'
            }`}
          >
            {t === 'daily' ? 'Daily' : t === 'monthly' ? 'Monthly' : 'Career'}
          </button>
        ))}
      </div>
      {loading && <p className="text-white/70">Loading...</p>}
      {error && <p className="text-red-300 text-sm mb-4 bg-red-900/30 p-2 rounded border border-red-500/50">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-white/20">
                <th className="py-3 pr-4 text-white font-bold">#</th>
                <th className="py-3 pr-4 text-white font-bold">Username</th>
                <th className="py-3 pr-4 text-white font-bold">{scoreLabel}</th>
                <th className="py-3 pr-4 text-white font-bold">% correct</th>
                <th className="py-3 text-white font-bold">Badges</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-white/70 text-center">
                    No scores yet for {label.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.rank}-${r.username}`} className="border-b border-white/10">
                    <td className="py-3 pr-4 font-black text-yellow-400 text-lg">{r.rank}</td>
                    <td className="py-3 pr-4 text-white font-semibold">{r.username}</td>
                    <td className="py-3 pr-4 text-white">{r.score}</td>
                    <td className="py-3 pr-4 text-white font-medium">{r.pctCorrect}%</td>
                    <td className="py-3">
                      {r.badges && r.badges.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {r.badges.map((badgeId) => (
                            <span
                              key={badgeId}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs font-bold"
                              title={BADGE_LABELS[badgeId as BadgeId] ?? badgeId}
                            >
                              <span>{BADGE_EMOJIS[badgeId as BadgeId] ?? '🏅'}</span>
                              {badgeId === 'streak' && r.streakCount && (
                                <span>x{r.streakCount}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Badge Legend */}
      <div className="relative z-10 mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
        <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Badge Legend</h3>
        <div className="flex flex-wrap gap-3 text-xs">
          {tab === 'daily' && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">{BADGE_EMOJIS.perfect}</span>
              <span className="text-white/90"><strong>Perfect Game:</strong> Got all 3 questions correct today</span>
            </div>
          )}
          {tab === 'monthly' && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">{BADGE_EMOJIS.streak}</span>
              <span className="text-white/90"><strong>Perfect Game Streak:</strong> 2+ consecutive days with perfect games</span>
            </div>
          )}
          {tab === 'alltime' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{BADGE_EMOJIS.career95}</span>
                <span className="text-white/90">95%+ lifetime correct percentage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{BADGE_EMOJIS.career85}</span>
                <span className="text-white/90">85%+ lifetime correct percentage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{BADGE_EMOJIS.career75}</span>
                <span className="text-white/90">75%+ lifetime correct percentage</span>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
