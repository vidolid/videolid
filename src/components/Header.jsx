// src/components/Header.jsx
import React, { useState } from 'react';

const Header = ({ onLoginClick, onSignupClick }) => {
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toolsLinks = [
    { href: '/video-editor', text: 'Video editor', special: true },
    { href: '/compress-video', text: 'Compress video' },
    { href: '/add-subtitles-to-video', text: 'Add subtitles' },
    { href: '/video-translator', text: 'Video Translator' },
    { href: '/text-to-speech', text: 'Text to Speech' },
    { href: '/screen-recorder', text: 'Screen recorder' },
    { href: '/resize-video', text: 'Resize video' },
    { href: '/gif-maker', text: 'GIF maker' },
    { href: '/video-converter', text: 'Video Converter' }
  ];

  return (
    <>
      <div className="appHeader">
        {/* Desktop Header */}
        <div className="appHeader__desktop">
          <header className="appHeaderDesktop">
            {/* Logo */}
            <a href="/" aria-label="Main page" className="appHeaderDesktop__logo">
              <img
                src="/images/videolid-logo.svg"
                alt="Videolid Logo"
                width="114"
                height="32"
                className="appHeaderDesktop__logoImage appHeaderDesktop__logoImage--full"
              />
              <img
                src="/images/mobile-logo.svg"
                alt="Videolid Logo"
                width="32"
                height="32"
                className="appHeaderDesktop__logoImage appHeaderDesktop__logoImage--short"
              />
            </a>

            {/* Navigation */}
            <div className="appHeaderDesktop__navigation">
              <nav className="appHeaderNavigation">
                <ul className="appHeaderNavigation__list">
                  <li className="appHeaderNavigationLink appHeaderNavigationLink--isHiddenOnTables">
                    <a href="/video-editor" className="appHeaderNavigationLink__link">
                      <span className="appHeaderNavigationLink__text">Video editor</span>
                    </a>
                  </li>

                  {/* Tools Dropdown */}
                  <li 
                    className="appHeaderDropdown"
                    onMouseEnter={() => setShowToolsDropdown(true)}
                    onMouseLeave={() => setShowToolsDropdown(false)}
                  >
                    <div className="appHeaderDropdown__title">
                      <div className="appHeaderDropdown__titleText">Tools</div>
                      <div className="appHeaderDropdown__titleIcon">
                        <div className="appIcon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" fill="none">
                            <path d="M.75 5.496 6 .77l5.25 4.725-.658.732L6 2.097 1.409 6.229.75 5.496Z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {showToolsDropdown && (
                      <div className="appHeaderDropdown__popover">
                        <div className="appHeaderDropdown__popoverItems">
                          {toolsLinks.map((link, index) => (
                            <div 
                              key={index}
                              className={link.special ? 'appHeaderDropdown__popoverVideoEditorItem' : ''}
                            >
                              <a href={link.href} className="appHeaderDropdownLink">
                                <span className="appHeaderDropdownLink__text">{link.text}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                        <div className="appHeaderDropdown__popoverSpecialItem">
                          <a href="/tools" className="appHeaderDropdownLink">
                            <span className="appHeaderDropdownLink__text">All tools</span>
                            <span className="appHeaderDropdownLink__arrow appIcon">
                              <svg width="8px" height="12px" viewBox="0 0 8 12" className="arrow">
                                <path d="M1.5 11a.5.5 0 01-.354-.853L5.293 6 1.146 1.854a.5.5 0 01.707-.707l4.5 4.5a.5.5 0 010 .707l-4.5 4.5A.498.498 0 011.5 11z" />
                              </svg>
                            </span>
                          </a>
                        </div>
                      </div>
                    )}
                  </li>

                  <li className="appHeaderNavigationLink">
                    <a href="/resources" rel="noopener noreferrer" className="appHeaderNavigationLink__link">
                      <span className="appHeaderNavigationLink__text">Resources</span>
                    </a>
                  </li>

                  <li className="appHeaderNavigationLink">
                    <a href="/pricing" rel="noopener noreferrer" className="appHeaderNavigationLink__link">
                      <span className="appHeaderNavigationLink__text">Pricing</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Authentication Buttons */}
            <div className="appHeaderDesktop__authenticationButtons">
              <div className="appHeaderAuthentication">
                <div>
                  <button
                    className="appButton appButton--variantShaded"
                    style={{ padding: '0 20px' }}
                    onClick={onLoginClick}
                    data-utm="header"
                  >
                    Log in
                  </button>
                </div>
                <div>
                  <button
                    className="appButton appButton--variantAccent"
                    style={{ padding: '0 20px' }}
                    onClick={onSignupClick}
                    data-utm="header"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* Mobile Header */}
        <div className="appHeader__mobile">
          <div className="appHeaderMobile">
            <a href="/" className="appHeaderMobile__logo">
              <img
                src="/assets/images/Videolid-logo-full.svg"
                alt="Videolid Logo"
                width="114"
                height="32"
                className="appHeaderMobile__logoImage appHeaderMobile__logoImage--full"
              />
              <img
                src="/assets/images/Videolid-logo-short.svg"
                alt="Videolid Logo"
                width="32"
                height="32"
                className="appHeaderMobile__logoImage appHeaderMobile__logoImage--short"
              />
            </a>

            <div className="appHeaderMobile__siteMenuButton">
              <button 
                className="appHeaderMobileMenuButton"
                onClick={() => setShowMobileMenu(true)}
                aria-label="Open menu"
              >
                <div className="appIcon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2 5a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm0 7a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm1 6a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <MobileMenuOverlay 
          onClose={() => setShowMobileMenu(false)}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
          toolsLinks={toolsLinks}
        />
      )}
    </>
  );
};

const MobileMenuOverlay = ({ onClose, onLoginClick, onSignupClick, toolsLinks }) => {
  return (
    <div 
      className="app-overlay app-overlay--header-mobile-navigation" 
      style={{ display: 'block' }}
      onClick={onClose}
    >
      <div className="app-overlay__content">
        <div className="app-modal-layout app-modal-layout--variant-seamless">
          <div className="app-modal-layout__modal" style={{ width: '100%' }}>
            <div className="app-modal app-modal--variant-seamless" style={{ height: '100%' }}>
              <div 
                className="app-modal__content" 
                style={{ height: '100%' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="appHeaderMobileNavigation">
                  {/* Close Button */}
                  <div className="appHeaderMobileNavigation__closeButton">
                    <button 
                      className="appHeaderMobileCloseButton"
                      onClick={onClose}
                      aria-label="Close menu"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.60088 2.39981C3.26894 2.06786 2.73075 2.06786 2.3988 2.39981C2.06685 2.73175 2.06685 3.26994 2.3988 3.60189L6.79776 8.00085L2.3988 12.3998C2.06686 12.7318 2.06686 13.2699 2.3988 13.6019C2.73075 13.9338 3.26894 13.9338 3.60088 13.6019L7.99984 9.20293L12.3988 13.6019C12.7307 13.9338 13.2689 13.9338 13.6009 13.6019C13.9328 13.2699 13.9328 12.7318 13.6009 12.3998L9.20192 8.00085L13.6009 3.60189C13.9328 3.26994 13.9328 2.73175 13.6009 2.39981C13.2689 2.06786 12.7307 2.06786 12.3988 2.39981L7.99984 6.79877L3.60088 2.39981Z"
                          fill="#262628"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Auth Buttons */}
                  <div className="appHeaderMobileNavigation__authenticationRegister">
                    <button
                      className="appButtonModalLogin appButtonModalLogin--variantAccent"
                      onClick={() => {
                        onClose();
                        onSignupClick();
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                  <div className="appHeaderMobileNavigation__authenticationLogin">
                    <button
                      className="appButtonModalLogin appButtonModalLogin--variantShaded"
                      onClick={() => {
                        onClose();
                        onLoginClick();
                      }}
                    >
                      Log in
                    </button>
                  </div>

                  {/* Main Links */}
                  <div className="appHeaderMobileNavigation__nonToolsLinks">
                    <a href="/pricing" rel="noopener noreferrer" className="appHeaderMobileNavigationLink">
                      <span className="appHeaderMobileNavigationLink__text">Pricing</span>
                    </a>
                    <a href="/resources" rel="noopener noreferrer" className="appHeaderMobileNavigationLink">
                      <span className="appHeaderMobileNavigationLink__text">Resources</span>
                    </a>
                  </div>

                  {/* Tools Section */}
                  <div className="appHeaderMobileNavigation__tools">
                    <hr className="appHeaderMobileNavigation__hr" />
                    <div className="appHeaderMobileNavigation__toolsTitle">Tools</div>
                    <div className="appHeaderMobileNavigation__toolsLinks">
                      {toolsLinks.map((link, index) => (
                        <div 
                          key={index}
                          className={link.special ? 'appHeaderDropdown__popoverVideoEditorItem' : ''}
                        >
                          <a href={link.href} className="appHeaderMobileNavigationLink">
                            <span className="appHeaderMobileNavigationLink__text">{link.text}</span>
                          </a>
                        </div>
                      ))}

                      <a
                        href="/tools"
                        className="appHeaderMobileNavigationLink appHeaderMobileNavigationLink--isAllToolsLink"
                      >
                        <span className="appHeaderMobileNavigationLink__text">All tools</span>
                        <span className="appHeaderMobileNavigationLink__icon appIcon">
                          <svg width="8px" height="12px" viewBox="0 0 8 12" className="arrow">
                            <path d="M1.5 11a.5.5 0 01-.354-.853L5.293 6 1.146 1.854a.5.5 0 01.707-.707l4.5 4.5a.5.5 0 010 .707l-4.5 4.5A.498.498 0 011.5 11z" />
                          </svg>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;