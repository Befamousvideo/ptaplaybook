"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONSENT_ACCEPTED,
  CONSENT_REJECTED,
  readConsent,
  writeConsent,
} from "../lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const acceptRef = useRef(null);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  useEffect(() => {
    if (visible && acceptRef.current) acceptRef.current.focus();
  }, [visible]);

  if (!visible) return null;

  const choose = (choice) => {
    writeConsent(choice);
    setVisible(false);
  };

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-label="Cookie preferences"
    >
      <div className="cookie-banner-inner wrap">
        <p className="cookie-banner-text" id="cookie-banner-desc">
          We use optional cookies for privacy-friendly analytics. You can accept
          or reject non-essential cookies.{" "}
          <a href="/privacy">Privacy policy</a>
        </p>
        <div className="cookie-banner-actions" role="group" aria-labelledby="cookie-banner-desc">
          <button
            type="button"
            className="cookie-banner-btn"
            onClick={() => choose(CONSENT_REJECTED)}
          >
            Reject
          </button>
          <button
            ref={acceptRef}
            type="button"
            className="cookie-banner-btn"
            onClick={() => choose(CONSENT_ACCEPTED)}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
