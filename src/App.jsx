// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import ToolPage from './pages/ToolPage';
import Hero from './components/Hero';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PricingPage from './pages/PricingPage';
import { features, informationSections } from './data/features';
import { tools, searchTools } from './data/tools';
import Footer from './components/Footer';
function App() {
  const [showLoginModal, setShowLoginModal]   = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Auth & Pricing — no Header/Footer chrome */}
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/signup"  element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />
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
      <Hero />

      {/* Feature Cards */}
      <FeatureCardsSection features={features} />

      {/* Info Sections */}
      <InfoSections sections={informationSections} />

      {/* Tools Gallery */}
      <div className="full-width-box all-tools-section">
        <div className="pageToolsHero">
         
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
<Footer/>

// ─── 404 ─────────────────────────────────────────────────────────────────────
const FourOhFour = () => (
  <div style={{ textAlign:'center', padding:'80px 20px' }}>
    <h1>404 — Page Not Found</h1>
    <Link to="/" style={{ color:'#007bff' }}>← Back to Home</Link>
  </div>
);

export default App;