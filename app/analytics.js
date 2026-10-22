"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ctaParams, gaMeasurementId, leadParams, pageViewParams } from "./analytics-core";

const GA_ID = gaMeasurementId();

function gtagEvent(eventName, params) {
  try {
    if (!GA_ID || typeof window === "undefined" || !params) return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params);
  } catch {
    // Analytics must not block the page.
  }
}

export function trackCta(label, location) {
  gtagEvent("cta_click", ctaParams(label, location));
}

export function trackLead(formId) {
  gtagEvent("generate_lead", leadParams(formId));
}

/**
 * @param {{ href: string, className?: string, label: string, location: string, children?: import("react").ReactNode, rel?: string, target?: string }} props
 */
export function TrackedCta({ href, className, label, location, children, rel, target }) {
  return (
    <a className={className} href={href} rel={rel} target={target} onClick={() => trackCta(label, location)}>
      {children}
    </a>
  );
}

export function AnalyticsRouteChange() {
  const pathname = usePathname() || "/";
  useEffect(() => {
    if (!GA_ID || typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", pageViewParams(pathname, window.location.origin));
  }, [pathname]);
  return null;
}
