import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';
import { getProfile } from '../services/auth';

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** True until first getSession() completes (avoids flashing login). */
  initializing: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { profile: p } = await getProfile(user.id);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (cancelled) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(({ profile: p }) => !cancelled && setProfile(p)).catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(({ profile: p }) => !cancelled && setProfile(p)).catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value: AuthState = {
    user,
    profile,
    loading,
    initializing,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
