/**
 * Block play if user already played today. Uses PST so the day doesn't change until midnight Pacific.
 * lastPlayed === today → block. Else → allow.
 * Uses localStorage keyed by PST date (YYYY-MM-DD).
 */

const STORAGE_KEY = 'football-trivia-last-played';

/** Get today's date in PST (America/Los_Angeles) as YYYY-MM-DD. Day doesn't change until midnight Pacific. */
export function getPstDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

/** @deprecated Use getPstDateString for game date and play limit. Kept for backwards compatibility. */
export function getLocalDateString(): string {
  return getPstDateString();
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
 * True if the user has already played today (PST date) → block play.
 */
export function hasPlayedToday(): boolean {
  const today = getPstDateString();
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
 * Call when a game is completed. Sets lastPlayed to today (PST date).
 */
export function recordPlay(): void {
  try {
    localStorage.setItem(STORAGE_KEY, getPstDateString());
  } catch {
    // ignore (e.g. private mode)
  }
}
