// src/pages/Policy.jsx
import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <p>
        This Privacy Policy explains what information Videolid ("we", "us")
        collects when you use videolid.com, how we use it, and the choices you
        have. By using the site you agree to this policy and our{" "}
        <Link to="/terms">Terms of Service</Link>.
      </p>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    content: (
      <>
        <p>
          <strong>Files and content you provide.</strong> Videos, audio, images,
          recordings, and text you upload or enter into a tool so we can process
          them.
        </p>
        <p>
          <strong>Usage and device data.</strong> Pages visited, tool used, file
          type and size, browser, device, approximate location (from IP
          address), and error logs.
        </p>
        <p>
          <strong>Cookies and similar technologies.</strong> Used to keep the
          site working, measure traffic, and show ads. See the Advertising and
          cookies section below.
        </p>
        <p>
          <strong>Messages you send us.</strong> If you email us, we keep your
          email address and message so we can reply.
        </p>
        <p>
          We don't ask you to create an account to use our tools. Recorders
          access your camera, microphone, or screen only after your browser asks
          for and receives your permission, and recordings stay in your browser
          until you choose to save or process them.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use information",
    content: (
      <ul>
        <li>To run the tool you selected and give you the result.</li>
        <li>To keep the service secure, prevent abuse, and fix problems.</li>
        <li>To understand which tools people use and improve them.</li>
        <li>To show advertising that keeps Videolid free.</li>
        <li>To respond to your messages and meet legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "retention",
    title: "How long we keep your files",
    content: (
      <>
        <p>
          Files you upload and the results we generate are stored temporarily so
          you can download them, and are then deleted automatically after [24
          HOURS — CONFIRM YOUR ACTUAL RETENTION PERIOD]. We don't look at the
          contents of your files except where needed to operate or protect the
          service, or if the law requires it.
        </p>
        <p>
          Logs and analytics data are kept for as long as needed for the
          purposes above, then deleted or anonymized.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share information with",
    content: (
      <>
        <p>
          We don't sell your files or personal information. We share data only
          with:
        </p>
        <ul>
          <li>
            <strong>Service providers</strong> that host and run Videolid, such
            as our cloud and CDN provider (Cloudflare), who process data on our
            behalf.
          </li>
          <li>
            <strong>Advertising and analytics partners</strong>, as described
            below.
          </li>
          <li>
            <strong>Authorities</strong> when required by law or to protect
            rights, safety, and security.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ads-cookies",
    title: "Advertising and cookies",
    content: (
      <>
        <p>
          We use Google AdSense to show ads. Google and its partners use cookies
          and similar technologies to serve ads based on your visits to this and
          other websites. Google's use of advertising cookies lets it and its
          partners serve ads to you based on your visit to Videolid and other
          sites.
        </p>
        <p>
          You can manage personalized advertising at{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>{" "}
          or learn more at{" "}
          <a
            href="https://www.aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>
          . You can also block or delete cookies in your browser settings,
          though some parts of the site may not work as well. Where required by
          law, we ask for your consent before using non-essential cookies.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>
        We use encrypted connections (HTTPS) and limit access to stored files.
        No method of transmission or storage is completely secure, so we can't
        guarantee absolute security. Please don't upload files containing highly
        sensitive information.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    content: (
      <>
        <p>
          Depending on where you live (for example, the EU/UK under GDPR or
          California under CCPA), you may have the right to access, correct,
          delete, or export your personal data, to object to or restrict certain
          processing, and to withdraw consent.
        </p>
        <p>
          To use these rights, email{" "}
          <a href="mailto:support@videolid.com">support@videolid.com</a>. We'll
          respond within the time required by law.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        Videolid isn't directed to children under 13 (or under 16 where local
        law sets that age). We don't knowingly collect their personal
        information. If you believe a child has given us data, contact us and
        we'll delete it.
      </p>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    content: (
      <p>
        Videolid uses servers in multiple countries, so your information may be
        processed outside the country where you live. We take steps to protect
        it wherever it is handled.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy occasionally. We'll change the "Last updated"
        date above, and for significant changes we'll make the update clear on
        the site.
      </p>
    ),
  },
];

const Policy = () => (
  <LegalLayout
    title="Privacy Policy"
    updated="October 25, 2026"
    intro="What we collect, why we collect it, and how you stay in control of your files and data."
    sections={sections}
  />
);

export default Policy;
