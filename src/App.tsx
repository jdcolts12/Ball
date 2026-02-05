import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useDailyPlayLimit } from './hooks/useDailyPlayLimit';
import { recordCompletedGame, hasPlayedTodayFromServer } from './services/games';
import { AuthScreen } from './screens/AuthScreen';
import { DailyLimitScreen } from './screens/DailyLimitScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import type { GameResultBreakdown } from './screens/GameScreen';

type Screen = 'home' | 'game' | 'results' | 'leaderboard';

const loadingStyle = { minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', fontWeight: 'bold' };

function App() {
  const { user, initializing, signOut } = useAuth();
  const { canPlay, recordPlay, refreshCanPlay, checking } = useDailyPlayLimit();
  const [screen, setScreen] = useState<Screen>('home');
  const [results, setResults] = useState<{ score: number; correct: number; total: number; breakdown: GameResultBreakdown } | null>(null);
  const [startingGame, setStartingGame] = useState(false);

  if (initializing) {
    return <div style={loadingStyle}>Loading…</div>;
  }
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        <AuthScreen onSuccess={() => {}} />
      </div>
    );
  }

  // Show leaderboard regardless of canPlay status
  if (screen === 'leaderboard') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        <LeaderboardScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  // Show "checking" or "already played" screen when they can't play
  if (checking || !canPlay) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        {checking ? (
          <div style={loadingStyle}>Checking…</div>
        ) : (
          <DailyLimitScreen onLeaderboard={() => setScreen('leaderboard')} />
        )}
      </div>
    );
  }

  if (screen === 'results' && results) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        <ResultsScreen
          score={results.score}
          correct={results.correct}
          total={results.total}
          breakdown={results.breakdown}
          onLeaderboard={() => setScreen('leaderboard')}
          onHome={() => { refreshCanPlay().then(() => { setResults(null); setScreen('home'); }); }}
        />
      </div>
    );
  }

  if (screen === 'home') {
    const handleStart = async () => {
      setStartingGame(true);
      try {
        const { played } = await hasPlayedTodayFromServer();
        if (played) {
          refreshCanPlay();
          return;
        }
        setScreen('game');
      } finally {
        setStartingGame(false);
      }
    };
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        <HomeScreen
          onStart={handleStart}
          onLeaderboard={() => setScreen('leaderboard')}
          onSignOut={signOut}
          startingGame={startingGame}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
      <GameScreen
        onEnd={(score, correct, total, breakdown) => {
          setResults({ score, correct, total, breakdown });
          setScreen('results');
          if (user) {
            recordCompletedGame({
              score,
              questionsAnswered: total,
              correctAnswers: correct,
              correctDraft: breakdown.draftCorrect,
              correctCollege: breakdown.collegeCorrect,
              correctCareerPath: breakdown.careerPathCorrect,
              userAnswerDraft: breakdown.userAnswerDraft,
              userAnswerCollege: breakdown.userAnswerCollege,
              userAnswerCareerPath: breakdown.userAnswerCareerPath,
              userAnswerSeasonLeader: breakdown.userAnswerSeasonLeader,
            })
              .then(() => recordPlay())
              .catch(() => {});
          }
        }}
      />
    </div>
  );
}

export default App;
// Force redeploy - question breakdown fix
