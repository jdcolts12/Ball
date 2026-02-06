import { useState, useCallback, useEffect } from 'react';
import { getLocalDateString } from '../lib/dailyPlayLimit';
import { recordPlay as recordPlayStorage } from '../lib/dailyPlayLimit';
import { hasPlayedTodayFromServer } from '../services/games';
import { useAuth } from '../contexts/AuthContext';

/** Set to true to bypass daily limit (for testing). */
const DAILY_LIMIT_DISABLED = false;

/**
 * Block play if user already played today. Uses server (Supabase games table) as source of truth;
 * also updates localStorage so UI stays in sync after completing a game.
 */
export function useDailyPlayLimit() {
  const { user, initializing } = useAuth();
  const [playedToday, setPlayedToday] = useState<boolean | null>(null);

  const refreshCanPlay = useCallback(() => {
    // Don't check if auth is still initializing or user not logged in
    if (initializing || !user) {
      return Promise.resolve();
    }
    return hasPlayedTodayFromServer().then(({ played, error }) => {
      if (error) {
        // On error, default to allowing play (don't block user)
        console.warn('Failed to check if played today:', error);
        setPlayedToday(false);
      } else {
        setPlayedToday(played);
      }
    });
  }, [user, initializing]);

  useEffect(() => {
    // Only check after auth is ready and user is logged in
    if (!initializing && user) {
      let cancelled = false;
      // Set a timeout fallback: if check takes > 5 seconds, allow play
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn('Daily play check timed out, allowing play');
          setPlayedToday(false);
        }
      }, 5000);
      
      refreshCanPlay().finally(() => {
        cancelled = true;
        clearTimeout(timeoutId);
      });
      
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
    } else if (!initializing && !user) {
      // User logged out, reset state
      setPlayedToday(null);
    }
  }, [refreshCanPlay, user, initializing]);

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
