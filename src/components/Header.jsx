// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const toolsLinks = [
  { href: "/video-editor", text: "Video editor", primary: true },
  { href: "/compress-video", text: "Compress video" },
  { href: "/add-subtitles-to-video", text: "Add subtitles" },
  { href: "/video-translator", text: "Video Translator" },
  { href: "/text-to-speech", text: "Text to Speech" },
  { href: "/screen-recorder", text: "Screen recorder" },
  { href: "/resize-video", text: "Resize video" },
  { href: "/gif-maker", text: "GIF maker" },
  { href: "/video-converter", text: "Video Converter" },
];

const Logo = () => (
  <Link to="/" aria-label="Videolid home" className="vl-header__logo">
    <img
      src="/images/videolid-logo.svg"
      alt="Videolid"
      width="114"
      height="32"
      className="is-full"
    />
    <img
      src="/images/mobile-logo.svg"
      alt="Videolid"
      width="32"
      height="32"
      className="is-short"
    />
  </Link>
);

const Header = () => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="vl-header">
      <div className="vl-header__bar">
        <Logo />

        <nav className="vl-nav" aria-label="Main">
          <ul className="vl-nav__list">
            <li className="vl-nav__item">
              <Link to="/video-editor" className="vl-nav__link">
                Video editor
              </Link>
            </li>

            <li
              className="vl-nav__item"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget))
                  setToolsOpen(false);
              }}
            >
              <button
                type="button"
                className="vl-nav__trigger"
                aria-expanded={toolsOpen}
                aria-haspopup="true"
                onClick={() => setToolsOpen((o) => !o)}
              >
                Tools
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M.75 5.496 6 .77l5.25 4.725-.658.732L6 2.097 1.409 6.229.75 5.496Z" />
                </svg>
              </button>
              {toolsOpen && (
                <div className="vl-menu">
                  {toolsLinks.map((l) => (
                    <Link
                      key={l.href}
                      to={l.href}
                      className={l.primary ? "is-primary" : undefined}
                      onClick={() => setToolsOpen(false)}
                    >
                      {l.text}
                    </Link>
                  ))}
                  <hr />
                  <Link to="/tools" onClick={() => setToolsOpen(false)}>
                    All tools
                  </Link>
                </div>
              )}
            </li>

            <li className="vl-nav__item">
              <Link to="/resources" className="vl-nav__link">
                Resources
              </Link>
            </li>
            <li className="vl-nav__item">
              <Link to="/pricing" className="vl-nav__link">
                Pricing
              </Link>
            </li>
          </ul>
        </nav>

        <div className="vl-header__auth">
          <Link to="/login" className="vl-nav__link">
            Log in
          </Link>
          <button
            type="button"
            className="vl-btn vl-btn--ink vl-btn--sm"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </div>

        <button
          type="button"
          className="vl-header__burger"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3 5h18a1 1 0 1 1 0 2H3a1 1 0 0 1 0-2Zm0 6h18a1 1 0 1 1 0 2H3a1 1 0 0 1 0-2Zm0 6h18a1 1 0 1 1 0 2H3a1 1 0 0 1 0-2Z" />
          </svg>
        </button>
      </div>

      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
    </header>
  );
};

const MobileDrawer = ({ onClose }) => (
  <div className="vl-drawer" role="dialog" aria-modal="true" aria-label="Menu">
    <div className="vl-drawer__top">
      <Logo />
      <button type="button" className="vl-drawer__close" onClick={onClose}>
        Close
      </button>
    </div>

    <div className="vl-drawer__auth">
      <Link to="/signup" className="vl-btn vl-btn--ink" onClick={onClose}>
        Sign up for free
      </Link>
      <Link to="/login" className="vl-btn vl-btn--ghost" onClick={onClose}>
        Log in
      </Link>
    </div>

    <Link to="/pricing" className="vl-drawer__link" onClick={onClose}>
      Pricing
    </Link>
    <Link to="/resources" className="vl-drawer__link" onClick={onClose}>
      Resources
    </Link>

    <div className="vl-drawer__title">Tools</div>
    {toolsLinks.map((l) => (
      <Link
        key={l.href}
        to={l.href}
        className="vl-drawer__link"
        onClick={onClose}
      >
        {l.text}
      </Link>
    ))}
    <Link to="/tools" className="vl-drawer__link" onClick={onClose}>
      All tools
    </Link>
  </div>
);

export default Header;
