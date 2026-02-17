// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import ToolPage from './pages/ToolPage';
import { features, informationSections } from './data/features';
import { tools, searchTools } from './data/tools';

function App() {
  const [showLoginModal, setShowLoginModal]   = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header
          onLoginClick={() => setShowLoginModal(true)}
          onSignupClick={() => setShowSignupModal(true)}
        />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Single dynamic route handles ALL 80+ tool pages */}
            <Route path="/:toolSlug" element={<ToolPage />} />
            <Route path="*" element={<FourOhFour />} />
          </Routes>
        </main>

        <Footer />

        {showLoginModal  && <LoginModal  onClose={() => setShowLoginModal(false)} />}
        {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
      </div>
    </BrowserRouter>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTools = searchQuery ? searchTools(searchQuery) : tools;

  return (
    <>
      {/* Hero */}
      <div className="full-width-box index-title">
        <div className="container">
          <nav className="tools-lists no-select">
            <ul style={{ margin: '20px' }}>
              {[
                ['video-editor', 'Video editor'],
                ['add-subtitles-to-video', 'Add subtitles'],
                ['compress-video', 'Compress'],
                ['resize-video', 'Resize'],
                ['cut-video', 'Cut'],
              ].map(([slug, label]) => (
                <li key={slug}>
                  <Link to={`/${slug}`} className="item">
                    <span>
                      <i className="icon">
                        <svg width="52px" height="52px" viewBox="0 0 52 52">
                          <path d="M21 33.171L33.397 26L21 18.829V33.171ZM37 13H15C12.243 13 10 15.243 10 18V34C10 36.757 12.243 39 15 39H37C39.757 39 42 36.757 42 34V18C42 15.243 39.757 13 37 13ZM40 34C40 35.654 38.654 37 37 37H15C13.346 37 12 35.654 12 34V18C12 16.346 13.346 15 15 15H37C38.654 15 40 16.346 40 18V34Z" />
                        </svg>
                      </i>
                      <span>{label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="Hero_hero__kXuIl">
            <div className="Hero_content___6Pbs">
              <div className="Hero_titleContainer__I5X5F">
                <div className="Hero_title__47F_l">
                  <h1 dir="ltr"><span>ONLINE VIDEO EDITOR</span></h1>
                </div>
              </div>
              <div className="Hero_ctaContainer__LIf1r">
                <Link className="Hero_cta__CM8UF" to="/video-editor">
                  Edit Video &rarr;
                </Link>
                <Link to="/video-editor" className="Hero_sample__yZLec">
                  or, try a sample
                </Link>
              </div>
            </div>
            <video autoPlay loop className="Hero_media__Iko0V" playsInline muted>
              <source src="/media/hero_image_template.mp4" />
            </video>
          </div>

          <div className="hero-wrapper">
            <div className="title text-center" style={{ color: '#014042' }}>
              <h1>Professional Editing, Simplified</h1>
              <h2>Transform your ideas into stunning visuals — no technical skills required.</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <FeatureCardsSection features={features} />

      {/* Info Sections */}
      <InfoSections sections={informationSections} />

      {/* Tools Gallery */}
      <div className="full-width-box all-tools-section">
        <div className="pageToolsHero">
          <h1 className="pageToolsHero__title">Videolid Tools</h1>
          <h2 className="pageToolsHero__subtitle">Easy-to-use online tools for creating media content</h2>
          <div className="pageToolsHero__searchInput">
            <div className="pageToolsSearchInput">
              <input
                className="pageToolsSearchInput__input"
                type="search"
                placeholder="Search tools"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="pageToolsGalleryLayout">
          {filteredTools.map(tool => (
            <Link
              key={tool.id}
              to={tool.href}
              className="pageToolsGalleryLink"
            >
              <span className="pageToolsGalleryLink__image">
                <div className="pageToolsGalleryLinkImage">
                  <img
                    className="pageToolsGalleryLinkImage__image"
                    src={tool.image}
                    alt={tool.title}
                    loading="lazy"
                  />
                </div>
              </span>
              <span className="pageToolsGalleryLink__title">{tool.title}</span>
              <span className="pageToolsGalleryLink__description">{tool.description}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="full-width-box index-stat">
        <div className="container">
          <div style={{ display:'flex', justifyContent:'center', gap:'80px', padding:'40px 0' }}>
            <div className="text-center">
              <h3 style={{ fontSize:'3rem', fontWeight:900 }}>5M+</h3>
              <p>Monthly users</p>
            </div>
            <div className="text-center">
              <h3 style={{ fontSize:'3rem', fontWeight:900 }}>304M+</h3>
              <p>Videos made</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Feature Cards ────────────────────────────────────────────────────────────
const FeatureCardsSection = ({ features }) => (
  <div className="full-width-box landing-video-examples">
    <div className="ContentCardCarousel_contentCardCarousel__47gKr">
      <div className="ContentCarousel_arrowContainer__Kpoy6">
        <div className="ContentCarousel_contentCarousel__fzJwI">
          <div className="ContentCarousel_content__k3qoc">
            {features.map(f => (
              <div key={f.id} className="ContentCard_contentCardLink__zSXjj ContentCardCarousel_card__clY7Y">
                <img src={f.image} className="ContentCard_media__CmXE2 ContentCardCarousel_cardMedia__ZZ1KG" alt={f.title} loading="lazy" />
                <div className="ContentCard_content__FPtx0">
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Info Sections ────────────────────────────────────────────────────────────
const InfoSections = ({ sections }) => (
  <div className="Home_informationSection__h7wjK">
    {sections.map(s => (
      <div key={s.id} className="Home_sectionWrapper__w3APZ">
        <div className="Home_sectionContainer__Q88yl">
          <div className="Home_sectionText__88fKk">
            <div className="Home_sectionHeader__FO0Eg">{s.title}</div>
            <div className="Home_sectionDescription__It37N">{s.description}</div>
            <Link to="/video-editor" className="TealButton_linkWrapper__BJivI">
              <div className="TealButton_tealButton__OLu72">{s.ctaText} →</div>
            </Link>
          </div>
          <div className="Home_sectionGraphicContainer__zrvYe">
            <video className="Home_sectionVideo__Zlz61" src={s.videoSrc} poster={s.videoPoster} autoPlay muted loop playsInline />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="appFooter">
    <div className="appFooter__copyrights">© 2025 Videolid ltd. All rights reserved</div>
    <nav className="appFooterNavigation">
      <ul className="appFooterNavigation__list">
        {[['terms','Terms'],['privacy','Privacy'],['cookies-policy','Cookies'],['refund-policy','Refund']].map(([href, label]) => (
          <li key={href} className="appFooterNavigationLink">
            <Link to={`/${href}`} className="appFooterNavigationLink__link">{label}</Link>
          </li>
        ))}
        <li className="appFooterNavigationLink">
          <a href="https://help.videolid.com" rel="noopener" target="_blank" className="appFooterNavigationLink__link">Help</a>
        </li>
      </ul>
    </nav>
  </footer>
);

// ─── Modals ───────────────────────────────────────────────────────────────────
const LoginModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="close-btn">×</button>
      <h2>Log In</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'20px' }}>
        <input className="tool-option__input" type="email" placeholder="Email" />
        <input className="tool-option__input" type="password" placeholder="Password" />
        <button className="tool-btn tool-btn--primary">Log In</button>
      </div>
    </div>
  </div>
);

const SignupModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="close-btn">×</button>
      <h2>Create Account</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'20px' }}>
        <input className="tool-option__input" type="text" placeholder="Full Name" />
        <input className="tool-option__input" type="email" placeholder="Email" />
        <input className="tool-option__input" type="password" placeholder="Password" />
        <button className="tool-btn tool-btn--primary">Sign Up</button>
      </div>
    </div>
  </div>
);

// ─── 404 ─────────────────────────────────────────────────────────────────────
const FourOhFour = () => (
  <div style={{ textAlign:'center', padding:'80px 20px' }}>
    <h1>404 — Page Not Found</h1>
    <Link to="/" style={{ color:'#007bff' }}>← Back to Home</Link>
  </div>
);

export default App;