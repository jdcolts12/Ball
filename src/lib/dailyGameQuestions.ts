import type { PlayerQuestion } from '../data/players';
import { players } from '../data/players';
import { careerPathPlayers } from '../data/careerPathPlayers';
import { seasonLeaders, type SeasonLeader } from '../data/seasonLeaders';
import { superBowlFacts, superBowlTeamPool, superBowlCityPool } from '../data/superBowlFacts';
import { getPstDateString } from './dailyPlayLimit';
import { getDailyDraftQuestion } from './dailyDraftQuestion';

/** Super Bowl weekend 2026: themed questions on Saturday & Sunday of SB LX. Update each year if needed. */
const SUPER_BOWL_WEEKEND_DATES = ['2026-02-07', '2026-02-08'];

/** Super Bowl years to use for weekend questions (inclusive). */
const SUPER_BOWL_WEEKEND_YEAR_MIN = 1999;
const SUPER_BOWL_WEEKEND_YEAR_MAX = 2015;

export function isSuperBowlWeekendDate(dateString: string): boolean {
  return SUPER_BOWL_WEEKEND_DATES.includes(dateString);
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

export type SuperBowlQuestionKind = 'superBowlWinner' | 'superBowlMVP' | 'superBowlLoser' | 'superBowlCity';

export type SuperBowlQuestion = {
  type: SuperBowlQuestionKind;
  roman: string; // e.g. "LVIII"
  year: number;
  winner: string;
  loser: string;
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
  const weekendFacts = superBowlFacts.filter(
    (f) => f.year >= SUPER_BOWL_WEEKEND_YEAR_MIN && f.year <= SUPER_BOWL_WEEKEND_YEAR_MAX
  );
  const idx = seededIndex(hashString(date + 'sb'), weekendFacts.length);
  const sb = weekendFacts[idx];

  // Tough wrong answers: use only era-appropriate, plausible choices from the same Super Bowl set
  const otherWinners = [...new Set(weekendFacts.map((f) => f.winner).filter((w) => w !== sb.winner))];
  const otherLosers = [...new Set(weekendFacts.map((f) => f.loser).filter((l) => l !== sb.loser))];
  const otherCitiesFromEra = [...new Set(weekendFacts.map((f) => f.city).filter((c) => c !== sb.city))];
  const otherMvps = weekendFacts.filter((f) => f.mvp !== sb.mvp).map((f) => f.mvp);

  const pickWrong = <T>(pool: T[], correct: T, n: number): T[] => {
    const rest = [...new Set(pool.filter((x) => x !== correct))];
    return doShuffle(rest).slice(0, n) as T[];
  };

  // Winner Q: wrong options = other SB winners from era (all plausible champs); if needed, add losers from era
  const winnerWrongPool = otherWinners.length >= 3 ? otherWinners : [...otherWinners, ...otherLosers.filter((l) => !otherWinners.includes(l))];
  const winnerOptions = doShuffle([sb.winner, ...pickWrong(winnerWrongPool, sb.winner, 3)]) as [string, string, string, string];

  // MVP Q: wrong options = other MVPs from same era (all plausible MVPs)
  const mvpOptions = doShuffle([sb.mvp, ...pickWrong(otherMvps, sb.mvp, 3)]) as [string, string, string, string];

  // Loser Q: wrong options = other SB losers from era (all plausible runners-up); if needed, add winners
  const loserWrongPool = otherLosers.length >= 3 ? otherLosers : [...otherLosers, ...otherWinners.filter((w) => !otherLosers.includes(w))];
  const loserOptions = doShuffle([sb.loser, ...pickWrong(loserWrongPool, sb.loser, 3)]) as [string, string, string, string];

  // City Q: wrong options = other SB host cities from era (all real SB sites)
  const cityWrongPool = otherCitiesFromEra.length >= 3 ? otherCitiesFromEra : superBowlCityPool.filter((c) => c !== sb.city);
  const cityOptions = doShuffle([sb.city, ...pickWrong(cityWrongPool, sb.city, 3)]) as [string, string, string, string];

  return [
    { type: 'superBowlWinner', roman: sb.roman, year: sb.year, winner: sb.winner, loser: sb.loser, correctAnswer: sb.winner, options: winnerOptions },
    { type: 'superBowlMVP', roman: sb.roman, year: sb.year, winner: sb.winner, loser: sb.loser, correctAnswer: sb.mvp, options: mvpOptions },
    { type: 'superBowlLoser', roman: sb.roman, year: sb.year, winner: sb.winner, loser: sb.loser, correctAnswer: sb.loser, options: loserOptions },
    { type: 'superBowlCity', roman: sb.roman, year: sb.year, winner: sb.winner, loser: sb.loser, correctAnswer: sb.city, options: cityOptions },
  ];
}

/**
 * Returns the same 4 questions for everyone on the same calendar day:
 * On Super Bowl weekend: 4 Super Bowl questions (winner, MVP, loser, city).
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
