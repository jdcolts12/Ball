import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<{ error: Error | null; session: { user: unknown } | null }> {
  // Check if username is available before signing up
  const { available, error: checkError } = await checkUsernameAvailable(username.trim());
  
  if (checkError) {
    return { error: checkError, session: null };
  }
  
  if (!available) {
    return { error: new Error('This username is already taken. Please choose another.'), session: null };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username.trim() } },
  });
  
  if (error) {
    // Check if it's a uniqueness constraint violation (shouldn't happen after check, but handle just in case)
    if (error.message.includes('unique') || error.message.includes('duplicate') || error.message.includes('already exists')) {
      return { error: new Error('This username is already taken. Please choose another.'), session: null };
    }
    return { error: new Error(error.message), session: null };
  }
  
  return {
    error: null,
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

/**
 * Check if a username is available (not already taken by another user)
 * Uses a database RPC function that bypasses RLS for public access
 */
export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<{ available: boolean; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('check_username_available', {
      check_username: username.trim(),
      exclude_user_id: excludeUserId || null,
    });
    
    if (error) {
      return { available: false, error: new Error(error.message) };
    }
    
    // Function returns true if available, false if taken
    return { available: data === true, error: null };
  } catch (err) {
    return { available: false, error: err instanceof Error ? err : new Error('Failed to check username availability') };
  }
}

export async function updateUsername(userId: string, username: string): Promise<{ error: Error | null }> {
  // Check if username is available (excluding current user)
  const { available, error: checkError } = await checkUsernameAvailable(username, userId);
  
  if (checkError) {
    return { error: checkError };
  }
  
  if (!available) {
    return { error: new Error('This username is already taken. Please choose another.') };
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ username: username.trim(), updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) {
    // Check if it's a uniqueness constraint violation
    if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
      return { error: new Error('This username is already taken. Please choose another.') };
    }
    return { error: new Error(error.message) };
  }
  
  return { error: null };
}
