import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<{ error: Error | null; session: { user: unknown } | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  return {
    error: error ? new Error(error.message) : null,
    session: data?.session ?? null,
  };
}

export async function signIn(email: string, password: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? new Error(error.message) : null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getProfile(userId: string): Promise<{ profile: Profile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return { profile: null, error: new Error(error.message) };
  return { profile: data as Profile | null, error: null };
}

export async function updateUsername(userId: string, username: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ username, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}
