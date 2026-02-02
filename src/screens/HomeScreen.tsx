interface HomeScreenProps {
  onStart: () => void;
  onLeaderboard: () => void;
  onSignOut?: () => void;
}

export function HomeScreen({ onStart, onLeaderboard, onSignOut }: HomeScreenProps) {
  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#0f172a', color: '#e2e8f0' }}
    >
      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Sign out
        </button>
      )}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>YunoBall</h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Daily NFL trivia. Draft top 10, college trivia, career path — 3 questions, one round per day.
        </p>
        <button
          type="button"
          onClick={onStart}
          style={{ padding: '1rem 2rem', background: '#f59e0b', color: '#1e293b', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Start game
        </button>
        <button
          type="button"
          onClick={onLeaderboard}
          style={{ display: 'block', width: '100%', marginTop: '1rem', padding: '0.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          View leaderboard
        </button>
      </div>
    </div>
  );
}
