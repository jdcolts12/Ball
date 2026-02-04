/**
 * NFL team name → ESPN CDN logo abbreviation (500px).
 * Used for career path question team logos.
 */
const NFL_LOGO_ABBREV: Record<string, string> = {
  Patriots: 'ne',
  Bills: 'buf',
  Dolphins: 'mia',
  Jets: 'nyj',
  Ravens: 'bal',
  Bengals: 'cin',
  Browns: 'cle',
  Steelers: 'pit',
  Texans: 'hou',
  Colts: 'ind',
  Jaguars: 'jax',
  Titans: 'ten',
  Broncos: 'den',
  Chiefs: 'kc',
  Raiders: 'lv',
  Chargers: 'lac',
  Cowboys: 'dal',
  Giants: 'nyg',
  Eagles: 'phi',
  Commanders: 'was',
  'Washington': 'was',
  Bears: 'chi',
  Lions: 'det',
  Packers: 'gb',
  Vikings: 'min',
  Falcons: 'atl',
  Panthers: 'car',
  Saints: 'no',
  Buccaneers: 'tb',
  Cardinals: 'ari',
  Rams: 'lar',
  '49ers': 'sf',
  Seahawks: 'sea',
};

const ESPN_NFL_LOGO_BASE = 'https://a.espncdn.com/i/teamlogos/nfl/500';

/** Returns ESPN CDN URL for an NFL team logo, or null if unknown. */
export function getNflLogoUrl(teamName: string): string {
  const abbrev = NFL_LOGO_ABBREV[teamName];
  if (!abbrev) return '';
  return `${ESPN_NFL_LOGO_BASE}/${abbrev}.png`;
}
