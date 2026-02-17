// src/pages/PricingPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PricingPage.css';

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    badge:    null,
    monthly:  0,
    annual:   0,
    cta:      'Get started free',
    ctaLink:  '/signup',
    ctaStyle: 'outline',
    features: [
      '5 exports per day',
      'Up to 500MB per file',
      'Up to 5 min video length',
      'All 80+ tools',
      'Watermark on exports',
      'Standard processing speed',
      'Basic formats (MP4, MP3)',
    ],
    disabled: [
      'No watermark',
      'AI subtitles & translation',
      'Priority processing',
      '4K export',
    ],
  },
  {
    id:       'pro',
    name:     'Pro',
    badge:    'Most popular',
    monthly:  12,
    annual:   8,
    cta:      'Start Pro free',
    ctaLink:  '/signup?plan=pro',
    ctaStyle: 'primary',
    features: [
      'Unlimited exports',
      'Up to 4GB per file',
      'Up to 4 hours video length',
      'All 80+ tools',
      'No watermark',
      'AI subtitles & translation',
      'Priority processing speed',
      '4K export',
      'All formats',
      '30-day cloud storage',
    ],
    disabled: [
      'Team collaboration',
      'White-label exports',
    ],
  },
  {
    id:       'teams',
    name:     'Teams',
    badge:    null,
    monthly:  29,
    annual:   19,
    perSeat:  true,
    cta:      'Contact sales',
    ctaLink:  'mailto:sales@videolid.com',
    ctaStyle: 'outline',
    features: [
      'Everything in Pro',
      'Up to 10GB per file',
      'Team workspace & collaboration',
      'White-label exports',
      'Admin dashboard',
      'Priority support & SLA',
      'Custom integrations',
      'Shared brand assets',
      'API access',
      'Dedicated account manager',
    ],
    disabled: [],
  },
];

const FAQS = [
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancel anytime from your account settings. You keep Pro access until the end of your billing period — no questions asked.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Yes! Start with a 7-day free trial on Pro. No credit card required.',
  },
  {
    q: 'How does file size work on Free?',
    a: 'Free accounts can upload files up to 500MB. Each export also has a 5-minute cap on video length. Upgrade to Pro for up to 4GB and 4-hour videos.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for annual Teams plans.',
  },
  {
    q: 'Are my files private?',
    a: 'Yes. All files are encrypted in transit and at rest. Free-plan files are deleted after 24 hours; Pro files after 30 days. We never share your content.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day refund for annual plans if you\'re not satisfied. Monthly plans can be cancelled before the next cycle.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual]   = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="pricing-page">
    
      <header className="pricing-hero">
        <div className="pricing-hero__eyebrow">Pricing</div>
        <h1 className="pricing-hero__title">
          Simple,<br />
          transparent pricing.
        </h1>
        <p className="pricing-hero__sub">
          Start free. Upgrade when you need more power.
          <br />No hidden fees, no lock-in.
        </p>

        {/* Toggle */}
        <div className="pricing-toggle">
          <button
            className={`pricing-toggle__btn ${!annual ? 'pricing-toggle__btn--active' : ''}`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`pricing-toggle__btn ${annual ? 'pricing-toggle__btn--active' : ''}`}
            onClick={() => setAnnual(true)}
          >
            Annual
            <span className="pricing-toggle__badge">Save 33%</span>
          </button>
        </div>
      </header>

      {/* ── Plans grid ───────────────────────────────────────────── */}
      <section className="pricing-grid-section">
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              annual={annual}
              onCta={() => navigate(plan.ctaLink)}
            />
          ))}
        </div>

        <p className="pricing-note">
          All plans include a 7-day free trial. No credit card required.
        </p>
      </section>

      {/* ── Comparison table ─────────────────────────────────────── */}
      <section className="pricing-compare-section">
        <h2 className="pricing-section-title">Compare plans</h2>
        <CompareTable annual={annual} />
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="pricing-reviews-section">
        <h2 className="pricing-section-title">Loved by creators</h2>
        <div className="pricing-reviews">
          {[
            { name: 'Aisha M.', role: 'Content creator', text: 'Switched to Pro last month and it\'s a game-changer. No watermarks and AI subtitles work instantly.', avatar: 'A' },
            { name: 'Lucas R.', role: 'Freelance editor', text: 'The converter tools alone save me hours every week. 4GB uploads handle my RAW footage with no issues.', avatar: 'L' },
            { name: 'Priya S.', role: 'Marketing lead', text: 'We use Teams for our whole department. The shared workspace and white-label exports are exactly what we needed.', avatar: 'P' },
          ].map(review => (
            <div key={review.name} className="pricing-review">
              <div className="pricing-review__stars">★★★★★</div>
              <p className="pricing-review__text">"{review.text}"</p>
              <div className="pricing-review__author">
                <div className="pricing-review__avatar">{review.avatar}</div>
                <div>
                  <div className="pricing-review__name">{review.name}</div>
                  <div className="pricing-review__role">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="pricing-faq-section">
        <h2 className="pricing-section-title">Frequently asked questions</h2>
        <div className="pricing-faq">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className={`pricing-faq__item ${openFaq === i ? 'pricing-faq__item--open' : ''}`}
            >
              <button
                className="pricing-faq__q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className="pricing-faq__arrow">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <p className="pricing-faq__a">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="pricing-bottom-cta">
        <h2 className="pricing-bottom-cta__title">
          Ready to start creating?
        </h2>
        <p className="pricing-bottom-cta__sub">
          Join 5 million creators. Free forever. Upgrade anytime.
        </p>
        <Link to="/signup" className="pricing-bottom-cta__btn">
          Get started — it's free
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="pricing-footer">
        <Link to="/">© 2025 Videolid ltd.</Link>
        <div className="pricing-footer__links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <a href="mailto:support@videolid.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, annual, onCta }) => {
  const price = annual ? plan.annual : plan.monthly;

  return (
    <div className={`plan-card ${plan.id === 'pro' ? 'plan-card--featured' : ''}`}>
      {plan.badge && <div className="plan-card__badge">{plan.badge}</div>}

      <div className="plan-card__header">
        <div className="plan-card__name">{plan.name}</div>
        <div className="plan-card__price">
          {price === 0 ? (
            <span className="plan-card__amount">Free</span>
          ) : (
            <>
              <span className="plan-card__currency">$</span>
              <span className="plan-card__amount">{price}</span>
              <span className="plan-card__period">
                /mo{plan.perSeat ? '/seat' : ''}{annual && price > 0 ? ' billed annually' : ''}
              </span>
            </>
          )}
        </div>
        {annual && plan.monthly > 0 && (
          <div className="plan-card__saving">
            Save ${(plan.monthly - plan.annual) * 12}/yr
          </div>
        )}
      </div>

      <button
        className={`plan-card__cta plan-card__cta--${plan.ctaStyle}`}
        onClick={onCta}
      >
        {plan.cta}
      </button>

      <ul className="plan-card__features">
        {plan.features.map(f => (
          <li key={f} className="plan-card__feature plan-card__feature--check">
            <CheckIcon /> {f}
          </li>
        ))}
        {plan.disabled.map(f => (
          <li key={f} className="plan-card__feature plan-card__feature--disabled">
            <CrossIcon /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Compare Table ─────────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  ['Exports per day',         '5', 'Unlimited', 'Unlimited'],
  ['Max file size',           '500MB', '4GB', '10GB'],
  ['Max video length',        '5 min', '4 hours', 'Unlimited'],
  ['Watermark',               '✗', '✓', '✓'],
  ['AI subtitles',            '✗', '✓', '✓'],
  ['AI translation',          '✗', '✓', '✓'],
  ['4K export',               '✗', '✓', '✓'],
  ['Priority processing',     '✗', '✓', '✓'],
  ['Cloud storage',           '24h', '30 days', '90 days'],
  ['All formats',             '✗', '✓', '✓'],
  ['Team workspace',          '✗', '✗', '✓'],
  ['White-label exports',     '✗', '✗', '✓'],
  ['API access',              '✗', '✗', '✓'],
  ['Priority support',        '✗', '✗', '✓'],
];

const CompareTable = ({ annual }) => (
  <div className="compare-table-wrap">
    <table className="compare-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>Free</th>
          <th className="compare-table__featured">Pro</th>
          <th>Teams</th>
        </tr>
      </thead>
      <tbody>
        {COMPARE_ROWS.map(([feat, free, pro, teams]) => (
          <tr key={feat}>
            <td>{feat}</td>
            <td>{free}</td>
            <td className="compare-table__featured">{pro}</td>
            <td>{teams}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Icons ─────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);