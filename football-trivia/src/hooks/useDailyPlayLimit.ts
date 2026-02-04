import { useState, useCallback, useEffect } from 'react';
import {
  getLastPlayed,
  recordPlay as recordPlayStorage,
  getLocalDateString,
} from '../lib/dailyPlayLimit';

/** Set to true to bypass daily limit (for testing). */
const DAILY_LIMIT_DISABLED = true;

/**
 * Block play if lastPlayed === today (local date). Else allow.
 * Uses localStorage.
 */
export function useDailyPlayLimit() {
  const [lastPlayed, setLastPlayed] = useState<string | null>(getLastPlayed);

  useEffect(() => {
    setLastPlayed(getLastPlayed());
  }, []);

  const today = getLocalDateString();
  const playedToday = lastPlayed === today;

  /** Block if already played today; else allow. (Bypassed when DAILY_LIMIT_DISABLED.) */
  const canPlay = DAILY_LIMIT_DISABLED || !playedToday;

  const recordPlay = useCallback(() => {
    recordPlayStorage();
    setLastPlayed(getLocalDateString());
  }, []);

  return {
    /** Last played date (YYYY-MM-DD) or null. */
    lastPlayed,
    /** Today's date (YYYY-MM-DD). */
    today,
    /** True if user already played today → block. */
    playedToday,
    /** True if user can play (have not played today). */
    canPlay,
    /** Call when a game is completed. */
    recordPlay,
  };
}
