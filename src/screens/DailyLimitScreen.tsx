import { useState, useEffect } from 'react';
import { useDailyPlayLimit } from '../hooks/useDailyPlayLimit';
import { getTodaysGame } from '../services/games';
import { getUserPublicProfile } from '../services/profile';
import type { Game } from '../types/database';
import { getDailyGameQuestions } from '../lib/dailyGameQuestions';
import { getPickLabel } from '../lib/dailyDraftQuestion';
import type { GameQuestion } from '../lib/dailyGameQuestions';

interface DailyLimitScreenProps {
  currentUserId: string;
  onLeaderboard: () => void;
  /** Open current user's profile (e.g. "My Profile" button). */
  onMyProfile?: () => void;
}

export function DailyLimitScreen({ currentUserId, onLeaderboard, onMyProfile }: DailyLimitScreenProps) {
  const { lastPlayed } = useDailyPlayLimit();
  const [todaysGame, setTodaysGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStreak, setGameStreak] = useState<number>(0);
  // Format YYYY-MM-DD to MM/DD/YYYY
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  };

  function getTimeUntilMidnight(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const [timeUntilNext, setTimeUntilNext] = useState<string>(() => getTimeUntilMidnight());

  // Update countdown every second
  useEffect(() => {
    setTimeUntilNext(getTimeUntilMidnight());
    const interval = setInterval(() => setTimeUntilNext(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchTodaysGame() {
      setLoading(true);
      const { game, error } = await getTodaysGame();
      if (!error && game) {
        setTodaysGame(game);
      }
      // Get today's questions to display
      const todaysQuestions = getDailyGameQuestions();
      setQuestions(todaysQuestions);
      setLoading(false);
    }
    
    async function fetchGameStreak() {
      try {
        const { profile, error } = await getUserPublicProfile(currentUserId);
        if (!error && profile) {
          setGameStreak(profile.consecutive_days_played ?? 0);
        }
      } catch (err) {
        setGameStreak(0);
      }
    }
    
    fetchTodaysGame();
    fetchGameStreak();
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col p-6 relative overflow-y-auto">
      {/* Football field pattern background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
        }}></div>
      </div>

      {/* Leaderboard link at top - always visible */}
      <div className="relative z-20 flex justify-end mb-2">
        <button
          type="button"
          onClick={onLeaderboard}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg text-sm font-semibold transition-all backdrop-blur-sm"
        >
          View Leaderboard
        </button>
      </div>
      
      <div className="max-w-md w-full text-center space-y-6 relative z-10 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black text-white" style={{ 
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}>
          Today's Stats
        </h1>
        <div className="h-1 w-24 bg-white mx-auto rounded-full"></div>
        
        {loading ? (
          <p className="text-white/70">Loading your stats...</p>
        ) : todaysGame ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-white/20 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-white">{todaysGame.score}</div>
                <div className="text-sm text-white/80 font-semibold uppercase tracking-wide">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white">
                  {todaysGame.correct_answers}/{todaysGame.questions_answered}
                </div>
                <div className="text-sm text-white/80 font-semibold uppercase tracking-wide">Correct</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <div className="text-sm font-semibold text-white/90 mb-3">Question Breakdown:</div>
              <div className="space-y-4 text-left">
                {(questions[0]?.type === 'draft' || questions[0]?.type === 'superBowlFirstWinner' || questions[0]?.type === 'superBowlBearsNFC') && (
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">
                          {questions[0].type === 'superBowlFirstWinner' ? 'What team won the first ever Super Bowl?' : questions[0].type === 'superBowlBearsNFC' ? 'Who did the Bears beat in the NFC Championship to get to Super Bowl XLI?' : questions[0].type === 'draft' ? `${questions[0].year} NFL Draft` : ''}
                        </div>
                        <div className="text-white/70 text-xs mt-0.5">
                          Your answer: <span className={todaysGame.correct_draft ? 'text-green-300' : 'text-red-300'}>{todaysGame.user_answer_draft || '—'}</span>
                        </div>
                        <div className="text-white/70 text-xs mt-0.5">
                          Correct: {questions[0].correctAnswer}
                        </div>
                      </div>
                      <span className={`font-bold ml-2 ${todaysGame.correct_draft ? 'text-green-300' : 'text-red-300'}`}>
                        {todaysGame.correct_draft ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                )}
                {(questions[1]?.type === 'college' || questions[1]?.type === 'superBowlLastDefensiveMVP' || questions[1]?.type === 'superBowlWRMVPCount') && (
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">
                          {questions[1].type === 'superBowlLastDefensiveMVP' ? "Who's the last defensive player to win Super Bowl MVP?" : questions[1].type === 'superBowlWRMVPCount' ? 'How many wide receivers have won Super Bowl MVP?' : questions[1].type === 'college' ? `Which college did ${questions[1].name} attend?` : ''}
                        </div>
                        <div className="text-white/70 text-xs mt-0.5">
                          Your answer: <span className={todaysGame.correct_college ? 'text-green-300' : 'text-red-300'}>{todaysGame.user_answer_college || '—'}</span>
                        </div>
                        <div className="text-white/70 text-xs mt-0.5">
                          Correct: {questions[1].type === 'superBowlLastDefensiveMVP' ? questions[1].correctAnswer : questions[1].type === 'superBowlWRMVPCount' ? questions[1].correctAnswer : questions[1].type === 'college' ? questions[1].college : ''}
                        </div>
                      </div>
                      <span className={`font-bold ml-2 ${todaysGame.correct_college ? 'text-green-300' : 'text-red-300'}`}>
                        {todaysGame.correct_college ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                )}
                {(questions[2]?.type === 'careerPath' || questions[2]?.type === 'superBowlLosingTeamMVPCount' || questions[2]?.type === 'superBowlRushingRecord') && (
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">
                          {questions[2].type === 'superBowlLosingTeamMVPCount' ? 'How many losing teams have had a Super Bowl MVP?' : questions[2].type === 'superBowlRushingRecord' ? 'Who is the all-time leading rusher in a single Super Bowl?' : questions[2].type === 'careerPath' ? `Guess the ${questions[2].position} by career path` : ''}
                        </div>
                        {questions[2].type === 'careerPath' && (
                          <div className="text-white/70 text-xs mt-0.5">
                            {questions[2].college} → {questions[2].nflStints.map(s => s.team).join(', ')}
                          </div>
                        )}
                        <div className="text-white/70 text-xs mt-0.5">
                          Your answer: <span className={todaysGame.correct_career_path ? 'text-green-300' : 'text-red-300'}>{todaysGame.user_answer_career_path || '—'}</span>
                        </div>
                        <div className="text-white/70 text-xs mt-0.5">
                          Correct: {questions[2].correctAnswer}
                        </div>
                      </div>
                      <span className={`font-bold ml-2 ${todaysGame.correct_career_path ? 'text-green-300' : 'text-red-300'}`}>
                        {todaysGame.correct_career_path ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                )}
                {(questions[3]?.type === 'seasonLeader' || questions[3]?.type === 'superBowlLIIMVP' || questions[3]?.type === 'superBowlPatriotsMVPCount') && (() => {
                  const otherThreeCorrect = (todaysGame.correct_draft ? 1 : 0) + (todaysGame.correct_college ? 1 : 0) + (todaysGame.correct_career_path ? 1 : 0);
                  const seasonLeaderCorrect = todaysGame.correct_answers > otherThreeCorrect;
                  const q3 = questions[3];
                  const label = q3.type === 'superBowlLIIMVP'
                    ? 'Who won Super Bowl MVP of Super Bowl LII (Eagles vs Patriots)?'
                    : q3.type === 'superBowlPatriotsMVPCount'
                    ? 'How many Patriots not named Tom Brady have won Super Bowl MVP?'
                    : q3.type === 'seasonLeader'
                      ? `Who led the NFL in ${q3.category === 'passingTDs' ? 'passing touchdowns' : q3.category === 'rushingTDs' ? 'rushing touchdowns' : q3.category === 'receivingTDs' ? 'receiving touchdowns' : q3.category === 'sacks' ? 'sacks' : q3.category === 'interceptions' ? 'interceptions' : q3.category === 'passing' ? 'passing yards' : q3.category === 'rushing' ? 'rushing yards' : 'receiving yards'} in ${q3.year}?`
                      : '';
                  return (
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">{label}</div>
                          <div className="text-white/70 text-xs mt-0.5">
                            Your answer: <span className={seasonLeaderCorrect ? 'text-green-300' : 'text-red-300'}>{todaysGame.user_answer_season_leader || '—'}</span>
                          </div>
                          <div className="text-white/70 text-xs mt-0.5">
                            Correct: {questions[3].correctAnswer}
                          </div>
                        </div>
                        <span className={`font-bold ml-2 ${seasonLeaderCorrect ? 'text-green-300' : 'text-red-300'}`}>
                          {seasonLeaderCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white/70">No game data available</p>
        )}
        
        <p className="text-white text-xl font-semibold">
          Come back tomorrow for the next round
        </p>

        {/* Last played & Next game - always visible on this screen */}
        <div className="w-full max-w-sm mx-auto rounded-xl bg-white/15 backdrop-blur-sm border-2 border-white/25 p-4 space-y-3">
          <p className="text-sm text-white/90 font-semibold">
            Last played: {lastPlayed ? formatDate(lastPlayed) : todaysGame ? 'Today' : '—'}
          </p>
          <p className="text-sm text-white/90 font-semibold">
            Consecutive days streak: {gameStreak}
          </p>
          <p className="text-sm text-white/90 font-semibold">
            Next game in: <span className="font-mono font-bold text-amber-300 text-lg">{timeUntilNext}</span>
          </p>
        </div>
        
        <div className="pt-4 space-y-3">
          {onMyProfile && (
            <button
              type="button"
              onClick={onMyProfile}
              className="w-full py-3 bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white font-black text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wide"
            >
              My Profile
            </button>
          )}
          <button
            type="button"
            onClick={onLeaderboard}
            className="w-full py-3 bg-white text-green-900 hover:bg-yellow-400 font-black text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wide"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
