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

/**
 * Time until next midnight in America/Los_Angeles (PST/PDT), formatted as HH:MM:SS.
 * Used for "next game" countdown so it matches when the daily game resets.
 */
export function getTimeUntilMidnightPST(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const second = parseInt(parts.find((p) => p.type === 'second')?.value ?? '0', 10);
  const secondsUntilMidnight = 24 * 3600 - (hour * 3600 + minute * 60 + second);
  const total = Math.max(0, secondsUntilMidnight);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
