import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    image: "/images/video-editor.png",
    title: "Add audio to video",
    description:
      "Improve videos with thousands of royalty-free songs and sound effects from Videolid's built-in music library. Mix, match, and layer tracks to craft dynamic and engaging content.",
  },
  {
    image: "/images/video-editor.png",
    title: "Text-based editor",
    description:
      "Save time with text-based editing. Use an auto-generated transcript to delete or trim video sections effortlessly by editing the text directly in the online video editor.",
  },
  {
    image: "/images/video-editor.png",
    title: "Video trimmer",
    description:
      "Quickly trim, split, and cut your content with a user-friendly editing timeline designed for frame-by-frame precision. Anyone can start for free.",
  },
];

const FeatureCards = () => (
  <section className="vl-features">
    <h2>Everything you need to edit, in one place</h2>
    <p className="vl-features__sub">
      Add music, edit from a transcript, and trim with precision.
    </p>

    <div className="vl-cards">
      {features.map((f) => (
        <article key={f.title} className="vl-card">
          <img src={f.image} alt={f.title} loading="lazy" />
          <div className="vl-card__body">
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </div>
        </article>
      ))}
    </div>

    <Link to="/signup" className="vl-btn vl-btn--ink">
      Sign up for free
    </Link>
  </section>
);

export default FeatureCards;
