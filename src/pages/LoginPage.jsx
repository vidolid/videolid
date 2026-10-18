// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginWithEmail,
  loginWithGoogle,
  onAuthChange,
  resetPassword,
} from "../firebase";
import {
  AuthLogo,
  PasswordInput,
  GoogleIcon,
  Spinner,
  BrandShapes,
} from "./authShared";
import "./AuthPages.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) navigate("/");
    });
    return unsub;
  }, [navigate]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await resetPassword(resetEmail || form.email);
      setResetSent(true);
    } catch (err) {
      setError(getFriendlyError(err.code));
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="auth-panel auth-panel--brand">
        <div className="auth-brand-body">
          <h2 className="auth-brand-headline">
            Your creative workspace awaits.
          </h2>
          <p className="auth-brand-sub">
            Creators use Videolid to edit, convert and publish videos, all in
            the browser.
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
        <BrandShapes />
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="auth-panel auth-panel--form">
        <div className="auth-form-wrapper">
          <AuthLogo />

          {!showReset ? (
            <>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Log in</h1>
                <p className="auth-form-caption">
                  Don't have an account?{" "}
                  <Link to="/signup" className="auth-link">
                    Sign up free
                  </Link>
                </p>
              </div>

              <button
                type="button"
                className="auth-oauth-btn"
                onClick={handleGoogle}
                disabled={loading}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Email
                  </label>
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
                    <label className="auth-label" htmlFor="password">
                      Password
                    </label>
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
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? <Spinner /> : "Log in"}
                </button>
              </form>

              <p className="auth-terms">
                By continuing you agree to our <Link to="/terms">Terms</Link>{" "}
                and <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </>
          ) : (
            <div className="auth-reset">
              <button
                type="button"
                className="auth-back"
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setError("");
                }}
              >
                ← Back to login
              </button>
              <h1 className="auth-form-title">Reset password</h1>

              {resetSent ? (
                <div className="auth-success" role="status">
                  Check your inbox. We sent a reset link to{" "}
                  <strong>{resetEmail || form.email}</strong>.
                </div>
              ) : (
                <>
                  <p className="auth-form-caption" style={{ marginBottom: 24 }}>
                    Enter your email and we'll send you a reset link.
                  </p>
                  {error && (
                    <div className="auth-error" role="alert">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleReset} className="auth-form">
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="reset-email">
                        Email
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={resetEmail || form.email}
                        onChange={(e) => setResetEmail(e.target.value)}
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
      </main>
    </div>
  );
}

function getFriendlyError(code) {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/popup-closed-by-user": "Sign-in cancelled.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
