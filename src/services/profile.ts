import { supabase } from '../lib/supabase';
import type { UserPublicProfile } from '../types/database';

export async function getUserPublicProfile(userId: string): Promise<{
  profile: UserPublicProfile | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_user_public_profile', {
    target_user_id: userId,
  });
  if (error) return { profile: null, error: new Error(error.message) };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { profile: null, error: null };
  return {
    profile: {
      user_id: row.user_id,
      username: row.username ?? null,
      avatar_url: row.avatar_url ?? null,
      career_pct: Number(row.career_pct ?? 0),
      total_correct: Number(row.total_correct ?? 0),
      total_questions: Number(row.total_questions ?? 0),
      consecutive_days_played: Number(row.consecutive_days_played ?? 0),
      best_perfect_streak: Number(row.best_perfect_streak ?? 0),
    },
    error: null,
  };
}

export async function updateMyProfile(updates: {
  username?: string;
  avatar_url?: string | null;
}): Promise<{ error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id);
  if (error) return { error: new Error(error.message) };
  return { error: null };
}
