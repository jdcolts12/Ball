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
          // Show user-friendly error messages
          const errorMsg = err.message.toLowerCase();
          if (errorMsg.includes('username') && (errorMsg.includes('taken') || errorMsg.includes('already'))) {
            setError('This username is already taken. Please choose a different username.');
          } else {
            setError(err.message);
          }
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
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Football field pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
        }}></div>
      </div>
      
      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight" style={{ 
            textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.1)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            YunoBall
          </h1>
          <div className="h-1 w-24 bg-white mx-auto mb-4 rounded-full"></div>
          <p className="text-white text-lg font-semibold mt-4 leading-relaxed">
            {configured
              ? 'Daily NFL trivia. 3 questions, one round per day. Test Your Ball Knowledge'
              : 'To create an account, add your Supabase URL and anon key to the .env file. See SETUP.md.'}
          </p>
        </div>
        {configured && (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your display name"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-white transition-all font-medium"
                autoComplete="username"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-white transition-all font-medium"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-white transition-all font-medium"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
          {error && <p className="text-red-300 text-sm font-semibold bg-red-900/30 p-2 rounded border border-red-500/50">{error}</p>}
          {message && <p className="text-yellow-200 text-sm font-semibold bg-yellow-900/30 p-2 rounded border border-yellow-500/50">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-green-900 hover:bg-yellow-400 disabled:opacity-50 font-black text-lg rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wide"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        )}
        {configured && (
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}
            className="w-full text-white/80 hover:text-white text-sm mt-2 font-semibold transition-colors underline decoration-white/30 hover:decoration-white"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        )}
      </div>
    </div>
  );
}
