import { useState, useEffect, useCallback } from 'react';
import { getUserPublicProfile, updateMyProfile, uploadAvatar } from '../services/profile';
import { getFriendshipStatus, sendFriendRequest, acceptFriendRequest } from '../services/friends';
import { updateUsername } from '../services/auth';
import { getCareerPercentageBadges, getStreakBadge } from '../lib/badges';
import type { UserPublicProfile } from '../types/database';
import type { FriendshipStatus } from '../types/database';
import type { BadgeId } from '../lib/badges';

interface ProfileScreenProps {
  userId: string;
  currentUserId: string;
  onBack: () => void;
}

export function ProfileScreen({ userId, currentUserId, onBack }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [friendship, setFriendship] = useState<FriendshipStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);

  const isOwnProfile = userId === currentUserId;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [profileRes, statusRes] = await Promise.all([
      getUserPublicProfile(userId),
      isOwnProfile ? Promise.resolve({ status: null as FriendshipStatus, error: null }) : getFriendshipStatus(userId),
    ]);
    if (profileRes.error) {
      setError(profileRes.error.message);
      setProfile(null);
    } else {
      setProfile(profileRes.profile ?? null);
      if (profileRes.profile) {
        setEditAvatarUrl(profileRes.profile.avatar_url ?? '');
        setEditUsername(profileRes.profile.username ?? '');
      }
    }
    if (!isOwnProfile && statusRes.error) {
      setFriendship(null);
    } else if (!isOwnProfile) {
      setFriendship(statusRes.status ?? null);
    }
    setLoading(false);
  }, [userId, isOwnProfile]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSendRequest = async () => {
    setActionBusy(true);
    setActionError(null);
    const res = await sendFriendRequest(userId);
    if (res.ok) {
      setFriendship(res.accepted ? 'friends' : 'pending_sent');
    } else {
      setActionError(res.error ?? 'Failed');
    }
    setActionBusy(false);
  };

  const handleAccept = async () => {
    setActionBusy(true);
    setActionError(null);
    const res = await acceptFriendRequest(userId);
    if (res.ok) {
      setFriendship('friends');
    } else {
      setActionError(res.error ?? 'Failed');
    }
    setActionBusy(false);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;
    e.target.value = '';
    setUploadingAvatar(true);
    setActionError(null);
    setPhotoUpdated(false);
    const { url, error: uploadError } = await uploadAvatar(file);
    if (uploadError) {
      setActionError(uploadError.message);
    } else if (url) {
      setEditAvatarUrl(url);
      setProfile((p) => (p ? { ...p, avatar_url: url } : null));
      setPhotoUpdated(true);
      setTimeout(() => setPhotoUpdated(false), 3000);
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;
    setActionBusy(true);
    setActionError(null);
    const usernameErr = await updateUsername(currentUserId, editUsername.trim() || 'Anonymous');
    if (usernameErr.error) {
      setActionError(usernameErr.error.message);
      setActionBusy(false);
      return;
    }
    const avatarRes = await updateMyProfile({
      avatar_url: editAvatarUrl.trim() || null,
    });
    if (avatarRes.error) {
      setActionError(avatarRes.error.message);
    } else {
      setEditing(false);
      setProfile((p) =>
        p
          ? {
              ...p,
              username: editUsername.trim() || null,
              avatar_url: editAvatarUrl.trim() || null,
            }
          : null
      );
    }
    setActionBusy(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col items-center justify-center p-6">
        <p className="text-white/80">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    const isSetupError =
      error &&
      (error.includes('does not exist') ||
        error.includes('permission denied') ||
        error.includes('relation'));
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Profile</h1>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-lg text-sm font-semibold"
          >
            Back
          </button>
        </div>
        <p className="text-red-300 mb-2">{error ?? 'User not found.'}</p>
        {isSetupError && (
          <p className="text-white/70 text-sm">
            Run the SQL in <code className="bg-white/10 px-1 rounded">supabase/FIX_PROFILES_NOW.sql</code> in Supabase → SQL Editor to enable profiles.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 text-white flex flex-col p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.1) 49px, rgba(255,255,255,0.1) 50px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-white">Profile</h1>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-lg text-sm font-semibold"
          >
            Back
          </button>
        </div>

        {/* Avatar + username */}
        <div className="flex flex-col items-center mb-6">
          {editing ? (
            <>
              <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center mb-3 overflow-hidden">
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white/60">?</span>
                )}
              </div>
              {uploadingAvatar ? (
                <span className="mb-2 px-4 py-2 bg-white/20 border border-white/40 rounded-lg text-sm font-semibold text-white/80">
                  Uploading…
                </span>
              ) : (
                <label className="mb-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/40 rounded-lg text-sm font-semibold text-white cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  Change photo
                </label>
              )}
              {photoUpdated && (
                <p className="mb-2 text-sm text-green-300">Photo updated</p>
              )}
              <input
                type="text"
                placeholder="Username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 text-sm mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={actionBusy}
                  className="px-4 py-2 bg-white text-green-900 font-bold rounded-lg text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center mb-3 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white/60">?</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white truncate max-w-full">
                {profile.username || 'Anonymous'}
              </h2>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-2 text-sm text-white/80 hover:text-white underline"
                >
                  Edit profile
                </button>
              )}
            </>
          )}
        </div>

        {/* Friend actions (other user only) */}
        {!isOwnProfile && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="flex flex-wrap gap-2 justify-center">
              {friendship === null && (
                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={actionBusy}
                  className="px-4 py-2 bg-yellow-400 text-green-900 font-bold rounded-lg text-sm disabled:opacity-50"
                >
                  {actionBusy ? 'Sending…' : 'Add Friend'}
                </button>
              )}
              {friendship === 'pending_sent' && (
                <span className="px-4 py-2 bg-white/20 rounded-lg text-sm">Request sent</span>
              )}
              {friendship === 'pending_received' && (
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={actionBusy}
                  className="px-4 py-2 bg-yellow-400 text-green-900 font-bold rounded-lg text-sm disabled:opacity-50"
                >
                  {actionBusy ? 'Accepting…' : 'Accept request'}
                </button>
              )}
              {friendship === 'friends' && (
                <span className="px-4 py-2 bg-yellow-400/30 text-yellow-200 rounded-lg text-sm font-semibold">
                  Friends
                </span>
              )}
            </div>
            {actionError && (
              <p className="text-red-300 text-sm text-center max-w-xs">{actionError}</p>
            )}
            {actionError && (
              actionError.toLowerCase().includes('function') ||
              actionError.toLowerCase().includes('permission') ||
              actionError.toLowerCase().includes('does not exist')
            ) && (
              <p className="text-white/70 text-xs text-center max-w-xs">
                Run <code className="bg-white/10 px-1 rounded">FIX_PROFILES_NOW.sql</code> in Supabase → SQL Editor to enable friends.
              </p>
            )}
          </div>
        )}

        {isOwnProfile && actionError && (
          <p className="text-red-300 text-sm text-center mb-2">{actionError}</p>
        )}
        {actionError && (
          actionError.toLowerCase().includes('bucket') ||
          actionError.toLowerCase().includes('storage') ||
          actionError.toLowerCase().includes('object') ||
          actionError.toLowerCase().includes('policy') ||
          actionError.toLowerCase().includes('not found') ||
          actionError.toLowerCase().includes('resource')
        ) && (
          <p className="text-white/70 text-xs text-center mb-4">
            Run <code className="bg-white/10 px-1 rounded">RUN_AVATARS_STORAGE.sql</code> in Supabase → SQL Editor to enable photo uploads.
          </p>
        )}

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 p-4 space-y-3">
          <h3 className="text-sm font-bold text-white/90 uppercase tracking-wide">Stats</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Games played</span>
              <span className="font-bold text-white">{profile.total_games}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Game streak</span>
              <span className="font-bold text-white">{profile.consecutive_days_played}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Career %</span>
              <span className="font-bold text-white">{Math.round(profile.career_pct)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Best perfect streak</span>
              <span className="font-bold text-white">{profile.best_perfect_streak}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        {(() => {
          const careerBadges = getCareerPercentageBadges(profile.total_correct, profile.total_questions);
          const streakBadge = getStreakBadge(profile.best_perfect_streak);
          const badges = [...careerBadges, ...(streakBadge ? [streakBadge] : [])];
          if (badges.length === 0) return null;
          const BADGE_EMOJIS: Record<BadgeId, string> = {
            perfect: '🏆',
            streak: '🔥',
            career75: '🏅',
            career85: '⭐',
            career95: '💎',
          };
          const BADGE_LABELS: Record<BadgeId, string> = {
            perfect: 'Perfect',
            streak: 'Streak',
            career75: '75%',
            career85: '85%',
            career95: '95%',
          };
          return (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 p-4">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wide mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs font-bold"
                    title={b.label}
                  >
                    <span>{BADGE_EMOJIS[b.id as BadgeId] ?? '🏅'}</span>
                    {b.id === 'streak' && b.streakCount != null && <span>x{b.streakCount}</span>}
                    <span>{BADGE_LABELS[b.id as BadgeId] ?? b.label}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
