import { useState, useEffect } from 'react';
import { getDailyLeaderboard, getMonthlyLeaderboard, getAllTimeLeaderboard, type LeaderboardRow } from '../services/leaderboard';

type Tab = 'daily' | 'monthly' | 'alltime';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [tab, setTab] = useState<Tab>('daily');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetch = tab === 'daily' ? getDailyLeaderboard : tab === 'monthly' ? getMonthlyLeaderboard : getAllTimeLeaderboard;
    fetch(50).then(({ rows: r, error: e }) => {
      setRows(r);
      setError(e?.message ?? null);
      setLoading(false);
    });
  }, [tab]);

  const label = tab === 'daily' ? 'Daily' : tab === 'monthly' ? 'Monthly' : 'Career';
  const scoreLabel = tab === 'alltime' ? 'Total correct' : 'Points';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <button type="button" onClick={onBack} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg border border-slate-600 hover:border-slate-500">
          Back
        </button>
      </div>
      <div className="flex gap-2 mb-6">
        {(['daily', 'monthly', 'alltime'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === t ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {t === 'daily' ? 'Daily' : t === 'monthly' ? 'Monthly' : 'Career'}
          </button>
        ))}
      </div>
      {loading && <p className="text-slate-400">Loading...</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="py-2 pr-4 text-slate-400 font-medium">#</th>
                <th className="py-2 pr-4 text-slate-400 font-medium">Username</th>
                <th className="py-2 pr-4 text-slate-400 font-medium">{scoreLabel}</th>
                <th className="py-2 text-slate-400 font-medium">% correct</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-slate-500 text-center">
                    No scores yet for {label.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={`${r.rank}-${r.username}`} className="border-b border-slate-700">
                    <td className="py-3 pr-4 font-medium text-amber-400">{r.rank}</td>
                    <td className="py-3 pr-4 text-white">{r.username}</td>
                    <td className="py-3 pr-4 text-slate-300">{r.score}</td>
                    <td className="py-3 text-slate-300">{r.pctCorrect}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
