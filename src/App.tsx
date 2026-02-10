import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useDailyPlayLimit } from './hooks/useDailyPlayLimit';
import { recordCompletedGame, hasPlayedTodayFromServer } from './services/games';
import { getAllTimeLeaderboard } from './services/leaderboard';
import { AuthScreen } from './screens/AuthScreen';
import { DailyLimitScreen } from './screens/DailyLimitScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { QuizFinishedPopup } from './screens/QuizFinishedPopup';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import type { GameResultBreakdown } from './screens/GameScreen';

type Screen = 'home' | 'game' | 'results' | 'leaderboard' | 'profile';

const loadingStyle = { minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', fontWeight: 'bold' };

function App() {
  const { user, initializing, signOut } = useAuth();
  const { canPlay, recordPlay, refreshCanPlay, checking } = useDailyPlayLimit();
  const [screen, setScreen] = useState<Screen>('home');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [results, setResults] = useState<{ score: number; correct: number; total: number; breakdown: GameResultBreakdown } | null>(null);
  const [startingGame, setStartingGame] = useState(false);
  const [showQuizFinishedPopup, setShowQuizFinishedPopup] = useState(false);
  const [careerRankBefore, setCareerRankBefore] = useState<number | null>(null);

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

  if (screen === 'profile' && profileUserId && user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        <ProfileScreen
          userId={profileUserId}
          currentUserId={user.id}
          onBack={() => { setProfileUserId(null); setScreen('leaderboard'); }}
          onOpenProfile={(uid) => { setProfileUserId(uid); setScreen('profile'); }}
        />
      </div>
    );
  }

  // Show leaderboard regardless of canPlay status
  if (screen === 'leaderboard') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        <LeaderboardScreen
          currentUserId={user.id}
          onBack={() => setScreen('home')}
          onOpenProfile={(uid) => { setProfileUserId(uid); setScreen('profile'); }}
        />
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
          <DailyLimitScreen
            currentUserId={user.id}
            onLeaderboard={() => setScreen('leaderboard')}
            onMyProfile={() => { setProfileUserId(user.id); setScreen('profile'); }}
          />
        )}
      </div>
    );
  }

  if (screen === 'results' && results) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #065f46, #047857, #065f46)' }}>
        {showQuizFinishedPopup ? (
          <QuizFinishedPopup
            correct={results.correct}
            total={results.total}
            userId={user.id}
            careerRankBefore={careerRankBefore}
            onClose={() => {
              setShowQuizFinishedPopup(false);
              setResults(null);
              setScreen('home');
              refreshCanPlay();
            }}
          />
        ) : (
          <ResultsScreen
            score={results.score}
            correct={results.correct}
            total={results.total}
            breakdown={results.breakdown}
            currentUserId={user.id}
            onLeaderboard={() => setScreen('leaderboard')}
            onHome={() => { refreshCanPlay().then(() => { setResults(null); setScreen('home'); }); }}
            onOpenProfile={(uid) => { setProfileUserId(uid); setScreen('profile'); }}
          />
        )}
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
        const { rows } = await getAllTimeLeaderboard(500);
        const myRow = rows.find((r) => r.userId === user.id);
        setCareerRankBefore(myRow ? myRow.rank : null);
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
              .then(() => {
                recordPlay();
                setResults({ score, correct, total, breakdown });
                setShowQuizFinishedPopup(true);
                setScreen('results');
              })
              .catch((err) => {
                console.error('Failed to save game (daily stats may not show):', err);
                setResults({ score, correct, total, breakdown });
                setScreen('results');
              });
          } else {
            setResults({ score, correct, total, breakdown });
            setScreen('results');
          }
        }}
      />
    </div>
  );
}

export default App;
// Force redeploy - question breakdown fix
