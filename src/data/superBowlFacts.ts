/**
 * Super Bowl facts for weekend-themed questions.
 * Source: Pro Football Reference (Super Bowl History). Verified for accuracy.
 * Team names: short display form (e.g. "Chiefs", "49ers", "Rams", "Raiders").
 * City: host city as commonly cited (e.g. "Miami Gardens", "East Rutherford", "Glendale").
 */

export interface SuperBowlFact {
  roman: string; // e.g. "LVIII", "50"
  year: number; // calendar year (e.g. 2024 for SB LVIII)
  winner: string;
  loser: string;
  mvp: string;
  city: string;
}

export const superBowlFacts: SuperBowlFact[] = [
  { roman: 'LIX', year: 2025, winner: 'Eagles', loser: 'Chiefs', mvp: 'Jalen Hurts', city: 'New Orleans' },
  { roman: 'LVIII', year: 2024, winner: 'Chiefs', loser: '49ers', mvp: 'Patrick Mahomes', city: 'Las Vegas' },
  { roman: 'LVII', year: 2023, winner: 'Chiefs', loser: 'Eagles', mvp: 'Patrick Mahomes', city: 'Glendale' },
  { roman: 'LVI', year: 2022, winner: 'Rams', loser: 'Bengals', mvp: 'Cooper Kupp', city: 'Inglewood' },
  { roman: 'LV', year: 2021, winner: 'Buccaneers', loser: 'Chiefs', mvp: 'Tom Brady', city: 'Tampa' },
  { roman: 'LIV', year: 2020, winner: 'Chiefs', loser: '49ers', mvp: 'Patrick Mahomes', city: 'Miami Gardens' },
  { roman: 'LIII', year: 2019, winner: 'Patriots', loser: 'Rams', mvp: 'Julian Edelman', city: 'Atlanta' },
  { roman: 'LII', year: 2018, winner: 'Eagles', loser: 'Patriots', mvp: 'Nick Foles', city: 'Minneapolis' },
  { roman: 'LI', year: 2017, winner: 'Patriots', loser: 'Falcons', mvp: 'Tom Brady', city: 'Houston' },
  { roman: '50', year: 2016, winner: 'Broncos', loser: 'Panthers', mvp: 'Von Miller', city: 'Santa Clara' },
  { roman: 'XLIX', year: 2015, winner: 'Patriots', loser: 'Seahawks', mvp: 'Tom Brady', city: 'Glendale' },
  { roman: 'XLVIII', year: 2014, winner: 'Seahawks', loser: 'Broncos', mvp: 'Malcolm Smith', city: 'East Rutherford' },
  { roman: 'XLVII', year: 2013, winner: 'Ravens', loser: '49ers', mvp: 'Joe Flacco', city: 'New Orleans' },
  { roman: 'XLVI', year: 2012, winner: 'Giants', loser: 'Patriots', mvp: 'Eli Manning', city: 'Indianapolis' },
  { roman: 'XLV', year: 2011, winner: 'Packers', loser: 'Steelers', mvp: 'Aaron Rodgers', city: 'Arlington' },
  { roman: 'XLIV', year: 2010, winner: 'Saints', loser: 'Colts', mvp: 'Drew Brees', city: 'Miami Gardens' },
  { roman: 'XLIII', year: 2009, winner: 'Steelers', loser: 'Cardinals', mvp: 'Santonio Holmes', city: 'Tampa' },
  { roman: 'XLII', year: 2008, winner: 'Giants', loser: 'Patriots', mvp: 'Eli Manning', city: 'Glendale' },
  { roman: 'XLI', year: 2007, winner: 'Colts', loser: 'Bears', mvp: 'Peyton Manning', city: 'Miami Gardens' },
  { roman: 'XL', year: 2006, winner: 'Steelers', loser: 'Seahawks', mvp: 'Hines Ward', city: 'Detroit' },
  { roman: 'XXXIX', year: 2005, winner: 'Patriots', loser: 'Eagles', mvp: 'Deion Branch', city: 'Jacksonville' },
  { roman: 'XXXVIII', year: 2004, winner: 'Patriots', loser: 'Panthers', mvp: 'Tom Brady', city: 'Houston' },
  { roman: 'XXXVII', year: 2003, winner: 'Buccaneers', loser: 'Raiders', mvp: 'Dexter Jackson', city: 'San Diego' },
  { roman: 'XXXVI', year: 2002, winner: 'Patriots', loser: 'Rams', mvp: 'Tom Brady', city: 'New Orleans' },
  { roman: 'XXXV', year: 2001, winner: 'Ravens', loser: 'Giants', mvp: 'Ray Lewis', city: 'Tampa' },
  { roman: 'XXXIV', year: 2000, winner: 'Rams', loser: 'Titans', mvp: 'Kurt Warner', city: 'Atlanta' },
  { roman: 'XXXIII', year: 1999, winner: 'Broncos', loser: 'Falcons', mvp: 'John Elway', city: 'Miami Gardens' },
];

/** All team names that appear as winner/loser in the facts (for wrong-option pool). */
const allTeams = new Set<string>();
superBowlFacts.forEach((f) => {
  allTeams.add(f.winner);
  allTeams.add(f.loser);
});
export const superBowlTeamPool: string[] = [...allTeams];

/** All cities (for wrong-option pool). */
const allCities = new Set(superBowlFacts.map((f) => f.city));
export const superBowlCityPool: string[] = [...allCities];
