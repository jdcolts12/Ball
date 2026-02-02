import { useState } from 'react';
import { signUp, signIn } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthScreenProps {
  onSuccess: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Choose a username');
          return;
        }
        const { error: err, session } = await signUp(email.trim(), password, username.trim());
        if (err) {
          setError(err.message);
          return;
        }
        if (session) {
          onSuccess();
          return;
        }
        setMessage('Check your email to confirm your account, then sign in.');
        setMode('signin');
      } else {
        const { error: err } = await signIn(email.trim(), password);
        if (err) {
          const raw = err.message.toLowerCase();
          let msg = err.message;
          if (raw.includes('email not confirmed')) {
            msg = 'Check your email and confirm your account, then try again. Or in Supabase turn off "Confirm email" (Authentication → Providers → Email).';
          } else if (raw.includes('invalid login credentials') || raw.includes('invalid credentials')) {
            msg = 'Wrong email or password, or email not confirmed. Sign up first, then sign in. If you just signed up, confirm your email (or turn off "Confirm email" in Supabase). Try the Legacy anon key (Settings → API → Legacy API Keys) in .env if this keeps happening.';
          }
          setError(msg);
          return;
        }
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">YunoBall</h1>
        <p className="text-slate-400 text-center text-sm">
          {configured
            ? 'Create an account (username, email, password) to play.'
            : 'To create an account, add your Supabase URL and anon key to the .env file. See SETUP.md.'}
        </p>
        {configured && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your display name"
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                autoComplete="username"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-amber-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        )}
        {configured && (
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}
            className="w-full text-slate-400 hover:text-white text-sm mt-2"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        )}
      </div>
    </div>
  );
}
