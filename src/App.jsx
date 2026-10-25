// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Terms from "./pages/Terms";
import Policy from "./pages/Policy";
import CookiesPolicy from "./pages/CookiesPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Header from "./components/Header";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import InformationSection from "./components/InformationSection";
import Footer from "./components/Footer";
import ToolPage from "./pages/ToolPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PricingPage from "./pages/PricingPage";
// Keep this LAST so it wins over older global styles
import "./styles/vidolid-theme.css";

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

const Shell = () => {
  const { pathname } = useLocation();
  // Auth pages have their own full-screen layout: no Header/Footer
  const bare = pathname === "/login" || pathname === "/signup";

  return (
    <div className="app-wrapper">
      {!bare && <Header />}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Policy />} />
<Route path="/cookies-policy" element={<CookiesPolicy />} />
<Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/:toolSlug" element={<ToolPage />} />
          <Route path="*" element={<FourOhFour />} />
        </Routes>
      </main>

      {!bare && <Footer />}
    </div>
  );
};

const HomePage = () => (
  <>
    <Hero />
    <InformationSection />
    <FeatureCards />

    <section className="vl-stats">
      <div className="vl-stats__row">
        <div>
          <strong>500K+</strong>
          <span>Monthly users</span>
        </div>
        <div>
          <strong>300K+</strong>
          <span>Videos made</span>
        </div>
      </div>
    </section>
  </>
);

const FourOhFour = () => (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <h1>404: Page not found</h1>
    <Link to="/" className="vl-btn vl-btn--ink" style={{ marginTop: 16 }}>
      Back to home
    </Link>
  </div>
);

export default App;
