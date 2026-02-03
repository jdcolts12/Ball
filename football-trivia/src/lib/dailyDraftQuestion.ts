import { draftClasses } from '../data/drafts';
import { getLocalDateString } from './dailyPlayLimit';
import { shuffle } from '../utils/shuffle';

export interface DailyDraftQuestion {
  year: number;
  /** 0-based slot (0 = pick #1, 9 = pick #10). */
  missingSlotIndex: number;
  /** The missing player (correct answer). */
  correctAnswer: string;
  /** The 9 shown picks in order, with null at the missing slot. */
  shownPicks: (string | null)[];
  /** Four options: correct + 3 wrong (shuffled by caller). */
  options: [string, string, string, string];
}

/** Simple numeric hash from a string (for deterministic daily seed). */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Returns the same draft question for everyone on the same calendar day (local date).
 * One draft class, one missing slot. Wrong options come only from similar draft classes
 * (±3 years) and prefer the same pick slot (e.g. all "Pick #5" from nearby years) so
 * all choices are from the same era and equally plausible.
 */
export function getDailyDraftQuestion(dateString?: string): DailyDraftQuestion {
  const date = dateString ?? getLocalDateString();
  const seed = hashString(date);
  const classIndex = seed % draftClasses.length;
  const draft = draftClasses[classIndex];
  const missingSlotIndex = (seed >> 8) % 10;
  const correctAnswer = draft.picks[missingSlotIndex];

  const shownPicks: (string | null)[] = draft.picks.map((p, i) =>
    i === missingSlotIndex ? null : p,
  );

  const currentYear = draft.year;

  // Wrong options only from similar draft classes (±3 years) so all choices feel from the same era.
  const yearWindow = 3;
  const sameSlotCandidates: string[] = [];
  const otherSlotCandidates: string[] = [];
  for (let c = 0; c < draftClasses.length; c++) {
    if (c === classIndex) continue;
    const other = draftClasses[c];
    const yearDiff = Math.abs(other.year - currentYear);
    if (yearDiff > yearWindow) continue;
    const nameSameSlot = other.picks[missingSlotIndex];
    if (nameSameSlot && nameSameSlot !== correctAnswer) sameSlotCandidates.push(nameSameSlot);
    for (let s = 0; s < 10; s++) {
      const n = other.picks[s];
      if (n && n !== correctAnswer) otherSlotCandidates.push(n);
    }
  }

  const used = new Set<string>([correctAnswer]);
  const wrongPool: string[] = [];
  // Prefer same pick slot (e.g. all "Pick #5" from nearby years) so all options feel equally plausible.
  for (const w of sameSlotCandidates) {
    if (!used.has(w)) {
      wrongPool.push(w);
      used.add(w);
    }
  }
  for (const w of otherSlotCandidates) {
    if (!used.has(w)) {
      wrongPool.push(w);
      used.add(w);
    }
  }

  // Prefer same pick slot (e.g. all "Pick #5" from nearby years); fill with other slots if needed.
  const sameSlotOnly = wrongPool.filter((w) => sameSlotCandidates.includes(w));
  const rest = wrongPool.filter((w) => !sameSlotCandidates.includes(w));
  const fromSameSlot = shuffle([...sameSlotOnly]).slice(0, 3);
  const need = 3 - fromSameSlot.length;
  const fromRest = need > 0 ? shuffle([...rest]).slice(0, need) : [];
  let shuffledWrong = [...fromSameSlot, ...fromRest];
  if (shuffledWrong.length < 3) {
    // Edge case: not enough similar-year options (e.g. very few classes in window); use any other draft.
    const anyOther: string[] = [];
    for (let c = 0; c < draftClasses.length; c++) {
      if (c === classIndex) continue;
      const other = draftClasses[c];
      const name = other.picks[missingSlotIndex];
      if (name && name !== correctAnswer && !used.has(name)) anyOther.push(name);
      for (let s = 0; s < 10; s++) {
        const n = other.picks[s];
        if (n && n !== correctAnswer && !used.has(n)) anyOther.push(n);
      }
    }
    const extra = shuffle(anyOther).slice(0, 3 - shuffledWrong.length);
    shuffledWrong = [...shuffledWrong, ...extra];
  }
  const options = shuffle([correctAnswer, ...shuffledWrong.slice(0, 3)]) as [string, string, string, string];

  return {
    year: draft.year,
    missingSlotIndex,
    correctAnswer,
    shownPicks,
    options,
  };
}

/** Human-readable pick number (e.g. "Pick #3") for the missing slot. */
export function getPickLabel(missingSlotIndex: number): string {
  return `Pick #${missingSlotIndex + 1}`;
}
