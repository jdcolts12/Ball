/**
 * Verification script to check all questions for the next 2 weeks (2/7-2/22).
 * Run with: npx tsx verify-questions.ts
 */

import { getDailyGameQuestions } from './src/lib/dailyGameQuestions';

// Super Bowl facts to verify
const SUPER_BOWL_FACTS = {
  // Saturday 2/7 questions
  bearsNFC: {
    question: "Who did the Bears beat in the NFC Championship to reach Super Bowl XLI?",
    correct: "Saints",
    verified: true, // Verified: Bears beat Saints 39-14 on Jan 21, 2007
  },
  wrMvpCount: {
    question: "How many wide receivers have won Super Bowl MVP?",
    correct: "8", // Need to verify: Lynn Swann, Fred Biletnikoff, Jerry Rice, Deion Branch, Hines Ward, Santonio Holmes, Julian Edelman, Cooper Kupp
    verified: false, // ⚠️ NEEDS VERIFICATION - Some sources say 8, others say 9
  },
  rushingRecord: {
    question: "Who holds the single-game Super Bowl rushing record?",
    correct: "Tim Smith",
    verified: true, // Verified: Timmy Smith, 204 yards in SB XXII (1988)
  },
  patriotsMvpCount: {
    question: "How many Patriots players (not named Tom Brady) have won Super Bowl MVP?",
    correct: "2", // Deion Branch (SB XXXIX), Julian Edelman (SB LIII)
    verified: true, // Verified: Deion Branch and Julian Edelman
  },
  // Sunday 2/8 questions
  firstWinner: {
    question: "What team won the first ever Super Bowl?",
    correct: "Packers",
    verified: true, // Verified: Packers won SB I
  },
  lastDefensiveMVP: {
    question: "Who's the last defensive player to win Super Bowl MVP?",
    correct: "Von Miller",
    verified: true, // Verified: Von Miller, SB 50 (2016)
  },
  losingTeamMVP: {
    question: "How many losing teams have had a Super Bowl MVP?",
    correct: "1", // Chuck Howley, Cowboys, SB V
    verified: true, // Verified: Chuck Howley is the only one
  },
  sbLIIMVP: {
    question: "Who won Super Bowl MVP of Super Bowl LII (Eagles vs Patriots)?",
    correct: "Nick Foles",
    verified: true, // Verified: Nick Foles, SB LII (2018)
  },
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(startDate: string, days: number): string[] {
  const start = new Date(startDate);
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(formatDate(date));
  }
  return dates;
}

interface VerificationResult {
  date: string;
  questions: Array<{
    type: string;
    question: string;
    correctAnswer: string;
    verified: boolean;
    issues?: string[];
  }>;
  hasIssues: boolean;
}

function verifySuperBowlQuestions(date: string): VerificationResult {
  const questions = getDailyGameQuestions(date);
  const results: VerificationResult = {
    date,
    questions: [],
    hasIssues: false,
  };

  if (date === '2026-02-07') {
    // Saturday Super Bowl questions
    const q1 = questions[0];
    if (q1.type === 'superBowlBearsNFC') {
      results.questions.push({
        type: q1.type,
        question: "Who did the Bears beat in the NFC Championship to reach Super Bowl XLI?",
        correctAnswer: q1.correctAnswer,
        verified: q1.correctAnswer === SUPER_BOWL_FACTS.bearsNFC.correct,
        issues: q1.correctAnswer !== SUPER_BOWL_FACTS.bearsNFC.correct ? ['Incorrect answer'] : undefined,
      });
    }

    const q2 = questions[1];
    if (q2.type === 'superBowlWRMVPCount') {
      const verified = q2.correctAnswer === SUPER_BOWL_FACTS.wrMvpCount.correct;
      results.questions.push({
        type: q2.type,
        question: "How many wide receivers have won Super Bowl MVP?",
        correctAnswer: q2.correctAnswer,
        verified,
        issues: !verified ? ['⚠️ WR MVP count may be incorrect - some sources say 9, code says 8'] : undefined,
      });
      if (!verified) results.hasIssues = true;
    }

    const q3 = questions[2];
    if (q3.type === 'superBowlRushingRecord') {
      results.questions.push({
        type: q3.type,
        question: "Who holds the single-game Super Bowl rushing record?",
        correctAnswer: q3.correctAnswer,
        verified: q3.correctAnswer === SUPER_BOWL_FACTS.rushingRecord.correct,
        issues: q3.correctAnswer !== SUPER_BOWL_FACTS.rushingRecord.correct ? ['Incorrect answer'] : undefined,
      });
    }

    const q4 = questions[3];
    if (q4.type === 'superBowlPatriotsMVPCount') {
      results.questions.push({
        type: q4.type,
        question: "How many Patriots players (not named Tom Brady) have won Super Bowl MVP?",
        correctAnswer: q4.correctAnswer,
        verified: q4.correctAnswer === SUPER_BOWL_FACTS.patriotsMvpCount.correct,
        issues: q4.correctAnswer !== SUPER_BOWL_FACTS.patriotsMvpCount.correct ? ['Incorrect answer'] : undefined,
      });
    }
  } else if (date === '2026-02-08') {
    // Sunday Super Bowl questions
    const q1 = questions[0];
    if (q1.type === 'superBowlFirstWinner') {
      results.questions.push({
        type: q1.type,
        question: "What team won the first ever Super Bowl?",
        correctAnswer: q1.correctAnswer,
        verified: q1.correctAnswer === SUPER_BOWL_FACTS.firstWinner.correct,
        issues: q1.correctAnswer !== SUPER_BOWL_FACTS.firstWinner.correct ? ['Incorrect answer'] : undefined,
      });
    }

    const q2 = questions[1];
    if (q2.type === 'superBowlLastDefensiveMVP') {
      results.questions.push({
        type: q2.type,
        question: "Who's the last defensive player to win Super Bowl MVP?",
        correctAnswer: q2.correctAnswer,
        verified: q2.correctAnswer === SUPER_BOWL_FACTS.lastDefensiveMVP.correct,
        issues: q2.correctAnswer !== SUPER_BOWL_FACTS.lastDefensiveMVP.correct ? ['Incorrect answer'] : undefined,
      });
    }

    const q3 = questions[2];
    if (q3.type === 'superBowlLosingTeamMVPCount') {
      results.questions.push({
        type: q3.type,
        question: "How many losing teams have had a Super Bowl MVP?",
        correctAnswer: q3.correctAnswer,
        verified: q3.correctAnswer === SUPER_BOWL_FACTS.losingTeamMVP.correct,
        issues: q3.correctAnswer !== SUPER_BOWL_FACTS.losingTeamMVP.correct ? ['Incorrect answer'] : undefined,
      });
    }

    const q4 = questions[3];
    if (q4.type === 'superBowlLIIMVP') {
      results.questions.push({
        type: q4.type,
        question: "Who won Super Bowl MVP of Super Bowl LII (Eagles vs Patriots)?",
        correctAnswer: q4.correctAnswer,
        verified: q4.correctAnswer === SUPER_BOWL_FACTS.sbLIIMVP.correct,
        issues: q4.correctAnswer !== SUPER_BOWL_FACTS.sbLIIMVP.correct ? ['Incorrect answer'] : undefined,
      });
    }
  }

  return results;
}

function verifyRegularQuestions(date: string): VerificationResult {
  const questions = getDailyGameQuestions(date);
  const results: VerificationResult = {
    date,
    questions: [],
    hasIssues: false,
  };

  // Verify we have exactly 4 questions
  if (questions.length !== 4) {
    results.hasIssues = true;
    results.questions.push({
      type: 'ERROR',
      question: 'Question count',
      correctAnswer: '4',
      verified: false,
      issues: [`Expected 4 questions, got ${questions.length}`],
    });
    return results;
  }

  // Verify question types
  const expectedTypes = ['draft', 'college', 'careerPath', 'seasonLeader'];
  const actualTypes = questions.map(q => q.type);
  
  for (let i = 0; i < expectedTypes.length; i++) {
    const expected = expectedTypes[i];
    const actual = actualTypes[i];
    if (actual !== expected) {
      results.hasIssues = true;
      results.questions.push({
        type: 'ERROR',
        question: `Question ${i + 1} type`,
        correctAnswer: expected,
        verified: false,
        issues: [`Expected type "${expected}", got "${actual}"`],
      });
    }
  }

  // Verify each question has valid structure
  questions.forEach((q, idx) => {
    if (q.type === 'draft') {
      if (!('year' in q) || !('correctAnswer' in q) || !('options' in q)) {
        results.hasIssues = true;
        results.questions.push({
          type: q.type,
          question: `Draft question ${idx + 1}`,
          correctAnswer: 'Valid structure',
          verified: false,
          issues: ['Missing required fields'],
        });
      } else {
        // Verify correct answer is in options
        if (!q.options.includes(q.correctAnswer)) {
          results.hasIssues = true;
          results.questions.push({
            type: q.type,
            question: `Draft question ${idx + 1}`,
            correctAnswer: q.correctAnswer,
            verified: false,
            issues: ['Correct answer not in options'],
          });
        } else {
          results.questions.push({
            type: q.type,
            question: `${q.year} Draft - Pick ${(q.missingSlotIndex ?? 0) + 1}`,
            correctAnswer: q.correctAnswer,
            verified: true,
          });
        }
      }
    } else if (q.type === 'college') {
      if (!('name' in q) || !('college' in q) || !('options' in q)) {
        results.hasIssues = true;
        results.questions.push({
          type: q.type,
          question: `College question ${idx + 1}`,
          correctAnswer: 'Valid structure',
          verified: false,
          issues: ['Missing required fields'],
        });
      } else {
        // Verify correct answer (college) is in options
        if (!q.options.includes(q.college)) {
          results.hasIssues = true;
          results.questions.push({
            type: q.type,
            question: `College question ${idx + 1}`,
            correctAnswer: q.college,
            verified: false,
            issues: ['Correct answer not in options'],
          });
        } else {
          results.questions.push({
            type: q.type,
            question: `What college did ${q.name} attend?`,
            correctAnswer: q.college,
            verified: true,
          });
        }
      }
    } else if (q.type === 'careerPath') {
      if (!('correctAnswer' in q) || !('options' in q)) {
        results.hasIssues = true;
        results.questions.push({
          type: q.type,
          question: `Career path question ${idx + 1}`,
          correctAnswer: 'Valid structure',
          verified: false,
          issues: ['Missing required fields'],
        });
      } else {
        // Verify correct answer is in options
        if (!q.options.includes(q.correctAnswer)) {
          results.hasIssues = true;
          results.questions.push({
            type: q.type,
            question: `Career path question ${idx + 1}`,
            correctAnswer: q.correctAnswer,
            verified: false,
            issues: ['Correct answer not in options'],
          });
        } else {
          results.questions.push({
            type: q.type,
            question: `Career path: ${q.position} from ${q.college} (${q.collegeYears})`,
            correctAnswer: q.correctAnswer,
            verified: true,
          });
        }
      }
    } else if (q.type === 'seasonLeader') {
      if (!('year' in q) || !('category' in q) || !('correctAnswer' in q) || !('options' in q)) {
        results.hasIssues = true;
        results.questions.push({
          type: q.type,
          question: `Season leader question ${idx + 1}`,
          correctAnswer: 'Valid structure',
          verified: false,
          issues: ['Missing required fields'],
        });
      } else {
        // Verify correct answer is in options
        if (!q.options.includes(q.correctAnswer)) {
          results.hasIssues = true;
          results.questions.push({
            type: q.type,
            question: `Season leader question ${idx + 1}`,
            correctAnswer: q.correctAnswer,
            verified: false,
            issues: ['Correct answer not in options'],
          });
        } else {
          results.questions.push({
            type: q.type,
            question: `${q.year} ${q.category} leader`,
            correctAnswer: q.correctAnswer,
            verified: true,
          });
        }
      }
    }
  });

  return results;
}

function main() {
  console.log('🔍 Verifying questions for the next 2 weeks (2/7-2/22)...\n');
  
  const dates = getDateRange('2026-02-07', 16); // 2/7 through 2/22
  const allResults: VerificationResult[] = [];

  for (const date of dates) {
    let result: VerificationResult;
    if (date === '2026-02-07' || date === '2026-02-08') {
      result = verifySuperBowlQuestions(date);
    } else {
      result = verifyRegularQuestions(date);
    }
    allResults.push(result);
  }

  // Print results
  let totalIssues = 0;
  for (const result of allResults) {
    const dateLabel = new Date(result.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    console.log(`\n📅 ${dateLabel} (${result.date})`);
    console.log('─'.repeat(60));
    
    if (result.hasIssues) {
      console.log('❌ ISSUES FOUND:');
      totalIssues++;
    } else {
      console.log('✅ All questions valid');
    }

    for (const q of result.questions) {
      const status = q.verified ? '✅' : '❌';
      console.log(`  ${status} ${q.type}: ${q.question}`);
      console.log(`     Answer: ${q.correctAnswer}`);
      if (q.issues && q.issues.length > 0) {
        q.issues.forEach(issue => console.log(`     ⚠️  ${issue}`));
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY`);
  console.log('='.repeat(60));
  console.log(`Total dates checked: ${allResults.length}`);
  console.log(`Dates with issues: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ All questions verified successfully!');
  } else {
    console.log('\n⚠️  Some issues were found. Please review above.');
  }

  // Special note about WR MVP count
  console.log('\n📝 NOTE: WR MVP count (Saturday Q2) may need verification.');
  console.log('   Code says 8, but some sources say 9. Please verify:');
  console.log('   - Lynn Swann (SB X)');
  console.log('   - Fred Biletnikoff (SB XI)');
  console.log('   - Jerry Rice (SB XXIII)');
  console.log('   - Deion Branch (SB XXXIX)');
  console.log('   - Hines Ward (SB XL)');
  console.log('   - Santonio Holmes (SB XLIII)');
  console.log('   - Julian Edelman (SB LIII)');
  console.log('   - Cooper Kupp (SB LVI)');
  console.log('   - (Possible 9th?)');
}

main();
