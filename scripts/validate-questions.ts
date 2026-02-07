/**
 * Validates all question data for consistency and obvious errors.
 * Run: npx tsx scripts/validate-questions.ts
 * (Or: npm run validate)
 */

import { draftClasses } from '../src/data/drafts';
import { players } from '../src/data/players';
import { careerPathPlayers } from '../src/data/careerPathPlayers';
import { seasonLeaders } from '../src/data/seasonLeaders';

let hasErrors = false;

function fail(msg: string): void {
  console.error('❌ ' + msg);
  hasErrors = true;
}

function ok(msg: string): void {
  console.log('✅ ' + msg);
}

// --- Drafts ---
console.log('\n--- Draft classes ---');
const draftYears = new Set<number>();
for (const c of draftClasses) {
  if (c.picks.length !== 10) fail(`Draft ${c.year}: expected 10 picks, got ${c.picks.length}`);
  if (draftYears.has(c.year)) fail(`Draft: duplicate year ${c.year}`);
  draftYears.add(c.year);
  const empty = c.picks.some((p) => !p || p.trim() === '');
  if (empty) fail(`Draft ${c.year}: has empty pick`);
}
ok(`Drafts: ${draftClasses.length} years, 10 picks each`);

// --- Players (college) ---
console.log('\n--- College questions (players) ---');
for (let i = 0; i < players.length; i++) {
  const p = players[i];
  if (!p.name || !p.college) fail(`Players[${i}]: missing name or college`);
  if (p.wrongOptions.length !== 3) fail(`Players[${i}] ${p.name}: wrongOptions must have length 3`);
  if (p.wrongOptions.includes(p.college)) fail(`Players[${i}] ${p.name}: wrongOptions contains correct college`);
  const dup = p.wrongOptions.filter((c) => c === p.college);
  if (dup.length) fail(`Players[${i}] ${p.name}: wrongOptions duplicates college`);
}
ok(`Players: ${players.length} entries, 3 wrong options each`);

// --- Career path ---
console.log('\n--- Career path questions ---');
for (let i = 0; i < careerPathPlayers.length; i++) {
  const p = careerPathPlayers[i];
  if (!p.name || !p.college || !p.nflTeams?.length) fail(`CareerPath[${i}]: missing name, college, or nflTeams`);
  if (p.nflTeamYears.length !== p.nflTeams.length) {
    fail(`CareerPath[${i}] ${p.name}: nflTeams length (${p.nflTeams.length}) !== nflTeamYears length (${p.nflTeamYears.length})`);
  }
  if (p.wrongOptions.length !== 3) fail(`CareerPath[${i}] ${p.name}: wrongOptions must have length 3`);
  if (p.wrongOptions.includes(p.name)) fail(`CareerPath[${i}] ${p.name}: wrongOptions contains correct name`);
}
ok(`Career path: ${careerPathPlayers.length} entries`);

// --- Season leaders ---
console.log('\n--- Season leaders ---');
const categories = new Set(seasonLeaders.map((s) => s.category));
for (const s of seasonLeaders) {
  if (!s.year || !s.leader) fail(`SeasonLeader ${s.year} ${s.category}: missing year or leader`);
  if (s.wrongOptions.length !== 3) fail(`SeasonLeader ${s.year} ${s.category}: wrongOptions must have length 3`);
  if (['passingTDs', 'rushingTDs', 'receivingTDs', 'sacks', 'interceptions'].includes(s.category) && s.statValue === undefined) {
    fail(`SeasonLeader ${s.year} ${s.category}: statValue required for this category`);
  }
}
ok(`Season leaders: ${seasonLeaders.length} entries, categories: ${[...categories].sort().join(', ')}`);

// --- Daily game builder sanity (optional: build one day and check) ---
console.log('\n--- Daily question builder ---');
try {
  const { getDailyGameQuestions } = await import('../src/lib/dailyGameQuestions');
  const questions = getDailyGameQuestions('2025-01-15');
  if (questions.length !== 4) fail(`getDailyGameQuestions returned ${questions.length} questions, expected 4`);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const opts = 'options' in q ? q.options : [];
    if (opts.length !== 4) fail(`Question ${i} (${q.type}): options length ${opts.length}`);
    const correct =
      'correctAnswer' in q ? (q as { correctAnswer: string }).correctAnswer : 'college' in q ? (q as { college: string }).college : null;
    if (correct && !opts.includes(correct)) {
      const hasMatch = opts.some((o: string) => o === correct || o.startsWith(correct.split(' ')[0]));
      if (!hasMatch) fail(`Question ${i} (${q.type}): correct "${correct}" not in options`);
    }
  }
  ok('getDailyGameQuestions returns 4 questions with 4 options each');
} catch (e) {
  fail('getDailyGameQuestions threw: ' + (e instanceof Error ? e.message : String(e)));
}

// --- Summary ---
console.log('\n' + (hasErrors ? '❌ Validation finished with errors.' : '✅ All checks passed.'));
process.exit(hasErrors ? 1 : 0);
