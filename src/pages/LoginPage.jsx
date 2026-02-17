// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle, onAuthChange, resetPassword } from '../firebase';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const unsub = onAuthChange(user => { if (user) navigate('/'); });
    return unsub;
  }, [navigate]);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async e => {
    e.preventDefault();
    setError('');
    try {
      await resetPassword(resetEmail || form.email);
      setResetSent(true);
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Left panel ──────────────────────────────────────────── */}
      <div className="auth-panel auth-panel--brand">
        <div className="auth-brand-body">
          <div className="auth-brand-tag">Welcome back</div>
          <h2 className="auth-brand-headline">
            Your creative<br />
            workspace<br />
            awaits.
          </h2>
          <p className="auth-brand-sub">
            5M+ creators use Videolid to edit, convert and publish videos — all in the browser.
          </p>

          <div className="auth-brand-stats">
            <div className="auth-stat">
              <span className="auth-stat__num">80+</span>
              <span className="auth-stat__label">Tools</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat__num">500MB</span>
              <span className="auth-stat__label">Free upload</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat__num">4K</span>
              <span className="auth-stat__label">Supported</span>
            </div>
          </div>
        </div>

        {/* decorative circles */}
        <div className="auth-deco auth-deco--1" />
        <div className="auth-deco auth-deco--2" />
      </div>

      {/* ── Right panel — form ───────────────────────────────────── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-wrapper">

          {!showReset ? (
            <>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Log in</h1>
                <p className="auth-form-caption">
                  Don't have an account?{' '}
                  <Link to="/signup" className="auth-link">Sign up free</Link>
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                className="auth-oauth-btn"
                onClick={handleGoogle}
                disabled={loading}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="auth-divider"><span>or</span></div>

              {/* Error */}
              {error && <div className="auth-error">{error}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label" htmlFor="password">Password</label>
                    <button
                      type="button"
                      className="auth-forgot"
                      onClick={() => setShowReset(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : 'Log in'}
                </button>
              </form>

              <p className="auth-terms">
                By continuing you agree to our{' '}
                <Link to="/terms">Terms</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </>
          ) : (
            /* ── Password reset flow ──────────────── */
            <div className="auth-reset">
              <button
                className="auth-back"
                onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
              >
                ← Back to login
              </button>
              <h2 className="auth-form-title">Reset password</h2>

              {resetSent ? (
                <div className="auth-success">
                  ✅ Check your inbox — we sent a reset link to <strong>{resetEmail || form.email}</strong>
                </div>
              ) : (
                <>
                  <p className="auth-form-caption" style={{ marginBottom: 24 }}>
                    Enter your email and we'll send you a reset link.
                  </p>
                  {error && <div className="auth-error">{error}</div>}
                  <form onSubmit={handleReset} className="auth-form">
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="reset-email">Email</label>
                      <input
                        id="reset-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={resetEmail || form.email}
                        onChange={e => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="auth-submit-btn">
                      Send reset link
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const PasswordInput = ({ id, name, value, onChange, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-password-wrap">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        className="auth-input auth-input--password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="auth-eye"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Spinner = () => (
  <span className="auth-spinner" />
);

// ── Error messages ────────────────────────────────────────────────────────────
function getFriendlyError(code) {
  const map = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Try again.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/too-many-requests':    'Too many attempts. Please wait a moment.',
    'auth/user-disabled':        'This account has been disabled.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/invalid-credential':   'Invalid email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}