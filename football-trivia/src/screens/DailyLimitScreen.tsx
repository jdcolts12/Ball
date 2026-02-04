import { useDailyPlayLimit } from '../hooks/useDailyPlayLimit';

export function DailyLimitScreen() {
  const { lastPlayed } = useDailyPlayLimit();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="rounded-full bg-amber-500/20 p-4 inline-flex">
          <svg
            className="w-12 h-12 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">
          You've already played today
        </h1>
        <p className="text-slate-400">
          Come back tomorrow for another round of YunoBall.
        </p>
        {lastPlayed && (
          <p className="text-sm text-slate-500">
            Last played: {lastPlayed}
          </p>
        )}
      </div>
    </div>
  );
}
