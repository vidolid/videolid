import React, { useState } from 'react';
const Footer = () => {
  return (
    <footer className="appFooter">
      <div className="appFooter__copyrights">© 2025 Videolid ltd. All rights reserved</div>
      <div className="appFooter__legalInfo">
        <nav className="appFooterNavigation">
          <ul className="appFooterNavigation__list">
            <li className="appFooterNavigationLink">
              <a href="/terms" rel="noopener noreferrer" className="appFooterNavigationLink__link">Terms</a>
            </li>
            <li className="appFooterNavigationLink">
              <a href="/privacy" rel="noopener noreferrer" className="appFooterNavigationLink__link">Privacy</a>
            </li>
            <li className="appFooterNavigationLink">
              <a href="/cookies-policy" rel="noopener noreferrer" className="appFooterNavigationLink__link">Cookies</a>
            </li>
            <li className="appFooterNavigationLink">
              <a href="/refund-policy" rel="noopener noreferrer" className="appFooterNavigationLink__link">Refund</a>
            </li>
            <li className="appFooterNavigationLink">
              <a href="https://help.Videolid.com/" rel="noopener" target="_blank" className="appFooterNavigationLink__link">Help</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="appFooter__languageSwitcher language">
        <div className="dropup">
          <button
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            data-display="static"
            className="appFooterLanguageSelect"
          >
            <span className="appFooterLanguageSelect__selectElement">English</span>
            <span className="appFooterLanguageSelect__arrow">
              <span className="appIcon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" fill="none">
                  <path d="M.75 5.496 6 .77l5.25 4.725-.658.732L6 2.097 1.409 6.229.75 5.496Z" />
                </svg>
              </span>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
export default Footer;