import type { PlayerQuestion } from '../data/players';
import { players } from '../data/players';
import { careerPathPlayers } from '../data/careerPathPlayers';
import { getLocalDateString } from './dailyPlayLimit';
import { getDailyDraftQuestion } from './dailyDraftQuestion';

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
  college: string;
  collegeYears: string;
  nflStints: CareerPathStint[];
  correctAnswer: string; // player name
  options: [string, string, string, string];
};

export type GameQuestion = CollegeQuestion | DraftQuestion | CareerPathQuestion;

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

/**
 * Returns the same 3 questions for everyone on the same calendar day:
 * 1 draft (missing player in top 10) + 1 college (which college) + 1 career path (guess player by college + NFL teams).
 */
export function getDailyGameQuestions(dateString?: string): GameQuestion[] {
  const date = dateString ?? getLocalDateString();
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

  return [draftQuestion, collegeQuestion, careerPathQuestion];
}
