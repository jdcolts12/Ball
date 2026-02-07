/**
 * Super Bowl facts for weekend-themed questions.
 * Source: Pro Football Reference (Super Bowl History). Verified for accuracy.
 * Team names: short display form (e.g. "Chiefs", "49ers", "Rams", "Raiders").
 * City: host city as commonly cited.
 * winnerDefeated / loserDefeated: team they beat in conference championship to reach Super Bowl.
 */

export interface SuperBowlFact {
  roman: string;
  year: number;
  winner: string;
  loser: string;
  mvp: string;
  city: string;
  /** Team the winner beat in conference championship to reach Super Bowl. */
  winnerDefeated: string;
  /** Team the loser beat in conference championship to reach Super Bowl. */
  loserDefeated: string;
}

export const superBowlFacts: SuperBowlFact[] = [
  { roman: 'LIX', year: 2025, winner: 'Eagles', loser: 'Chiefs', mvp: 'Jalen Hurts', city: 'New Orleans', winnerDefeated: 'Lions', loserDefeated: 'Ravens' },
  { roman: 'LVIII', year: 2024, winner: 'Chiefs', loser: '49ers', mvp: 'Patrick Mahomes', city: 'Las Vegas', winnerDefeated: 'Ravens', loserDefeated: 'Lions' },
  { roman: 'LVII', year: 2023, winner: 'Chiefs', loser: 'Eagles', mvp: 'Patrick Mahomes', city: 'Glendale', winnerDefeated: 'Bengals', loserDefeated: '49ers' },
  { roman: 'LVI', year: 2022, winner: 'Rams', loser: 'Bengals', mvp: 'Cooper Kupp', city: 'Inglewood', winnerDefeated: '49ers', loserDefeated: 'Chiefs' },
  { roman: 'LV', year: 2021, winner: 'Buccaneers', loser: 'Chiefs', mvp: 'Tom Brady', city: 'Tampa', winnerDefeated: 'Packers', loserDefeated: 'Bills' },
  { roman: 'LIV', year: 2020, winner: 'Chiefs', loser: '49ers', mvp: 'Patrick Mahomes', city: 'Miami Gardens', winnerDefeated: 'Titans', loserDefeated: 'Packers' },
  { roman: 'LIII', year: 2019, winner: 'Patriots', loser: 'Rams', mvp: 'Julian Edelman', city: 'Atlanta', winnerDefeated: 'Chiefs', loserDefeated: 'Saints' },
  { roman: 'LII', year: 2018, winner: 'Eagles', loser: 'Patriots', mvp: 'Nick Foles', city: 'Minneapolis', winnerDefeated: 'Vikings', loserDefeated: 'Jaguars' },
  { roman: 'LI', year: 2017, winner: 'Patriots', loser: 'Falcons', mvp: 'Tom Brady', city: 'Houston', winnerDefeated: 'Steelers', loserDefeated: 'Packers' },
  { roman: '50', year: 2016, winner: 'Broncos', loser: 'Panthers', mvp: 'Von Miller', city: 'Santa Clara', winnerDefeated: 'Patriots', loserDefeated: 'Cardinals' },
  { roman: 'XLIX', year: 2015, winner: 'Patriots', loser: 'Seahawks', mvp: 'Tom Brady', city: 'Glendale', winnerDefeated: 'Colts', loserDefeated: 'Packers' },
  { roman: 'XLVIII', year: 2014, winner: 'Seahawks', loser: 'Broncos', mvp: 'Malcolm Smith', city: 'East Rutherford', winnerDefeated: '49ers', loserDefeated: 'Patriots' },
  { roman: 'XLVII', year: 2013, winner: 'Ravens', loser: '49ers', mvp: 'Joe Flacco', city: 'New Orleans', winnerDefeated: 'Patriots', loserDefeated: 'Falcons' },
  { roman: 'XLVI', year: 2012, winner: 'Giants', loser: 'Patriots', mvp: 'Eli Manning', city: 'Indianapolis', winnerDefeated: '49ers', loserDefeated: 'Ravens' },
  { roman: 'XLV', year: 2011, winner: 'Packers', loser: 'Steelers', mvp: 'Aaron Rodgers', city: 'Arlington', winnerDefeated: 'Bears', loserDefeated: 'Jets' },
  { roman: 'XLIV', year: 2010, winner: 'Saints', loser: 'Colts', mvp: 'Drew Brees', city: 'Miami Gardens', winnerDefeated: 'Vikings', loserDefeated: 'Jets' },
  { roman: 'XLIII', year: 2009, winner: 'Steelers', loser: 'Cardinals', mvp: 'Santonio Holmes', city: 'Tampa', winnerDefeated: 'Ravens', loserDefeated: 'Eagles' },
  { roman: 'XLII', year: 2008, winner: 'Giants', loser: 'Patriots', mvp: 'Eli Manning', city: 'Glendale', winnerDefeated: 'Packers', loserDefeated: 'Chargers' },
  { roman: 'XLI', year: 2007, winner: 'Colts', loser: 'Bears', mvp: 'Peyton Manning', city: 'Miami Gardens', winnerDefeated: 'Patriots', loserDefeated: 'Saints' },
  { roman: 'XL', year: 2006, winner: 'Steelers', loser: 'Seahawks', mvp: 'Hines Ward', city: 'Detroit', winnerDefeated: 'Broncos', loserDefeated: 'Panthers' },
  { roman: 'XXXIX', year: 2005, winner: 'Patriots', loser: 'Eagles', mvp: 'Deion Branch', city: 'Jacksonville', winnerDefeated: 'Steelers', loserDefeated: 'Falcons' },
  { roman: 'XXXVIII', year: 2004, winner: 'Patriots', loser: 'Panthers', mvp: 'Tom Brady', city: 'Houston', winnerDefeated: 'Colts', loserDefeated: 'Eagles' },
  { roman: 'XXXVII', year: 2003, winner: 'Buccaneers', loser: 'Raiders', mvp: 'Dexter Jackson', city: 'San Diego', winnerDefeated: 'Eagles', loserDefeated: 'Titans' },
  { roman: 'XXXVI', year: 2002, winner: 'Patriots', loser: 'Rams', mvp: 'Tom Brady', city: 'New Orleans', winnerDefeated: 'Steelers', loserDefeated: 'Eagles' },
  { roman: 'XXXV', year: 2001, winner: 'Ravens', loser: 'Giants', mvp: 'Ray Lewis', city: 'Tampa', winnerDefeated: 'Raiders', loserDefeated: 'Vikings' },
  { roman: 'XXXIV', year: 2000, winner: 'Rams', loser: 'Titans', mvp: 'Kurt Warner', city: 'Atlanta', winnerDefeated: 'Buccaneers', loserDefeated: 'Jaguars' },
  { roman: 'XXXIII', year: 1999, winner: 'Broncos', loser: 'Falcons', mvp: 'John Elway', city: 'Miami Gardens', winnerDefeated: 'Jets', loserDefeated: 'Vikings' },
];

/** All team names that appear as winner/loser in the facts (for wrong-option pool). */
const allTeams = new Set<string>();
superBowlFacts.forEach((f) => {
  allTeams.add(f.winner);
  allTeams.add(f.loser);
  allTeams.add(f.winnerDefeated);
  allTeams.add(f.loserDefeated);
});
export const superBowlTeamPool: string[] = [...allTeams];

/** Conference for each team (for "same conference" wrong options on defeated question). AFC / NFC. */
export const TEAM_CONFERENCE: Record<string, 'AFC' | 'NFC'> = {
  Chiefs: 'AFC', Ravens: 'AFC', Bills: 'AFC', Bengals: 'AFC', Titans: 'AFC', Patriots: 'AFC', Steelers: 'AFC',
  Colts: 'AFC', Jaguars: 'AFC', Broncos: 'AFC', Raiders: 'AFC', Chargers: 'AFC', Jets: 'AFC', Browns: 'AFC',
  Texans: 'AFC', Dolphins: 'AFC',
  '49ers': 'NFC', Eagles: 'NFC', Lions: 'NFC', Rams: 'NFC', Packers: 'NFC', Buccaneers: 'NFC', Saints: 'NFC',
  Seahawks: 'NFC', Vikings: 'NFC', Bears: 'NFC', Giants: 'NFC', Cowboys: 'NFC', Falcons: 'NFC', Panthers: 'NFC',
  Cardinals: 'NFC', Commanders: 'NFC', Washington: 'NFC',
};

/** Teams by conference for "same conference" wrong options on defeated question. */
export const AFC_TEAMS: string[] = ['Chiefs', 'Ravens', 'Bills', 'Bengals', 'Titans', 'Patriots', 'Steelers', 'Colts', 'Jaguars', 'Broncos', 'Raiders', 'Chargers', 'Jets', 'Browns', 'Texans', 'Dolphins'];
export const NFC_TEAMS: string[] = ['49ers', 'Eagles', 'Lions', 'Rams', 'Packers', 'Buccaneers', 'Saints', 'Seahawks', 'Vikings', 'Bears', 'Giants', 'Cowboys', 'Falcons', 'Panthers', 'Cardinals', 'Commanders'];

/** All cities (for wrong-option pool). */
const allCities = new Set(superBowlFacts.map((f) => f.city));
export const superBowlCityPool: string[] = [...allCities];
