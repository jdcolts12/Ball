import { supabase } from '../lib/supabase';
import type { UserPublicProfile } from '../types/database';

export async function getUserPublicProfile(userId: string): Promise<{
  profile: UserPublicProfile | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_user_public_profile', {
    target_user_id: userId,
  });
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { profile: null, error: null };
    const bg = row.profile_bg_color as string | null;
    return {
      profile: {
        user_id: row.user_id,
        username: row.username ?? null,
        avatar_url: row.avatar_url ?? null,
        profile_bg_color: bg ?? 'green',
        career_pct: Number(row.career_pct ?? 0),
        total_correct: Number(row.total_correct ?? 0),
        total_questions: Number(row.total_questions ?? 0),
        total_games: Number(row.total_games ?? 0),
        total_perfect_games: Number(row.total_perfect_games ?? 0),
        consecutive_days_played: Number(row.consecutive_days_played ?? 0),
        best_perfect_streak: Number(row.best_perfect_streak ?? 0),
      },
      error: null,
    };
  }
  // Fallback when RPC missing or permission denied: fetch profile row only (no stats)
  const needFallback =
    error.message.includes('does not exist') ||
    error.message.includes('permission denied') ||
    error.message.includes('undefined');
  if (needFallback) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .maybeSingle();
    if (!profileError && profileData) {
      const row = profileData as { id: string; username: string | null; avatar_url?: string | null };
      return {
        profile: {
          user_id: row.id,
          username: row.username ?? null,
          avatar_url: row.avatar_url ?? null,
          profile_bg_color: (row as { profile_bg_color?: string }).profile_bg_color ?? 'green',
          career_pct: 0,
          total_correct: 0,
          total_questions: 0,
          total_games: 0,
          total_perfect_games: 0,
          consecutive_days_played: 0,
          best_perfect_streak: 0,
        },
        error: null,
      };
    }
  }
  return { profile: null, error: new Error(error.message) };
}

export async function updateMyProfile(updates: {
  username?: string;
  avatar_url?: string | null;
  profile_bg_color?: string | null;
}): Promise<{ error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
  if (updates.profile_bg_color !== undefined) payload.profile_bg_color = updates.profile_bg_color;
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id);
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB

/** Upload a profile picture from camera roll / file picker; updates profile.avatar_url. */
export async function uploadAvatar(file: File): Promise<{
  url: string | null;
  error: Error | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: null, error: new Error('Not authenticated') };
  if (file.size > AVATAR_MAX_BYTES) {
    return { url: null, error: new Error('Image must be under 2MB') };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  if (!['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(ext)) {
    return { url: null, error: new Error('Use a JPEG, PNG, GIF, or WebP image') };
  }
  const path = `${user.id}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { url: null, error: new Error(uploadError.message) };
  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  let url = urlData?.publicUrl ?? null;
  if (!url) return { url: null, error: new Error('Could not get image URL') };
  url = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
  const updateRes = await updateMyProfile({ avatar_url: url });
  if (updateRes.error) return { url, error: updateRes.error };
  return { url, error: null };
}
