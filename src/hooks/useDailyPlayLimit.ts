import { useState, useCallback, useEffect } from 'react';
import { getLocalDateString } from '../lib/dailyPlayLimit';
import { recordPlay as recordPlayStorage } from '../lib/dailyPlayLimit';
import { hasPlayedTodayFromServer } from '../services/games';

/** Set to true to bypass daily limit (for testing). */
const DAILY_LIMIT_DISABLED = false;

/**
 * Block play if user already played today. Uses server (Supabase games table) as source of truth;
 * also updates localStorage so UI stays in sync after completing a game.
 */
export function useDailyPlayLimit() {
  const [playedToday, setPlayedToday] = useState<boolean | null>(null);

  const refreshCanPlay = useCallback(() => {
    hasPlayedTodayFromServer().then(({ played, error }) => {
      if (!error) setPlayedToday(played);
    });
  }, []);

  useEffect(() => {
    refreshCanPlay();
  }, [refreshCanPlay]);

  const today = getLocalDateString();

  /** Block when already played today; block when still loading (null) so we don't allow play before server check. */
  const canPlay = DAILY_LIMIT_DISABLED || playedToday === false;

  const recordPlay = useCallback(() => {
    recordPlayStorage();
    setPlayedToday(true);
  }, []);

  return {
    lastPlayed: playedToday ? today : null,
    today,
    playedToday: playedToday === true,
    /** True if we're still fetching from server (don't allow play until we know). */
    checking: playedToday === null,
    canPlay,
    recordPlay,
    refreshCanPlay,
  };
}
