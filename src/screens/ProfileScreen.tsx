import { useState, useEffect, useCallback } from 'react';
import { getUserPublicProfile, updateMyProfile, uploadAvatar } from '../services/profile';
import { getFriendshipStatus, sendFriendRequest, acceptFriendRequest, getMyFriendIds, getPendingFriendRequestIds } from '../services/friends';
import { updateUsername } from '../services/auth';
import { getCareerPercentageBadges, getStreakBadge } from '../lib/badges';
import type { UserPublicProfile, ProfileBgColor } from '../types/database';
import type { FriendshipStatus } from '../types/database';
import type { BadgeId } from '../lib/badges';

const PROFILE_BG_COLORS: ProfileBgColor[] = ['blue', 'green', 'yellow', 'red', 'black', 'purple', 'orange', 'pink'];

const PROFILE_BG_CLASSES: Record<string, string> = {
  blue: 'from-blue-900 via-blue-800 to-blue-900',
  green: 'from-green-900 via-green-800 to-green-900',
  yellow: 'from-amber-800 via-amber-700 to-amber-800',
  red: 'from-red-900 via-red-800 to-red-900',
  black: 'from-gray-900 via-gray-800 to-gray-900',
  purple: 'from-purple-900 via-purple-800 to-purple-900',
  orange: 'from-orange-900 via-orange-800 to-orange-900',
  pink: 'from-pink-900 via-pink-800 to-pink-900',
};

function getProfileBgClass(color: string | null | undefined): string {
  return PROFILE_BG_CLASSES[color ?? 'green'] ?? PROFILE_BG_CLASSES.green;
}

interface ProfileScreenProps {
  userId: string;
  currentUserId: string;
  onBack: () => void;
  /** When viewing own profile, open another user's profile (e.g. from friends list). */
  onOpenProfile?: (userId: string) => void;
}

export function ProfileScreen({ userId, currentUserId, onBack, onOpenProfile }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [friendship, setFriendship] = useState<FriendshipStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editProfileBgColor, setEditProfileBgColor] = useState<string>('green');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [photoUpdated, setPhotoUpdated] = useState(false);
  /** Own profile: Friends / Requests tab */
  const [friendsTab, setFriendsTab] = useState<'friends' | 'requests'>('friends');
  const [friendProfiles, setFriendProfiles] = useState<UserPublicProfile[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<UserPublicProfile[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

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
        setEditProfileBgColor(profileRes.profile.profile_bg_color ?? 'green');
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

  const loadFriendsAndRequests = useCallback(async () => {
    if (!isOwnProfile) return;
    setFriendsLoading(true);
    const [friendsRes, pendingRes] = await Promise.all([
      getMyFriendIds(),
      getPendingFriendRequestIds(),
    ]);
    const friendIds = friendsRes.error ? [] : friendsRes.friendIds;
    const pendingIds = pendingRes.error ? [] : pendingRes.pendingFromIds;
    const [friendProfs, pendingProfs] = await Promise.all([
      Promise.all(friendIds.map((id) => getUserPublicProfile(id))).then((arr) =>
        arr.map((r) => r.profile).filter(Boolean) as UserPublicProfile[],
      ),
      Promise.all(pendingIds.map((id) => getUserPublicProfile(id))).then((arr) =>
        arr.map((r) => r.profile).filter(Boolean) as UserPublicProfile[],
      ),
    ]);
    setFriendProfiles(friendProfs);
    setPendingProfiles(pendingProfs);
    setFriendsLoading(false);
  }, [isOwnProfile]);

  useEffect(() => {
    loadFriendsAndRequests();
  }, [loadFriendsAndRequests]);

  const handleSendRequest = async () => {
    setActionBusy(true);
    setActionError(null);
    const res = await sendFriendRequest(userId);
    if (res.ok) {
      setFriendship(res.accepted ? 'friends' : 'pending_sent');
      // Refetch from server so UI is in sync
      const { status } = await getFriendshipStatus(userId);
      if (status) setFriendship(status);
    } else {
      setActionError(res.error ?? 'Failed');
    }
    setActionBusy(false);
  };

  const handleAccept = async (acceptUserId?: string) => {
    const uid = acceptUserId ?? userId;
    setActionBusy(true);
    setActionError(null);
    const res = await acceptFriendRequest(uid);
    if (res.ok) {
      setFriendship('friends');
      const { status } = await getFriendshipStatus(uid);
      if (status) setFriendship(status);
      if (isOwnProfile) await loadFriendsAndRequests();
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
      profile_bg_color: editProfileBgColor || 'green',
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
              profile_bg_color: editProfileBgColor || 'green',
            }
          : null
      );
      // Refetch from DB so profile_bg_color persists and is in sync
      getUserPublicProfile(userId).then((res) => {
        if (res.profile) setProfile(res.profile);
      });
    }
    setActionBusy(false);
  };

  const effectiveBg = editing ? editProfileBgColor : (profile?.profile_bg_color ?? 'green');
  const bgClass = getProfileBgClass(profile ? effectiveBg : 'green');

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${bgClass} text-white flex flex-col items-center justify-center p-6`}>
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
      <div className={`min-h-screen bg-gradient-to-b ${bgClass} text-white flex flex-col p-6`}>
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
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} text-white flex flex-col p-6 relative overflow-hidden`}>
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
              <p className="text-sm text-white/80 mb-1">Background color</p>
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {PROFILE_BG_COLORS.map((c) => {
                  const hex: Record<string, string> = {
                    blue: '#1e3a8a',
                    green: '#14532d',
                    yellow: '#92400e',
                    red: '#7f1d1d',
                    black: '#1f2937',
                    purple: '#581c87',
                    orange: '#7c2d12',
                    pink: '#831843',
                  };
                  return (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => setEditProfileBgColor(c)}
                      className={`w-8 h-8 rounded-full border-2 shrink-0 ${
                        editProfileBgColor === c ? 'border-white ring-2 ring-white/50' : 'border-white/40 hover:border-white/60'
                      }`}
                      style={{ backgroundColor: hex[c] ?? '#14532d' }}
                    />
                  );
                })}
              </div>
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
                  onClick={() => handleAccept()}
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
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-white/90 uppercase tracking-wide mb-4">Stats</h3>
          <div className="grid grid-cols-1 gap-1 text-base">
            <div className="flex justify-between items-center py-2.5 border-b border-white/10">
              <span className="text-white/80">Games played</span>
              <span className="font-bold text-white tabular-nums">{profile.total_games}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-white/10">
              <span className="text-white/80" title="Consecutive days played in a row (resets if you miss a day). Uses Pacific time.">
                Game streak
              </span>
              <span className="font-bold text-white tabular-nums">{profile.consecutive_days_played}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-white/10">
              <span className="text-white/80">Career %</span>
              <span className="font-bold text-white tabular-nums">{Math.round(profile.career_pct)}%</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-white/10">
              <span className="text-white/80" title="Number of games where you got every question correct (100% in one round).">
                Total perfect games
              </span>
              <span className="font-bold text-white tabular-nums">{profile.total_perfect_games ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 gap-4">
              <span className="text-white/80 text-sm max-w-[8.5rem] leading-tight" title="Best consecutive days with a perfect game (100% in one round).">
                Best perfect game streak
              </span>
              <span className="font-bold text-white tabular-nums shrink-0">{profile.best_perfect_streak}</span>
            </div>
          </div>
        </div>

        {/* Friends / Requests (own profile only) */}
        {isOwnProfile && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 overflow-hidden">
            <div className="flex border-b border-white/20">
              <button
                type="button"
                onClick={() => setFriendsTab('friends')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition ${friendsTab === 'friends' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}`}
              >
                Friends
              </button>
              <button
                type="button"
                onClick={() => setFriendsTab('requests')}
                className={`relative flex-1 py-3 px-4 text-sm font-semibold transition ${friendsTab === 'requests' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}`}
              >
                Requests
                {pendingProfiles.length > 0 && (
                  <span className="absolute top-1.5 right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-yellow-400 text-green-900 text-xs font-bold flex items-center justify-center">
                    {pendingProfiles.length}
                  </span>
                )}
              </button>
            </div>
            <div className="p-3 min-h-[6rem]">
              {friendsLoading ? (
                <p className="text-white/70 text-sm text-center py-4">Loading…</p>
              ) : friendsTab === 'friends' ? (
                friendProfiles.length === 0 ? (
                  <p className="text-white/70 text-sm text-center py-4">No friends yet. Add people from the leaderboard.</p>
                ) : (
                  <ul className="space-y-2">
                    {friendProfiles.map((p) => (
                      <li key={p.user_id}>
                        <button
                          type="button"
                          onClick={() => onOpenProfile?.(p.user_id)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left"
                        >
                          <img
                            src={p.avatar_url || DEFAULT_AVATAR}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                          />
                          <span className="font-medium text-white truncate">{p.username || 'Player'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                pendingProfiles.length === 0 ? (
                  <p className="text-white/70 text-sm text-center py-4">No pending requests.</p>
                ) : (
                  <ul className="space-y-2">
                    {pendingProfiles.map((p) => (
                      <li key={p.user_id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white/5">
                        <button
                          type="button"
                          onClick={() => onOpenProfile?.(p.user_id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <img
                            src={p.avatar_url || DEFAULT_AVATAR}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shrink-0"
                          />
                          <span className="font-medium text-white truncate">{p.username || 'Player'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(p.user_id)}
                          disabled={actionBusy}
                          className="shrink-0 px-3 py-1.5 bg-yellow-400 text-green-900 font-bold rounded-lg text-sm disabled:opacity-50"
                        >
                          Accept
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        {(() => {
          const careerBadges = getCareerPercentageBadges(profile.total_correct, profile.total_questions);
          const streakBadge = getStreakBadge(profile.best_perfect_streak);
          const badges = [...careerBadges, ...(streakBadge ? [streakBadge] : [])];
          if (badges.length === 0) return null;
          const BADGE_EMOJIS: Record<BadgeId, string> = {
            perfect: '🏆',
            streak: '🔥',
            career70: '🏅',
            career80: '⭐',
            career90: '💎',
          };
          const BADGE_LABELS: Record<BadgeId, string> = {
            perfect: 'Perfect',
            streak: 'Streak',
            career70: '70%',
            career80: '80%',
            career90: '90%',
          };
          const BADGE_DESC: Record<BadgeId, string> = {
            perfect: 'Perfect game',
            streak: 'Perfect streak',
            career70: 'Solid accuracy',
            career80: 'Great accuracy',
            career90: 'Top accuracy',
          };
          const BADGE_WHY: Record<BadgeId, string> = {
            perfect: '100% in one game',
            streak: '2+ perfect days in a row',
            career70: '70%+ career correct',
            career80: '80%+ career correct',
            career90: '90%+ career correct',
          };
          return (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 p-5 sm:p-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wide mb-3">Badges</h3>
              <div className="flex flex-wrap gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="inline-flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 min-w-[5.5rem]"
                    title={`${BADGE_DESC[b.id as BadgeId] ?? b.label}: ${BADGE_WHY[b.id as BadgeId] ?? ''}`}
                  >
                    <span className="flex items-center gap-1 text-white font-bold text-sm">
                      <span>{BADGE_EMOJIS[b.id as BadgeId] ?? '🏅'}</span>
                      {b.id === 'streak' && b.streakCount != null && <span>x{b.streakCount}</span>}
                      <span>{BADGE_LABELS[b.id as BadgeId] ?? b.label}</span>
                    </span>
                    <span className="text-[10px] text-white/70 leading-tight text-center">
                      {BADGE_DESC[b.id as BadgeId] ?? ''}
                    </span>
                    <span className="text-[10px] text-white/50 leading-tight text-center border-t border-white/20 pt-1 mt-0.5">
                      {BADGE_WHY[b.id as BadgeId] ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
