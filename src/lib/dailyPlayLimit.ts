/**
 * Block play if user already played today (local date).
 * lastPlayed === today → block. Else → allow.
 * Uses localStorage keyed by the user's local date (YYYY-MM-DD).
 */

const STORAGE_KEY = 'football-trivia-last-played';

/** Get today's date in the user's local timezone as YYYY-MM-DD. */
export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the last played date from localStorage (YYYY-MM-DD or null).
 */
export function getLastPlayed(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  } catch {
    // ignore
  }
  return null;
}

/**
 * True if the user has already played today (local date) → block play.
 */
export function hasPlayedToday(): boolean {
  const today = getLocalDateString();
  const last = getLastPlayed();
  return last === today;
}

/**
 * True if the user can play (have not played today).
 */
export function canPlayToday(): boolean {
  return !hasPlayedToday();
}

/**
 * Call when a game is completed. Sets lastPlayed to today (local date).
 */
export function recordPlay(): void {
  try {
    localStorage.setItem(STORAGE_KEY, getLocalDateString());
  } catch {
    // ignore (e.g. private mode)
  }
}
