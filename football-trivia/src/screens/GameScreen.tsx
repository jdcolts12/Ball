import { useState, useCallback, useMemo } from 'react';
import type { GameQuestion } from '../lib/dailyGameQuestions';
import { getDailyGameQuestions } from '../lib/dailyGameQuestions';
import { getPickLabel } from '../lib/dailyDraftQuestion';
import { getNflLogoUrl } from '../lib/teamLogos';
import { isCloseEnough } from '../lib/stringSimilarity';
import { getDraftCorrectPctToday, getCollegeCorrectPctToday, getCareerPathCorrectPctToday, includeCurrentPlayer } from '../services/games';

export interface GameResultBreakdown {
  draftCorrect: boolean;
  collegeCorrect: boolean;
  careerPathCorrect: boolean;
}

interface GameScreenProps {
  onEnd: (score: number, correct: number, total: number, breakdown: GameResultBreakdown) => void;
}

export function GameScreen({ onEnd }: GameScreenProps) {
  const questions = useMemo(() => getDailyGameQuestions(), []);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  /** Per-question correct: [draft, college, careerPath] */
  const [correctByType, setCorrectByType] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  /** For career path: fill-in-the-blank guess. */
  const [careerPathGuess, setCareerPathGuess] = useState('');
  /** After answering: % of players who got today's version of this question correct (0–100). */
  const [questionCorrectPct, setQuestionCorrectPct] = useState<number | null>(null);

  const current: GameQuestion = questions[index];
  const correctAnswer =
    current.type === 'college'
      ? current.college
      : current.type === 'careerPath'
        ? current.correctAnswer
        : current.correctAnswer;
  const options = current.options;

  const handleAnswer = useCallback(
    (choice: string) => {
      if (answered) return;
      setAnswered(true);
      const correct =
        current.type === 'careerPath'
          ? isCloseEnough(choice, correctAnswer)
          : choice === correctAnswer;
      const currentCorrect = correct; // boolean: did this player get it right
      if (current.type === 'draft') {
        getDraftCorrectPctToday().then(({ total, correct: correctCount, error }) =>
          setQuestionCorrectPct(error ? null : includeCurrentPlayer(total, correctCount, currentCorrect)));
      } else if (current.type === 'college') {
        getCollegeCorrectPctToday().then(({ total, correct: correctCount, error }) =>
          setQuestionCorrectPct(error ? null : includeCurrentPlayer(total, correctCount, currentCorrect)));
      } else {
        getCareerPathCorrectPctToday().then(({ total, correct: correctCount, error }) =>
          setQuestionCorrectPct(error ? null : includeCurrentPlayer(total, correctCount, currentCorrect)));
      }
      if (correct) {
        setScore((s) => s + 1);
        setCorrectCount((c) => c + 1);
      }
      setSelected(choice);

      const newScore = score + (correct ? 1 : 0);
      const newCorrect = correctCount + (correct ? 1 : 0);
      const isDraft = current.type === 'draft';
      const isCollege = current.type === 'college';
      const isCareerPath = current.type === 'careerPath';

      setTimeout(() => {
        if (index + 1 >= questions.length) {
          const finalDraft = isDraft ? correct : correctByType[0];
          const finalCollege = isCollege ? correct : correctByType[1];
          const finalCareerPath = isCareerPath ? correct : correctByType[2];
          onEnd(newScore, newCorrect, questions.length, {
            draftCorrect: finalDraft,
            collegeCorrect: finalCollege,
            careerPathCorrect: finalCareerPath,
          });
        } else {
          setCorrectByType((prev) => {
            const next: [boolean, boolean, boolean] = [...prev];
            if (isDraft) next[0] = correct;
            else if (isCollege) next[1] = correct;
            else if (isCareerPath) next[2] = correct;
            return next;
          });
          setIndex((i) => i + 1);
          setSelected(null);
          setAnswered(false);
          setCareerPathGuess('');
          setQuestionCorrectPct(null);
        }
      }, 3000);
    },
    [correctAnswer, answered, index, questions.length, score, correctCount, correctByType, current.type, onEnd],
  );

  const handleCareerPathSubmit = useCallback(() => {
    const guess = careerPathGuess.trim();
    if (!guess) return;
    handleAnswer(guess);
  }, [careerPathGuess, handleAnswer]);

  const careerPathCorrect = current.type === 'careerPath' && answered && isCloseEnough(careerPathGuess, current.correctAnswer);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <p className="text-slate-400 text-sm">
          Question {index + 1} of {questions.length}
        </p>

        {current.type === 'draft' ? (
          <>
            <h2 className="text-2xl font-bold text-white text-center">
              <span className="text-amber-400">{current.year} NFL Draft</span> top 10 — who's missing?
            </h2>
            <p className="text-slate-400 text-sm text-center">
              {getPickLabel(current.missingSlotIndex)} is missing below.
            </p>
            <ul className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
              {current.shownPicks.map((name, i) => (
                <li key={i}>
                  {name ?? '???'}
                </li>
              ))}
            </ul>
          </>
        ) : current.type === 'careerPath' ? (
          <>
            <p className="text-amber-400 font-semibold text-center text-sm uppercase tracking-wide mb-1">
              Position: {current.position}
            </p>
            <h2 className="text-2xl font-bold text-white text-center">
              Guess the {current.position} by career path
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-2">
              {/* College stop (no logo - use placeholder) */}
              <div className="flex flex-col items-center min-w-[4rem] px-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg sm:text-xl" title="College">
                  🎓
                </div>
                <span className="text-slate-300 text-xs sm:text-sm text-center mt-1 font-medium leading-tight">{current.college}</span>
                <span className="text-slate-500 text-xs">({current.collegeYears})</span>
              </div>
              {current.nflStints.map((stint, i) => (
                <span key={i} className="flex items-center gap-1 sm:gap-2">
                  <span className="text-amber-400/80 font-bold" aria-hidden>→</span>
                  <div className="flex flex-col items-center min-w-[4rem] px-1">
                    {getNflLogoUrl(stint.team) ? (
                      <img
                        src={getNflLogoUrl(stint.team)}
                        alt=""
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain bg-slate-800 border border-slate-600"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-bold">
                        {stint.team.slice(0, 1)}
                      </div>
                    )}
                    <span className="text-slate-300 text-xs sm:text-sm text-center mt-1 font-medium leading-tight">{stint.team}</span>
                    <span className="text-slate-500 text-xs">({stint.years})</span>
                  </div>
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-sm text-center mt-2">Who is this {current.position}? Type the player&apos;s name.</p>
            {!answered ? (
              <div className="flex flex-col gap-2 mt-4">
                <input
                  type="text"
                  value={careerPathGuess}
                  onChange={(e) => setCareerPathGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCareerPathSubmit()}
                  placeholder="e.g. Johnny Manziel"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  autoFocus
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleCareerPathSubmit}
                  disabled={!careerPathGuess.trim()}
                  className="w-full py-3 rounded-lg font-bold bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-lg border-2 text-center">
                {careerPathCorrect ? (
                  <p className="text-green-400 font-semibold">Correct!</p>
                ) : (
                  <>
                    <p className="text-red-400 font-semibold">Wrong</p>
                    <p className="text-slate-300 mt-1">The answer was <span className="text-amber-400 font-medium">{current.correctAnswer}</span>.</p>
                  </>
                )}
                <p className="text-slate-500 text-sm mt-2">
                  {questionCorrectPct !== null
                    ? `${questionCorrectPct}% of players got this question correct.`
                    : '—% of players got this question correct.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <h2 className="text-2xl font-bold text-white text-center">
            Which college did <span className="text-amber-400">{current.name}</span> attend?
          </h2>
        )}

        {current.type !== 'careerPath' && (
          <div className="grid gap-3">
            {options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === correctAnswer;
              const showResult = answered && isSelected;
              const correctClass = showResult && isCorrect ? 'bg-green-600 border-green-500' : '';
              const wrongClass = showResult && !isCorrect ? 'bg-red-600/50 border-red-500' : '';
              const baseClass = 'px-4 py-3 rounded-lg border-2 text-left font-medium transition-colors ';
              const interactiveClass = !answered ? 'hover:bg-slate-700 border-slate-600 cursor-pointer' : 'cursor-default opacity-80';

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={answered}
                  onClick={() => handleAnswer(opt)}
                  className={baseClass + interactiveClass + (showResult ? ' ' + (isCorrect ? correctClass : wrongClass) : ' border-slate-600 bg-slate-800')}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}
        {answered && (current.type === 'draft' || current.type === 'college') && (
          <p className="text-slate-500 text-sm text-center mt-3">
            {questionCorrectPct !== null
              ? `${questionCorrectPct}% of players got this question correct.`
              : '—% of players got this question correct.'}
          </p>
        )}
      </div>
    </div>
  );
}
