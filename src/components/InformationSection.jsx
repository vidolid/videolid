import React from "react";
import { Link } from "react-router-dom";

const InformationSection = () => (
  <section className="vl-dark">
    <svg
      className="vl-squiggle vl-squiggle--yellow"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 100C20 60 50 70 50 40S80 10 100 20"
        stroke="#ffe933"
        strokeWidth="22"
        strokeLinecap="round"
      />
    </svg>
    <svg
      className="vl-squiggle vl-squiggle--green"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 30C45 10 50 50 70 60S100 90 105 105"
        stroke="#18a66b"
        strokeWidth="22"
        strokeLinecap="round"
      />
    </svg>

    <div className="vl-dark__inner">
      <h2>From first draft to final video, 10x faster</h2>
      <p className="vl-dark__sub">
        Videolid streamlines your team's video creation process and centers it
        in one content home base. Automate tedious tasks with AI tools and
        templates, track project status, and give in-line feedback.
      </p>
      <Link to="/studio/editor" className="vl-btn vl-btn--yellow">
        Start creating faster
      </Link>

      <div className="vl-window">
        <div className="vl-window__bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <video
          src="https://cdn-useast1.kapwing.com/static/4Ss-hompagecollab1_1.mp4"
          poster="https://cdn-useast1.kapwing.com/static/pH--1poster.webp"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </div>
  </section>
);

export default InformationSection;
