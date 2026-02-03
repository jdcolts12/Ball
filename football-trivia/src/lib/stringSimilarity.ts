/**
 * Normalize for comparison: lowercase, trim, collapse spaces and common punctuation.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-');
}

/**
 * Levenshtein (edit) distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

/**
 * Similarity between two strings: 0 = no match, 1 = exact match.
 * Uses normalized strings and 1 - (editDistance / maxLength).
 */
export function getSimilarity(guess: string, answer: string): number {
  const g = normalize(guess);
  const a = normalize(answer);
  if (a.length === 0) return g.length === 0 ? 1 : 0;
  const dist = levenshtein(g, a);
  const maxLen = Math.max(g.length, a.length);
  return 1 - dist / maxLen;
}

/** Default threshold: 75% similarity counts as correct. */
export const CAREER_PATH_MATCH_THRESHOLD = 0.75;

/**
 * True if guess is close enough to answer (>= threshold).
 */
export function isCloseEnough(
  guess: string,
  answer: string,
  threshold: number = CAREER_PATH_MATCH_THRESHOLD,
): boolean {
  if (!guess.trim()) return false;
  return getSimilarity(guess, answer) >= threshold;
}
