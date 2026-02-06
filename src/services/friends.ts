import { supabase } from '../lib/supabase';
import type { FriendshipStatus } from '../types/database';

export async function getMyFriendIds(): Promise<{ friendIds: string[]; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_my_friend_ids');
  if (error) return { friendIds: [], error: new Error(error.message) };
  const ids = (data ?? []) as string[];
  return { friendIds: ids.filter(Boolean), error: null };
}

export async function sendFriendRequest(toUserId: string): Promise<{
  ok: boolean;
  accepted?: boolean;
  error?: string;
}> {
  const { data, error } = await supabase.rpc('send_friend_request', {
    to_user_id: toUserId,
  });
  if (error) return { ok: false, error: error.message };
  const result = (data ?? {}) as { ok?: boolean; accepted?: boolean; error?: string };
  return {
    ok: result.ok === true,
    accepted: result.accepted,
    error: result.error,
  };
}

export async function acceptFriendRequest(fromUserId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { data, error } = await supabase.rpc('accept_friend_request', {
    from_user_id: fromUserId,
  });
  if (error) return { ok: false, error: error.message };
  const result = (data ?? {}) as { ok?: boolean; error?: string };
  return { ok: result.ok === true, error: result.error };
}

export async function getFriendshipStatus(otherUserId: string): Promise<{
  status: FriendshipStatus;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_friendship_status', {
    other_user_id: otherUserId,
  });
  if (error) return { status: null, error: new Error(error.message) };
  const s = data as string | null;
  return {
    status: (s === 'friends' || s === 'pending_sent' || s === 'pending_received' ? s : null) as FriendshipStatus,
    error: null,
  };
}
