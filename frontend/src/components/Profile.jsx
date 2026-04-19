import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  deleteAvatar,
} from '../api/profileApi';

// ── Avatar display (inline, no external dep) ─────────────────────────────────
function Avatar({ user, size = 'xl' }) {
  const sizes = {
    md: 'w-10 h-10 text-sm',
    xl: 'w-24 h-24 text-3xl',
    '2xl': 'w-32 h-32 text-4xl',
  };
  const cls = sizes[size] ?? sizes.xl;
  const initials = (user?.name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const url = user?.avatar ? `http://localhost:5000/uploads/${user.avatar}` : null;

  return url ? (
    <img
      src={url}
      alt={user?.name}
      className={`${cls} rounded-full object-cover ring-4 ring-white shadow-lg`}
    />
  ) : (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-violet-500 to-indigo-600 text-white ring-4 ring-white shadow-lg select-none`}
    >
      {initials}
    </div>
  );
}

// ── Shared alert ──────────────────────────────────────────────────────────────
function Alert({ type, msg, darkMode }) {
  if (!msg) return null;
  const styles =
    type === 'error'
      ? darkMode
        ? 'bg-red-900/20 border-red-700 text-red-400'
        : 'bg-red-50 border-red-200 text-red-700'
      : darkMode
      ? 'bg-emerald-900/20 border-emerald-700 text-emerald-400'
      : 'bg-emerald-50 border-emerald-200 text-emerald-700';
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm font-medium ${styles}`}>
      {msg}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, children, darkMode }) {
  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden transition-colors ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50/50'}`}>
        <h2 className={`text-base font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h2>
        {subtitle && <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, required, children, darkMode }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const getInputCls = (darkMode) =>
  darkMode
    ? 'w-full px-3.5 py-2.5 rounded-xl border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition placeholder-gray-500 bg-gray-700 text-gray-100'
    : 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition placeholder-gray-400 bg-white text-gray-900';

// ══════════════════════════════════════════════════════════════════════════════
export default function ProfileSettings() {
  const { user: authUser, login: authLogin, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // ── Dark mode state ──────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ── profile data ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── avatar upload ───────────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });
  const [isDragging, setIsDragging] = useState(false);

  // ── profile form ────────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', bio: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // ── password form ───────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [showPw, setShowPw] = useState({ cur: false, new: false, conf: false });

  // ── load profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setProfileForm({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          bio: res.data.bio || '',
        });
      } catch {
        // fallback to authUser
        if (authUser) {
          setProfile(authUser);
          setProfileForm({
            name: authUser.name || '',
            email: authUser.email || '',
            phone: authUser.phone || '',
            bio: authUser.bio || '',
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [authUser]);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const flashMsg = (setter, type, text, ms = 4000) => {
    setter({ type, text });
    setTimeout(() => setter({ type: '', text: '' }), ms);
  };

  // ── avatar handlers ───────────────────────────────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flashMsg(setAvatarMsg, 'error', 'Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      flashMsg(setAvatarMsg, 'error', 'Image must be under 5 MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarMsg({ type: '', text: '' });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await uploadAvatar(fd);
      const updated = { ...profile, avatar: res.data.avatar };
      setProfile(updated);
      authLogin({ token: localStorage.getItem('token'), user: updated });
      setAvatarFile(null);
      setAvatarPreview(null);
      flashMsg(setAvatarMsg, 'success', 'Avatar updated successfully!');
    } catch (err) {
      flashMsg(setAvatarMsg, 'error', err.response?.data?.message || 'Upload failed.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Remove your profile photo?')) return;
    setAvatarLoading(true);
    try {
      await deleteAvatar();
      const updated = { ...profile, avatar: null };
      setProfile(updated);
      authLogin({ token: localStorage.getItem('token'), user: updated });
      setAvatarPreview(null);
      setAvatarFile(null);
      flashMsg(setAvatarMsg, 'success', 'Photo removed.');
    } catch (err) {
      flashMsg(setAvatarMsg, 'error', err.response?.data?.message || 'Failed to remove photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // ── profile submit ────────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      flashMsg(setProfileMsg, 'error', 'Name and email are required.');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await updateProfile(profileForm);
      const updated = { ...profile, ...res.data.user };
      setProfile(updated);
      authLogin({ token: localStorage.getItem('token'), user: updated });
      flashMsg(setProfileMsg, 'success', 'Profile saved successfully!');
    } catch (err) {
      flashMsg(setProfileMsg, 'error', err.response?.data?.message || 'Update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── password submit ───────────────────────────────────────────────────────────
  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      flashMsg(setPwMsg, 'error', 'Please fill in all fields.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      flashMsg(setPwMsg, 'error', 'New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      flashMsg(setPwMsg, 'error', 'Password must be at least 6 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      flashMsg(setPwMsg, 'success', 'Password changed successfully!');
    } catch (err) {
      flashMsg(setPwMsg, 'error', err.response?.data?.message || 'Password update failed.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading profile…</p>
        </div>
      </div>
    );
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const currentAvatarUrl = avatarPreview
    ? null
    : profile?.avatar
    ? `http://localhost:5000/uploads/${profile.avatar}`
    : null;

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-violet-50/30'}`}>
      {/* ── Top nav ── */}
      <nav className={`sticky top-0 z-30 backdrop-blur-md border-b shadow-sm transition-colors ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 text-sm transition-colors font-medium ${darkMode ? 'text-gray-400 hover:text-violet-400' : 'text-gray-500 hover:text-violet-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>/</span>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Profile Settings</span>
          </div>

        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Hero header ── */}
        <div className={`relative rounded-3xl p-8 text-white overflow-hidden shadow-2xl transition-all ${darkMode ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 ring-1 ring-white/10' : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 ring-1 ring-white/20'}`}>
          {/* decorative blobs */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/40 shadow-lg"
                />
              ) : (
                <Avatar user={profile} size="xl" />
              )}
              {/* Camera badge */}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-50 transition-colors border-2 border-violet-200 group"
                title="Change photo"
              >
                <svg className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{profile?.name || 'Your Name'}</h1>
              <p className="text-sky-100 text-sm mt-0.5 truncate">{profile?.email}</p>
              {memberSince && (
                <p className="text-sky-200 text-xs mt-1">Member since {memberSince}</p>
              )}
              {profile?.bio && (
                <p className="text-sky-100 text-sm mt-2 line-clamp-2 italic">"{profile.bio}"</p>
              )}
            </div>
          </div>
        </div>

        {/* ── 2-column layout on large screens ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT col */}
          <div className="lg:col-span-1 space-y-6">

            {/* ── Avatar upload section ── */}
            <Section title="Profile Photo" subtitle="JPG, PNG, GIF or WebP · Max 5 MB" darkMode={darkMode}>
              <div className="space-y-4">
                <Alert type={avatarMsg.type} msg={avatarMsg.text} darkMode={darkMode} />

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all
                    ${isDragging ? (darkMode ? 'border-violet-400 bg-violet-900/30' : 'border-violet-400 bg-violet-50 scale-[1.01]') : (darkMode ? 'border-gray-600 hover:border-violet-500 hover:bg-violet-900/20' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/40')}`}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover shadow" />
                  ) : currentAvatarUrl ? (
                    <img src={currentAvatarUrl} alt="Current" className="w-20 h-20 rounded-full object-cover shadow" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 text-center">
                    {isDragging ? 'Drop it here!' : 'Click or drag & drop'}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={avatarLoading}
                      className="w-full py-2.5 px-4 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition"
                    >
                      {avatarLoading ? 'Uploading…' : '✓ Save Photo'}
                    </button>
                  )}
                  {avatarFile && (
                    <button
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                      className="w-full py-2 px-4 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  )}
                  {profile?.avatar && !avatarFile && (
                    <button
                      onClick={handleAvatarDelete}
                      disabled={avatarLoading}
                      className="w-full py-2 px-4 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 transition"
                    >
                      {avatarLoading ? 'Removing…' : 'Remove Photo'}
                    </button>
                  )}
                </div>
              </div>
            </Section>

            {/* ── Quick stats card ── */}
            <div className={`bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5 space-y-3 ${darkMode ? 'dark:bg-indigo-950/40 dark:border-indigo-900' : ''}`}>
              <p className={`text-xs font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-400'} uppercase tracking-wider`}>Account</p>
              <div className="space-y-2">
                {[
                  { label: 'Name', value: profile?.name },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                    <span className={`text-xs font-medium text-right break-all max-w-[60%] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT col */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Profile Info form ── */}
            <Section title="Personal Information" subtitle="Update your name, email, phone and bio" darkMode={darkMode}>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Alert type={profileMsg.type} msg={profileMsg.text} darkMode={darkMode} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required darkMode={darkMode}>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="John Doe"
                      className={getInputCls(darkMode)}
                      required
                    />
                  </Field>
                  <Field label="Email Address" required darkMode={darkMode}>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className={getInputCls(darkMode)}
                      required
                    />
                  </Field>
                </div>

                <Field label="Phone Number" darkMode={darkMode}>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={getInputCls(darkMode)}
                  />
                </Field>

                <Field label="Bio" darkMode={darkMode}>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us a little about yourself…"
                    rows={3}
                    maxLength={300}
                    className={`${getInputCls(darkMode)} resize-none`}
                  />
                  <p className={`text-xs mt-1 text-right ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{profileForm.bio.length}/300</p>
                </Field>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {profileLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Section>

            {/* ── Change Password form ── */}
            <Section title="Change Password" subtitle="Use a strong password you don't use elsewhere" darkMode={darkMode}>
              <form onSubmit={handlePwSubmit} className="space-y-4">
                <Alert type={pwMsg.type} msg={pwMsg.text} darkMode={darkMode} />

                {[
                  { key: 'cur', field: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                  { key: 'new', field: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
                  { key: 'conf', field: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                ].map(({ key, field, label, placeholder }) => (
                  <Field key={field} label={label} required darkMode={darkMode}>
                    <div className="relative">
                      <input
                        type={showPw[key] ? 'text' : 'password'}
                        value={pwForm[field]}
                        onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                        placeholder={placeholder}
                        className={`${getInputCls(darkMode)} pr-10`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                        tabIndex={-1}
                      >
                        {showPw[key] ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Field>
                ))}

                {/* Password strength hint */}
                {pwForm.newPassword && (
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => {
                      const len = pwForm.newPassword.length;
                      const score =
                        len >= 12 && /[A-Z]/.test(pwForm.newPassword) && /[0-9]/.test(pwForm.newPassword) && /[^a-zA-Z0-9]/.test(pwForm.newPassword)
                          ? 4
                          : len >= 10 && /[A-Z]/.test(pwForm.newPassword) && /[0-9]/.test(pwForm.newPassword)
                          ? 3
                          : len >= 8
                          ? 2
                          : len >= 6
                          ? 1
                          : 0;
                      const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
                      return (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score - 1] : (darkMode ? 'bg-gray-700' : 'bg-gray-100')}`}
                        />
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="px-6 py-2.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {pwLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating…
                      </>
                    ) : '🔒 Update Password'}
                  </button>
                </div>
              </form>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}