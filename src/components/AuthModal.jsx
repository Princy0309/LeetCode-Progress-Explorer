import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = [
  '#ff5722', '#ff9800', '#ffc107', '#00e676',
  '#00bcd4', '#6c8cff', '#e91e63', '#9c27b0',
  '#795548', '#607d8b',
];

function Avatar({ displayName, color, size = 38 }) {
  const initials = (displayName || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="auth-avatar"
      style={{
        width: size, height: size,
        background: color,
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export { Avatar };

export default function AuthModal({ onClose }) {
  const { signUp, signIn, profiles } = useAuth();
  const [tab, setTab]           = useState('signin'); // 'signin' | 'signup'
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const inputRef                = useRef(null);

  // Auto-focus first input when modal opens
  useEffect(() => { inputRef.current?.focus(); }, [tab]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const existingUsernames = Object.keys(profiles);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (tab === 'signup') {
        signUp(username, avatarColor, displayName);
        setSuccess('Profile created! Welcome 🎉');
        setTimeout(onClose, 900);
      } else {
        signIn(username);
        setSuccess('Welcome back!');
        setTimeout(onClose, 600);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const previewName = displayName.trim() || username.trim() || 'You';

  return (
    <>
      {/* Backdrop */}
      <div className="auth-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="auth-modal card shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={tab === 'signup' ? 'Create profile' : 'Sign in'}
      >
        {/* Header */}
        <div className="auth-modal-header">
          <span className="auth-modal-logo">🏆</span>
          <h4 className="mb-0 fw-bold">Lead-your-leet!</h4>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tab strip */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setError(''); setUsername(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); setUsername(''); setDisplayName(''); }}
          >
            Create Profile
          </button>
        </div>

        {/* Body */}
        <form className="auth-modal-body" onSubmit={handleSubmit} noValidate>

          {/* Sign-in: show existing profiles as quick-select */}
          {tab === 'signin' && existingUsernames.length > 0 && (
            <div className="mb-3">
              <label className="form-label text-muted small">Choose a profile</label>
              <div className="auth-profile-list">
                {existingUsernames.map(u => {
                  const p = profiles[u];
                  return (
                    <button
                      key={u}
                      type="button"
                      className={`auth-profile-chip ${username === u ? 'selected' : ''}`}
                      onClick={() => setUsername(u)}
                    >
                      <Avatar displayName={p.displayName} color={p.avatarColor} size={30} />
                      <span>{p.displayName}</span>
                    </button>
                  );
                })}
              </div>
              <div className="auth-divider">or type username</div>
            </div>
          )}

          {/* Username field */}
          <div className="mb-3">
            <label className="form-label small fw-semibold" htmlFor="auth-username">
              {tab === 'signup' ? 'Username (unique ID)' : 'Username'}
            </label>
            <input
              ref={inputRef}
              id="auth-username"
              type="text"
              className="form-control"
              placeholder={tab === 'signup' ? 'e.g. leetcoder42' : 'Your username'}
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoComplete="off"
              required
            />
          </div>

          {/* Sign-up extras */}
          {tab === 'signup' && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor="auth-displayname">
                  Display Name <span className="text-muted fw-normal">(optional)</span>
                </label>
                <input
                  id="auth-displayname"
                  type="text"
                  className="form-control"
                  placeholder="How should we call you?"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Avatar colour picker */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Avatar Colour</label>
                <div className="auth-color-grid">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`auth-color-swatch ${avatarColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setAvatarColor(c)}
                      aria-label={`Pick colour ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* Live avatar preview */}
              <div className="auth-preview mb-3">
                <Avatar displayName={previewName} color={avatarColor} size={48} />
                <span className="auth-preview-name">{previewName}</span>
              </div>
            </>
          )}

          {/* Feedback */}
          {error   && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
          {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}

          {/* Submit */}
          <button
            type="submit"
            className="btn fire-btn w-100 rounded-pill fw-bold"
            disabled={!username.trim()}
          >
            {tab === 'signup' ? '🚀 Create Profile' : '→ Sign In'}
          </button>

          {tab === 'signin' && existingUsernames.length === 0 && (
            <p className="text-center text-muted small mt-3 mb-0">
              No profiles yet.{' '}
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setTab('signup')}>
                Create one →
              </button>
            </p>
          )}
        </form>
      </div>
    </>
  );
}
