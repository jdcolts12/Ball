import type { PlayerQuestion } from '../data/players';
import { players } from '../data/players';
import { careerPathPlayers } from '../data/careerPathPlayers';
import { seasonLeaders, type SeasonLeader } from '../data/seasonLeaders';
import { NFC_TEAMS } from '../data/superBowlFacts';
import { getPstDateString } from './dailyPlayLimit';
import { getDailyDraftQuestion } from './dailyDraftQuestion';

/** Super Bowl Saturday 2/7/26 only. Sunday 2/8 will have separate questions (TBD). */
const SUPER_BOWL_WEEKEND_DATES = ['2026-02-07'];

/** Normalize to YYYY-MM-DD so we match even if getPstDateString returns single-digit month/day. */
function normalizePstDate(s: string): string {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return s;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

export function isSuperBowlWeekendDate(dateString: string): boolean {
  return SUPER_BOWL_WEEKEND_DATES.includes(normalizePstDate(dateString));
}

export type CollegeQuestion = {
  type: 'college';
  name: string;
  college: string;
  wrongOptions: [string, string, string];
  options: [string, string, string, string];
};

export type DraftQuestion = {
  type: 'draft';
  year: number;
  missingSlotIndex: number;
  correctAnswer: string;
  shownPicks: (string | null)[];
  options: [string, string, string, string];
};

export type CareerPathStint = { team: string; years: string };

export type CareerPathQuestion = {
  type: 'careerPath';
  position: string;
  college: string;
  collegeYears: string;
  nflStints: CareerPathStint[];
  correctAnswer: string; // player name
  options: [string, string, string, string];
};

export type SeasonLeaderQuestion = {
  type: 'seasonLeader';
  year: number;
  category: 'passing' | 'rushing' | 'receiving' | 'passingTDs' | 'rushingTDs' | 'receivingTDs' | 'sacks' | 'interceptions';
  correctAnswer: string; // player name (or "Player Name (X TDs/sacks/INTs)" format if statValue present)
  statValue?: number; // Optional stat value for the correct answer
  options: [string, string, string, string]; // Formatted options (may include stat values)
};

export type SuperBowlQuestionKind =
  | 'superBowlBearsNFC'
  | 'superBowlWRMVPCount'
  | 'superBowlRushingRecord'
  | 'superBowlPatriotsMVPCount';

export type SuperBowlQuestion = {
  type: SuperBowlQuestionKind;
  correctAnswer: string;
  options: [string, string, string, string];
};

export type GameQuestion = CollegeQuestion | DraftQuestion | CareerPathQuestion | SeasonLeaderQuestion | SuperBowlQuestion;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededIndex(seed: number, max: number): number {
  return ((seed % max) + max) % max;
}

const shuffle = (date: string) => <T>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = seededIndex(hashString(date + String(i)), i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

function getSuperBowlQuestions(date: string): GameQuestion[] {
  const doShuffle = shuffle(date);

  const pickWrong = <T>(pool: T[], correct: T, n: number): T[] => {
    const rest = [...new Set(pool.filter((x) => x !== correct))];
    return doShuffle(rest).slice(0, n) as T[];
  };

  // Q1: Who did the Bears beat in the NFC Championship to get to Super Bowl XLI? Answer: Saints. Wrong: other NFC teams.
  const bearsCorrect = 'Saints';
  const bearsWrongPool = NFC_TEAMS.filter((t) => t !== bearsCorrect);
  const bearsOptions = doShuffle([bearsCorrect, ...pickWrong(bearsWrongPool, bearsCorrect, 3)]) as [string, string, string, string];

  // Q2: How many WRs have won Super Bowl MVP? Answer: 8.
  const wrMvpCorrect = '8';
  const wrMvpOptions = doShuffle([wrMvpCorrect, ...pickWrong(['5', '6', '7', '9'], wrMvpCorrect, 3)]) as [string, string, string, string];

  // Q3: All-time leading rusher in a single Super Bowl. Answer: Tim Smith (204 yards, SB XXII). Options: names only, no yardage.
  const rushingCorrect = 'Tim Smith';
  const rushingWrongPool = ['Marcus Allen', 'Larry Csonka', 'John Riggins', 'Terrell Davis', 'Emmitt Smith'].filter((x) => x !== rushingCorrect);
  const rushingOptions = doShuffle([rushingCorrect, ...pickWrong(rushingWrongPool, rushingCorrect, 3)]) as [string, string, string, string];

  // Q4: How many Patriots not named Tom Brady have won Super Bowl MVP? Answer: 2 (Deion Branch XXXIX, Julian Edelman LIII). Fill-in-the-blank.
  const patsCorrect = '2';
  const patsOptions = [patsCorrect, '', '', ''] as [string, string, string, string]; // unused; Q4 is fill-in

  return [
    { type: 'superBowlBearsNFC', correctAnswer: bearsCorrect, options: bearsOptions },
    { type: 'superBowlWRMVPCount', correctAnswer: wrMvpCorrect, options: wrMvpOptions },
    { type: 'superBowlRushingRecord', correctAnswer: rushingCorrect, options: rushingOptions },
    { type: 'superBowlPatriotsMVPCount', correctAnswer: patsCorrect, options: patsOptions },
  ];
}

/**
 * Returns the same 4 questions for everyone on the same calendar day:
 * On Super Bowl weekend: 4 fixed Super Bowl questions (Bears XLI NFC, WR MVP count, rushing record, Patriots non-Brady MVP count).
 * Otherwise: 1 draft + 1 college + 1 career path + 1 season leader.
 */
export function getDailyGameQuestions(dateString?: string): GameQuestion[] {
  const date = dateString ?? getPstDateString();
  if (isSuperBowlWeekendDate(date)) return getSuperBowlQuestions(date);

  const draftQ = getDailyDraftQuestion(date);
  const doShuffle = shuffle(date);

  const draftQuestion: DraftQuestion = {
    type: 'draft',
    year: draftQ.year,
    missingSlotIndex: draftQ.missingSlotIndex,
    correctAnswer: draftQ.correctAnswer,
    shownPicks: draftQ.shownPicks,
    options: draftQ.options,
  };

  const nPlayers = players.length;
  const iCollege = seededIndex(hashString(date + 'college'), nPlayers);
  const pCollege = players[iCollege] as PlayerQuestion;

  const nCareer = careerPathPlayers.length;
  const iCareer = seededIndex(hashString(date + 'career'), nCareer);
  const pCareer = careerPathPlayers[iCareer];
  const nflStints: { team: string; years: string }[] = pCareer.nflTeams.map((team, i) => ({
    team,
    years: pCareer.nflTeamYears[i] ?? '',
  }));
  const careerPathQuestion: CareerPathQuestion = {
    type: 'careerPath',
    position: pCareer.position,
    college: pCareer.college,
    collegeYears: pCareer.collegeYears,
    nflStints,
    correctAnswer: pCareer.name,
    options: doShuffle([pCareer.name, ...pCareer.wrongOptions]) as [string, string, string, string],
  };

  const collegeQuestion: CollegeQuestion = {
    type: 'college',
    name: pCollege.name,
    college: pCollege.college,
    wrongOptions: pCollege.wrongOptions,
    options: doShuffle([pCollege.college, ...pCollege.wrongOptions]) as [string, string, string, string],
  };

  // Season leader question
  const nSeasonLeaders = seasonLeaders.length;
  const iSeasonLeader = seededIndex(hashString(date + 'season'), nSeasonLeaders);
  const seasonLeader = seasonLeaders[iSeasonLeader];
  
  // Format options with stat values if present (for TDs, sacks, interceptions)
  const formatOption = (name: string, statValue?: number, category?: string): string => {
    if (statValue !== undefined) {
      if (category === 'sacks') {
        // Format sacks with decimals (e.g., 17.5)
        return `${name} (${statValue} sacks)`;
      } else if (category === 'interceptions') {
        return `${name} (${statValue} INTs)`;
      } else {
        // For TDs (passingTDs, rushingTDs, receivingTDs)
        return `${name} (${statValue} TDs)`;
      }
    }
    return name;
  };
  
  const correctOption = formatOption(seasonLeader.leader, seasonLeader.statValue, seasonLeader.category);
  const wrongOptionsFormatted = seasonLeader.wrongOptions.map(opt => formatOption(opt.name, opt.statValue, seasonLeader.category));
  
  const allOptions = doShuffle([correctOption, ...wrongOptionsFormatted]) as [string, string, string, string];
  
  const seasonLeaderQuestion: SeasonLeaderQuestion = {
    type: 'seasonLeader',
    year: seasonLeader.year,
    category: seasonLeader.category,
    correctAnswer: correctOption, // Full formatted string for comparison
    statValue: seasonLeader.statValue,
    options: allOptions,
  };

  return [draftQuestion, collegeQuestion, careerPathQuestion, seasonLeaderQuestion];
}
