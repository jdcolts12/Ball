interface HomeScreenProps {
  onStart: () => void;
  onLeaderboard: () => void;
  onSignOut?: () => void;
  /** True while checking server before starting (disable Start button). */
  startingGame?: boolean;
}

export function HomeScreen({ onStart, onLeaderboard, onSignOut, startingGame }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Football field pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
        }}></div>
      </div>

      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className="absolute top-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-lg cursor-pointer text-sm font-semibold transition-all backdrop-blur-sm z-20"
        >
          Sign out
        </button>
      )}
      
      <div className="text-center relative z-10 max-w-md">
        <h1 className="text-6xl font-black text-white mb-3 tracking-tight" style={{ 
          textShadow: '3px 3px 6px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.15)',
        }}>
          YunoBall
        </h1>
        <div className="h-1.5 w-32 bg-white mx-auto mb-6 rounded-full"></div>
        <p className="text-white text-xl font-semibold mb-2 leading-relaxed">
          Daily NFL trivia. 3 questions, one round per day. Test Your Ball Knowledge
        </p>
        <p className="text-white/50 text-sm mb-2">Timer • One game per day • Leaderboard badges</p>
        <p className="text-amber-300/90 text-xs font-bold mb-8">Version 2.1 — Leaderboard & Timer Fix</p>
        <div className="space-y-4">
          <button
            type="button"
            onClick={onStart}
            disabled={startingGame}
            className="w-full py-4 bg-white text-green-900 hover:bg-yellow-400 font-black text-xl rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl uppercase tracking-wide disabled:opacity-60 disabled:pointer-events-none"
          >
            {startingGame ? 'Checking…' : 'Start game'}
          </button>
          <button
            type="button"
            onClick={onLeaderboard}
            className="w-full py-3 text-white/90 hover:text-white text-base font-bold transition-colors underline decoration-white/40 hover:decoration-white"
          >
            View leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
