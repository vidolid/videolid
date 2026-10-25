// src/pages/LegalLayout.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Legal.css";

/**
 * Shared layout for Terms and Privacy pages.
 * sections: [{ id, title, content: ReactNode }]
 */
const LegalLayout = ({ title, updated, intro, sections }) => (
  <>
    <header className="vl-dark vl-legal-hero">
      <svg className="vl-squiggle vl-squiggle--yellow" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d="M20 100C20 60 50 70 50 40S80 10 100 20" stroke="#ffe933" strokeWidth="22" strokeLinecap="round" />
      </svg>
      <svg className="vl-squiggle vl-squiggle--green" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d="M15 30C45 10 50 50 70 60S100 90 105 105" stroke="#18a66b" strokeWidth="22" strokeLinecap="round" />
      </svg>
      <div className="vl-dark__inner">
        <h1>{title}</h1>
        <p className="vl-dark__sub">{intro}</p>
        <p className="vl-legal-hero__date">Last updated: {updated}</p>
      </div>
    </header>

    <div className="vl-legal">
      <nav className="vl-legal__toc" aria-label="On this page">
        <h2>On this page</h2>
        <ol>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="vl-legal__body">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id}>
            <h2>
              {i + 1}. {s.title}
            </h2>
            {s.content}
          </section>
        ))}

        <div className="vl-legal__cta">
          <p>Questions about this page? Email us at <a href="mailto:support@videolid.com">support@videolid.com</a>.</p>
          <Link to="/tools" className="vl-btn vl-btn--ink">
            Browse all tools
          </Link>
        </div>
      </article>
    </div>
  </>
);

export default LegalLayout;