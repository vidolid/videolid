// src/pages/Terms.jsx
import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";

const sections = [
  {
    id: "acceptance",
    title: "Accepting these terms",
    content: (
      <>
        <p>
          By using videolid.com ("Videolid", "we", "us"), you agree to these Terms of Service. If you don't
          agree, please don't use the site. If you use Videolid on behalf of a company, you confirm you're
          allowed to accept these terms for it.
        </p>
        <p>
          Our <Link to="/privacy">Privacy Policy</Link> explains how we handle your data and is part of
          these terms.
        </p>
      </>
    ),
  },
  {
    id: "service",
    title: "What Videolid provides",
    content: (
      <>
        <p>
          Videolid offers online tools for video, audio, and image work, including converting, compressing,
          trimming, adding subtitles, text to speech, and screen, webcam, and audio recording. Tools run in
          your browser and on our servers, and we may add, change, or remove tools at any time.
        </p>
        <p>
          We work to keep Videolid available, but we can't promise it will always be uninterrupted or
          error-free.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your files and content",
    content: (
      <>
        <p>
          You keep ownership of everything you upload, record, or type into Videolid ("Your Content"). You
          give us a limited license to store, process, and transmit it only so we can run the tool you chose
          and return the result to you.
        </p>
        <p>You confirm that you own Your Content or have permission to use it, and that it doesn't break the law or anyone's rights.</p>
        <p>
          Processed files are kept temporarily and then deleted automatically. See the{" "}
          <Link to="/privacy#retention">Privacy Policy</Link> for details. Download your results promptly;
          we can't recover files after they are deleted.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "What you can't do",
    content: (
      <>
        <p>You agree not to use Videolid to:</p>
        <ul>
          <li>Upload or create content that is illegal, abusive, hateful, or sexually exploits minors.</li>
          <li>Infringe copyright, trademarks, privacy, or other rights of others.</li>
          <li>Create deceptive media meant to impersonate or mislead people about who said or did something.</li>
          <li>Upload malware, or try to disrupt, probe, or gain unauthorized access to our systems.</li>
          <li>Scrape the site or send automated requests that place an unreasonable load on our servers.</li>
          <li>Resell or redistribute the service without our written permission.</li>
        </ul>
        <p>We may remove content or block access if we believe these rules have been broken.</p>
      </>
    ),
  },
  {
    id: "recording",
    title: "Recording tools",
    content: (
      <p>
        Our screen, webcam, presentation, and audio recorders use your browser's camera, microphone, and
        screen-sharing permissions, and only after you allow them. You are responsible for getting consent
        from anyone who appears or speaks in your recordings, and for following recording laws where you
        and they are located.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Our intellectual property",
    content: (
      <p>
        The Videolid name, logo, website design, and software belong to us or our licensors. These terms
        don't give you any rights to them beyond using the service as intended. Third-party music and sound
        effects offered in our tools are subject to their own license terms, which we'll show where they apply.
      </p>
    ),
  },
  {
    id: "ads",
    title: "Advertising and third-party services",
    content: (
      <p>
        Videolid is free to use and shows ads provided by third parties such as Google AdSense. We don't
        control those ads or the sites they link to, and we aren't responsible for them. Using third-party
        sites is at your own risk and subject to their terms.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimers",
    content: (
      <p>
        Videolid is provided "as is" and "as available," without warranties of any kind, whether express or
        implied. We don't guarantee that results will be accurate, that conversions will preserve every
        detail of your original file, or that the service will meet your specific needs. Keep a backup of
        anything important.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limit of liability",
    content: (
      <p>
        To the fullest extent the law allows, Videolid and its owners won't be liable for indirect,
        incidental, or consequential damages, or for lost data, profits, or revenue, arising from your use
        of the service. Where liability can't be excluded, it is limited to the amount you paid us in the
        past 12 months, which for free use is zero.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    content: (
      <p>
        You can stop using Videolid at any time. We may suspend or end access for anyone who breaks these
        terms or misuses the service. Sections that by their nature should survive, such as ownership,
        disclaimers, and liability limits, remain in effect after termination.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms from time to time. When we do, we'll change the "Last updated" date at
        the top of this page. Continuing to use Videolid after an update means you accept the new terms.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws of [YOUR COUNTRY/JURISDICTION], and any dispute will be handled
        by the courts there, unless your local consumer laws say otherwise.
      </p>
    ),
  },
];

const Terms = () => (
  <LegalLayout
    title="Terms of Service"
    updated="October 25, 2026"
    intro="The ground rules for using Videolid's online video, audio, and image tools."
    sections={sections}
  />
);

export default Terms;