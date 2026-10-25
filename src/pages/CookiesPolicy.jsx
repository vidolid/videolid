// src/pages/CookiesPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";

const sections = [
  {
    id: "what",
    title: "What cookies are",
    content: (
      <p>
        Cookies are small text files that a website stores in your browser.
        Similar technologies, such as local storage and pixels, do the same kind
        of job. They help a site work, remember your choices, and understand how
        it's used. This page explains which ones Videolid uses. For how we
        handle personal data more generally, see our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "types",
    title: "Cookies we use",
    content: (
      <>
        <p>
          <strong>Essential.</strong> Needed for the site to load and function,
          such as keeping you signed in, remembering your language, and
          protecting against abuse. These can't be switched off.
        </p>
        <p>
          <strong>Analytics.</strong> Help us see which pages and tools are used
          and where things break, so we can improve them. [LIST YOUR ANALYTICS
          PROVIDER, e.g. Google Analytics, OR REMOVE IF NONE]
        </p>
        <p>
          <strong>Advertising.</strong> Set by Google AdSense and its partners
          to show ads, limit how often you see the same ad, and measure ad
          performance. These may be personalized based on your browsing.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "Third-party cookies",
    content: (
      <>
        <p>
          Some cookies come from services we use rather than from Videolid
          itself. Google, for example, uses advertising cookies to serve ads
          based on your visits to this and other sites. We don't control these
          cookies. Their use is governed by the provider's own policy:
        </p>
        <ul>
          <li>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Google uses advertising cookies
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "manage",
    title: "Managing your choices",
    content: (
      <>
        <p>You can control cookies in several ways:</p>
        <ul>
          <li>
            <strong>On our site:</strong> use the cookie banner or preferences
            link, where shown, to accept or decline non-essential cookies.
          </li>
          <li>
            <strong>In your browser:</strong> most browsers let you block or
            delete cookies in their settings. Blocking essential cookies may
            stop parts of Videolid from working.
          </li>
          <li>
            <strong>For ads:</strong> turn off personalized ads at{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>{" "}
            or opt out of interest-based ads at{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>
            .
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "duration",
    title: "How long cookies last",
    content: (
      <p>
        Session cookies are deleted when you close your browser. Persistent
        cookies stay for a set period, from a few days to up to two years
        depending on the cookie, unless you delete them sooner.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy when we add or remove services that use
        cookies. We'll change the "Last updated" date at the top of the page
        when we do.
      </p>
    ),
  },
];

const CookiesPolicy = () => (
  <LegalLayout
    title="Cookies Policy"
    updated="October 25, 2026"
    intro="Which cookies Videolid uses, why we use them, and how to turn them off."
    sections={sections}
  />
);

export default CookiesPolicy;
