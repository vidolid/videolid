import React from "react";
import { Link } from "react-router-dom";
import VideoExamples from "./VideoExamples";

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
};

const tools = [
  [
    "video-editor",
    "Video editor",
    <>
      <rect x="10" y="13" width="32" height="26" rx="3" {...stroke} />
      <path d="M21 19L33 26L21 33V19Z" {...stroke} />
    </>,
  ],
  [
    "add-subtitles-to-video",
    "Add subtitles",
    <>
      <rect x="10" y="13" width="32" height="26" rx="3" {...stroke} />
      <path d="M16 27H28M16 32H36M32 27H36" {...stroke} />
    </>,
  ],
  [
    "compress-video",
    "Compress",
    <path
      d="M19 19L12 12M19 19H13M19 19V13M33 19L40 12M33 19H39M33 19V13M19 33L12 40M19 33H13M19 33V39M33 33L40 40M33 33H39M33 33V39"
      {...stroke}
    />,
  ],
  [
    "resize-video",
    "Resize",
    <path
      d="M10 10H22M10 10V22M10 10L20 20M42 10H30M42 10V22M42 10L32 20M10 42H22M10 42V30M10 42L20 32M42 42H30M42 42V30M42 42L32 32"
      {...stroke}
    />,
  ],
  [
    "cut-video",
    "Cut",
    <>
      <circle cx="18" cy="18" r="5" {...stroke} />
      <circle cx="18" cy="34" r="5" {...stroke} />
      <path d="M22 21L38 12M22 29L38 40M12 26H28" {...stroke} />
    </>,
  ],
];

const SAMPLE_URL =
  "https://www.videolid.com/studio/editor?redirect_source=%2Fvideo-editor&tooltip=editor&sample=true&sample_type=default";

const Hero = () => (
  <>
    <section className="vl-hero">
      <span className="vl-blob vl-blob--sun" aria-hidden="true" />
      <span className="vl-blob vl-blob--pill" aria-hidden="true" />

      <div className="vl-hero__inner">
        <h1>Create better video, faster.</h1>
        <p className="vl-hero__sub">
          Edit, subtitle, compress and resize right in your browser. No
          technical skills required.
        </p>
        <div className="vl-hero__cta">
          <Link to="/video-editor" className="vl-btn vl-btn--ink" data-testid="get-started-button">
            Edit video
          </Link>
          <a href={SAMPLE_URL} className="vl-link">or, try a sample</a>
        </div>
        <div className="vl-hero__examples">
          <VideoExamples />
        </div>
      </div>
    </section>

    <nav className="vl-tools no-select" aria-label="Tools">
      <ul className="vl-tools__list">
        {tools.map(([slug, label, icon]) => (
          <li key={slug}>
            <Link to={`/${slug}`}>
              <svg viewBox="0 0 52 52" aria-hidden="true">{icon}</svg>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </>
);

export default Hero;