"use client";

import { useEffect } from "react";
import { whenAnalyticsAllowed, applyGoogleConsentUpdate } from "../lib/consent";
import { GA_MEASUREMENT_ID } from "../lib/ga";

let gtagLoaded = false;

function loadGtag(measurementId) {
  if (gtagLoaded || !measurementId || typeof window === "undefined") return;
  gtagLoaded = true;
  applyGoogleConsentUpdate(true);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

export default function GoogleAnalytics() {
  useEffect(() => {
    whenAnalyticsAllowed(() => loadGtag(GA_MEASUREMENT_ID));
  }, []);
  return null;
}
