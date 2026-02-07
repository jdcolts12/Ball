import { useState, useEffect, useCallback } from 'react';
import { getDailyLeaderboard, getMonthlyLeaderboard, getAllTimeLeaderboard, type LeaderboardRow } from '../services/leaderboard';
import { getMyFriendIds } from '../services/friends';
import type { BadgeId } from '../lib/badges';

const BADGE_EMOJIS: Record<BadgeId, string> = {
  perfect: '🏆',
  streak: '🔥',
  career70: '🏅',
  career80: '⭐',
  career90: '💎',
};

const BADGE_LABELS: Record<BadgeId, string> = {
  perfect: 'Perfect',
  streak: 'Streak',
  career70: '70%',
  career80: '80%',
  career90: '90%',
};

type Tab = 'daily' | 'monthly' | 'alltime';

interface LeaderboardScreenProps {
  currentUserId: string;
  onBack: () => void;
  onOpenProfile: (userId: string) => void;
}

/** Daily: request enough rows to show everyone who played today. Monthly/Career: smaller limit. */
const DAILY_LEADERBOARD_LIMIT = 999999; // Effectively no limit - show all players
const OTHER_LEADERBOARD_LIMIT = 500;

function fetchLeaderboard(tab: Tab): Promise<{ rows: LeaderboardRow[]; error: Error | null }> {
  const limit = tab === 'daily' ? DAILY_LEADERBOARD_LIMIT : OTHER_LEADERBOARD_LIMIT;
  const fn = tab === 'daily' ? getDailyLeaderboard : tab === 'monthly' ? getMonthlyLeaderboard : getAllTimeLeaderboard;
  return fn(limit);
}

export function LeaderboardScreen({ currentUserId, onBack, onOpenProfile }: LeaderboardScreenProps) {
  const [tab, setTab] = useState<Tab>('daily');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [friendsOnly, setFriendsOnly] = useState(false);

  const loadFriendIds = useCallback(() => {
    getMyFriendIds().then(({ friendIds: ids }) => {
      setFriendIds(new Set(ids));
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // Refetch friend list so it's up to date (e.g. after accepting on profile)
    loadFriendIds();
    fetchLeaderboard(tab).then(({ rows: r, error: e }) => {
      setRows(r);
      setError(e?.message ?? null);
      setLoading(false);
    });
  }, [tab, loadFriendIds]);

  useEffect(() => {
    load();
  }, [load]);

  // No auto-refresh on window focus so the daily leaderboard doesn't "randomly" refresh when switching tabs

  const label = tab === 'daily' ? 'Daily' : tab === 'monthly' ? 'Monthly' : 'Career';
  const scoreLabel = tab === 'alltime' ? 'Total correct' : 'Points';

  const displayRows = friendsOnly
    ? rows.filter((r) => r.userId && friendIds.has(r.userId))
    : rows;

  return (
    <div className="h-screen max-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col p-3 sm:p-4 relative overflow-hidden">
      {/* Football field pattern background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-0 gap-2 sm:gap-3">
        {/* Header: title + buttons */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Leaderboard
          </h1>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenProfile(currentUserId)}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm"
              title="My Profile"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm disabled:opacity-50"
              title="Refresh"
            >
              ↻ Refresh
            </button>
            <button type="button" onClick={onBack} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm">
              Back
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0 gap-1.5 sm:gap-2">
          {(['daily', 'monthly', 'alltime'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                tab === t ? 'bg-white text-green-900 shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/20 border-2 border-white/30'
              }`}
            >
              {t === 'daily' ? 'Daily' : t === 'monthly' ? 'Monthly' : 'Career'}
            </button>
          ))}
        </div>

        {loading && <p className="flex-shrink-0 text-white/70 text-sm">Loading...</p>}
        {error && (
          <p className="flex-shrink-0 text-red-300 text-xs sm:text-sm p-2 rounded border border-red-500/50 bg-red-900/30">{error}</p>
        )}
        {/* Friends-only filter */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-white/80 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={friendsOnly}
              onChange={(e) => setFriendsOnly(e.target.checked)}
              className="rounded border-white/50 bg-white/10"
            />
            Friends only
          </label>
        </div>
        {!loading && !error && displayRows.length > 0 && (
          <p className="flex-shrink-0 text-white/60 text-xs">
            Showing {displayRows.length} {displayRows.length === 1 ? 'player' : 'players'}
            {friendsOnly && rows.length > 0 && ` (${rows.length} total)`}
          </p>
        )}

        {/* Table: scrollable area that fills remaining space */}
        {!loading && !error && (
          <div className="flex-1 min-h-0 flex flex-col -mx-1 sm:mx-0 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto overscroll-contain p-2 sm:p-3">
              <table className="w-full min-w-[300px] text-left text-xs sm:text-sm">
                <thead className="sticky top-0 z-[1] bg-green-800/95 backdrop-blur-sm">
                  <tr className="border-b-2 border-white/20">
                    <th className="py-1.5 pr-2 sm:py-2 sm:pr-3 text-white font-bold whitespace-nowrap w-10">#</th>
                    <th className="py-1.5 pr-3 sm:py-2 sm:pr-4 text-white font-bold whitespace-nowrap min-w-[120px]">Username</th>
                    <th className="py-1.5 pr-2 sm:py-2 sm:pr-2 text-white font-bold whitespace-nowrap w-16 text-right">{scoreLabel}</th>
                    <th className="py-1.5 pr-2 sm:py-2 sm:pr-3 text-white font-bold whitespace-nowrap w-14 text-right">%</th>
                    <th className="py-1.5 sm:py-2 text-white font-bold whitespace-nowrap">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-white/70 text-center text-sm">
                        {friendsOnly ? 'No friends on this leaderboard.' : `No scores yet for ${label.toLowerCase()}.`}
                      </td>
                    </tr>
                  ) : (
                    displayRows.map((r) => {
                      const isFriend = r.userId ? friendIds.has(r.userId) : false;
                      const isCurrentUser = r.userId === currentUserId;
                      const canOpenProfile = !!r.userId;
                      const nameClass = isCurrentUser ? 'text-sky-200' : isFriend ? 'text-yellow-300' : 'text-white';
                      return (
                      <tr key={`${r.rank}-${r.userId ?? r.username}-${r.score}`} className="border-b border-white/10">
                        <td className="py-1.5 pr-2 sm:py-2 sm:pr-3 font-black text-yellow-400 align-middle">{r.rank}</td>
                        <td className="py-1.5 pr-3 sm:py-2 sm:pr-4 font-semibold align-middle" title={r.username}>
                          {canOpenProfile ? (
                            <button
                              type="button"
                              onClick={() => onOpenProfile(r.userId!)}
                              className={`block truncate max-w-[200px] sm:max-w-none text-left w-full hover:underline cursor-pointer ${nameClass}`}
                            >
                              {r.username}
                            </button>
                          ) : (
                            <span className={`block truncate max-w-[200px] sm:max-w-none ${nameClass}`}>
                              {r.username}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 pr-2 sm:py-2 sm:pr-2 text-white align-middle text-right">{r.score}</td>
                        <td className="py-1.5 pr-2 sm:py-2 sm:pr-3 text-white font-medium align-middle text-right">{r.pctCorrect}%</td>
                        <td className="py-1.5 sm:py-2 align-middle">
                          {r.badges && r.badges.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
                              {r.badges.map((badgeId) => (
                                <span
                                  key={badgeId}
                                  className="inline-flex items-center gap-0.5 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded bg-white/20 text-white border border-white/30 text-[10px] sm:text-xs font-bold"
                                  title={BADGE_LABELS[badgeId as BadgeId] ?? badgeId}
                                >
                                  <span>{BADGE_EMOJIS[badgeId as BadgeId] ?? '🏅'}</span>
                                  {badgeId === 'streak' && r.streakCount && <span>x{r.streakCount}</span>}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/40">—</span>
                          )}
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Badge Legend - compact at bottom */}
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          <h3 className="text-[10px] sm:text-xs font-bold text-white mb-1.5 uppercase tracking-wide">Badge Legend</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-white/90">
            {tab === 'daily' && (
              <span className="flex items-center gap-1"><span>{BADGE_EMOJIS.perfect}</span><strong>Perfect:</strong> 4/4 today</span>
            )}
            {tab === 'monthly' && (
              <span className="flex items-center gap-1"><span>{BADGE_EMOJIS.streak}</span><strong>Streak:</strong> 2+ days perfect</span>
            )}
            {tab === 'alltime' && (
              <>
                <span className="flex items-center gap-1"><span>{BADGE_EMOJIS.career90}</span>90%+</span>
                <span className="flex items-center gap-1"><span>{BADGE_EMOJIS.career80}</span>80%+</span>
                <span className="flex items-center gap-1"><span>{BADGE_EMOJIS.career70}</span>70%+</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
