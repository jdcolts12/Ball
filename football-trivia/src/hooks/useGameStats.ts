import { useState, useCallback } from 'react';
import { recordCompletedGame, getCurrentStats } from '../services/games';
import type { Stats } from '../types/database';

export function useGameStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { stats: data, error: err } = await getCurrentStats();
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setStats(data);
  }, []);

  /**
   * Call after a game ends. Inserts the game (trigger updates stats) then refetches stats.
   */
  const completeGame = useCallback(
    async (payload: { score: number; questionsAnswered: number; correctAnswers: number }) => {
      setLoading(true);
      setError(null);
      const { gameId, error: recordErr } = await recordCompletedGame(payload);
      if (recordErr) {
        setLoading(false);
        setError(recordErr);
        return { gameId: null, success: false };
      }
      const { stats: updated, error: fetchErr } = await getCurrentStats();
      setLoading(false);
      if (fetchErr) {
        setError(fetchErr);
        return { gameId, success: true };
      }
      setStats(updated);
      return { gameId, success: true };
    },
    []
  );

  return { stats, loading, error, fetchStats, completeGame };
}
