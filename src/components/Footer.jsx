import React from "react";
import { Link } from "react-router-dom";
const links = [
  { href: "/terms", text: "Terms" },
  { href: "/privacy", text: "Privacy" },
  { href: "/cookies-policy", text: "Cookies" },
  { href: "/refund-policy", text: "Refund" },
  { href: "https://help.Videolid.com/", text: "Help", external: true },
];

const Footer = () => (
  <footer className="vl-footer">
    <div className="vl-footer__inner">
      <div>© 2025 Videolid ltd. All rights reserved</div>

      <nav aria-label="Legal">
        <ul>
          {links.map((l) => (
            <li key={l.text}>
              {l.external ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.text}
                </a>
              ) : (
                <Link to={l.href}>{l.text}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="vl-footer__lang" aria-haspopup="true">
        English
      </button>
    </div>
  </footer>
);

export default Footer;
