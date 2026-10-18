// src/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupWithEmail, loginWithGoogle, onAuthChange } from "../firebase";
import {
  AuthLogo,
  PasswordInput,
  GoogleIcon,
  Spinner,
  BrandShapes,
} from "./authShared";
import "./AuthPages.css";

const perks = [
  "Full video editor in your browser",
  "80+ tools: convert, cut, compress",
  "AI subtitles, translation and transcription",
  "Up to 500MB free per file",
  "Files deleted after processing",
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0); // 0-4

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) navigate("/");
    });
    return unsub;
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "password") setStrength(getPasswordStrength(value));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(form.email, form.password, form.name.trim());
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

  const strengthMeta = [
    { label: "Too weak", color: "#e5484d" },
    { label: "Weak", color: "#ff8a1f" },
    { label: "Fair", color: "#e0a800" },
    { label: "Good", color: "#18a66b" },
    { label: "Strong", color: "#0f7f4f" },
  ][strength];

  return (
    <div className="auth-shell auth-shell--signup">
      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="auth-panel auth-panel--form">
        <div className="auth-form-wrapper">
          <AuthLogo />

          <div className="auth-form-header">
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-caption">
              Already have one?{" "}
              <Link to="/login" className="auth-link">
                Log in
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
            Sign up with Google
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
              <label className="auth-label" htmlFor="name">
                Full name
              </label>
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
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              {form.password.length > 0 && (
                <div className="auth-strength">
                  <div className="auth-strength__bars">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="auth-strength__bar"
                        style={{
                          backgroundColor:
                            i < strength ? strengthMeta.color : "#e6e2c4",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="auth-strength__label"
                    style={{ color: strengthMeta.color }}
                  >
                    {strengthMeta.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm">
                Confirm password
              </label>
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
              {loading ? <Spinner /> : "Create account"}
            </button>
          </form>

          <p className="auth-terms">
            By creating an account you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>

      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="auth-panel auth-panel--brand">
        <div className="auth-brand-body">
          <h2 className="auth-brand-headline">
            Everything you need to create.
          </h2>
          <p className="auth-brand-sub">Start free. No credit card required.</p>

          <ul className="auth-perks">
            {perks.map((text) => (
              <li key={text} className="auth-perk">
                <span className="auth-perk__icon" aria-hidden="true">
                  ✓
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <BrandShapes />
      </aside>
    </div>
  );
}

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

function getFriendlyError(code) {
  const map = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    "auth/popup-closed-by-user": "Sign-in cancelled.",
    "auth/operation-not-allowed":
      "Google sign-in is not enabled. Contact support.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
