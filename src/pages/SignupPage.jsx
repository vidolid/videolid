// src/pages/SignupPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupWithEmail, loginWithGoogle, onAuthChange } from '../firebase';
import './AuthPages.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0); // 0-4

  useEffect(() => {
    const unsub = onAuthChange(user => { if (user) navigate('/'); });
    return unsub;
  }, [navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'password') setStrength(getPasswordStrength(value));
  };

  const validate = () => {
    if (!form.name.trim())          return 'Please enter your name.';
    if (!form.email.trim())         return 'Please enter your email.';
    if (form.password.length < 8)   return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await signupWithEmail(form.email, form.password, form.name.trim());
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

  const strengthMeta = [
    { label: 'Too weak',  color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Good',      color: '#22c55e' },
    { label: 'Strong',    color: '#16a34a' },
  ][strength];

  return (
    <div className="auth-shell auth-shell--signup">
      {/* ── Left: form ──────────────────────────────────────────── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
           
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-caption">
              Already have one?{' '}
              <Link to="/login" className="auth-link">Log in</Link>
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
            Sign up with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="auth-input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

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
              <label className="auth-label" htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="auth-strength">
                  <div className="auth-strength__bars">
                    {[0,1,2,3].map(i => (
                      <div
                        key={i}
                        className="auth-strength__bar"
                        style={{
                          backgroundColor: i < strength ? strengthMeta.color : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                  <span className="auth-strength__label" style={{ color: strengthMeta.color }}>
                    {strengthMeta.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm">Confirm password</label>
              <PasswordInput
                id="confirm"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              {form.confirm.length > 0 && form.password !== form.confirm && (
                <span className="auth-field-hint auth-field-hint--error">
                  Passwords don't match
                </span>
              )}
              {form.confirm.length > 0 && form.password === form.confirm && (
                <span className="auth-field-hint auth-field-hint--ok">
                  ✓ Passwords match
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Create account'}
            </button>
          </form>

          <p className="auth-terms">
            By creating an account you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* ── Right: brand panel ──────────────────────────────────── */}
      <div className="auth-panel auth-panel--brand">
        <div className="auth-brand-body">
          <div className="auth-brand-tag">Free forever</div>
          <h2 className="auth-brand-headline">
            Everything<br />
            you need to<br />
            create.
          </h2>
          <p className="auth-brand-sub">
            Join 5 million creators. No credit card required to get started.
          </p>

          <ul className="auth-perks">
            {[
              ['🎬', 'Full video editor in your browser'],
              ['⚡', '80+ tools — convert, cut, compress'],
              ['🤖', 'AI subtitles, translation & transcription'],
              ['📦', 'Up to 500MB free per file'],
              ['🔒', 'Files deleted after processing'],
            ].map(([icon, text]) => (
              <li key={text} className="auth-perk">
                <span className="auth-perk__icon">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-deco auth-deco--1" />
        <div className="auth-deco auth-deco--2" />
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

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
      <button type="button" className="auth-eye" onClick={() => setShow(s => !s)} tabIndex={-1}>
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

const Spinner = () => <span className="auth-spinner" />;

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

function getFriendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/weak-password':        'Password is too weak. Use at least 8 characters.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/operation-not-allowed':'Google sign-in is not enabled. Contact support.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}