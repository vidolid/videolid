// src/pages/RefundPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";

const sections = [
  {
    id: "free",
    title: "Free tools",
    content: (
      <p>
        Most Videolid tools are free to use, so there is nothing to refund. This
        policy applies only to paid plans and purchases made on our{" "}
        <Link to="/pricing">Pricing page</Link>.
      </p>
    ),
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    content: (
      <>
        <p>
          Paid plans renew automatically each billing period (monthly or yearly)
          until you cancel. You can cancel at any time from your account. After
          you cancel, you keep access until the end of the period you've already
          paid for, and you won't be charged again.
        </p>
        <p>
          We don't refund partial billing periods or unused time after a
          cancellation.
        </p>
      </>
    ),
  },
  {
    id: "eligible",
    title: "When we give refunds",
    content: (
      <>
        <p>We'll refund your payment in these cases:</p>
        <ul>
          <li>
            <strong>First-time purchase:</strong> you ask within [7] days of
            your first payment for a plan and haven't heavily used paid
            features. [ADJUST THE NUMBER OF DAYS]
          </li>
          <li>
            <strong>Duplicate or accidental charge:</strong> you were billed
            twice or charged in error.
          </li>
          <li>
            <strong>Service failure:</strong> a paid feature didn't work as
            described and we couldn't fix it within a reasonable time.
          </li>
          <li>
            <strong>Unexpected renewal:</strong> you ask within [48 hours] of a
            renewal charge and haven't used the plan since. [ADJUST]
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "not-eligible",
    title: "When we can't give refunds",
    content: (
      <ul>
        <li>Requests made after the windows above have passed.</li>
        <li>
          Accounts suspended or closed for breaking our{" "}
          <Link to="/terms">Terms of Service</Link>.
        </li>
        <li>
          Dissatisfaction with results that come from the quality of the files
          you uploaded.
        </li>
        <li>
          Charges from third parties, such as your bank's fees or currency
          conversion costs.
        </li>
      </ul>
    ),
  },
  {
    id: "request",
    title: "How to ask for a refund",
    content: (
      <>
        <p>
          Email <a href="mailto:support@videolid.com">support@videolid.com</a>{" "}
          from the address on your account and include:
        </p>
        <ul>
          <li>The email address or account name used for the purchase.</li>
          <li>The date and amount of the charge.</li>
          <li>A short reason for the request.</li>
        </ul>
        <p>We aim to reply within 3 business days.</p>
      </>
    ),
  },
  {
    id: "processing",
    title: "How refunds are paid",
    content: (
      <p>
        Approved refunds go back to your original payment method. They usually
        appear within 5 to 10 business days, depending on your bank or card
        issuer. Your paid features end once a refund is issued.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy from time to time. The version that applies to
        a purchase is the one shown on this page when you made it.
      </p>
    ),
  },
];

const RefundPolicy = () => (
  <LegalLayout
    title="Refund Policy"
    updated="October 25, 2026"
    intro="How cancellations and refunds work for Videolid's paid plans."
    sections={sections}
  />
);

export default RefundPolicy;
