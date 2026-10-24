/** Cookie / analytics consent for ptaplaybook.com (first-party only). */

export const CONSENT_STORAGE_KEY = "pta_consent";
export const CONSENT_COOKIE_NAME = "pta_consent";
/** 1 year */
export const CONSENT_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export const CONSENT_ACCEPTED = "accepted";
export const CONSENT_REJECTED = "rejected";

/** @returns {"accepted"|"rejected"|null} */
export function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    const fromLs = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (fromLs === CONSENT_ACCEPTED || fromLs === CONSENT_REJECTED) return fromLs;
  } catch {
    /* private mode / blocked storage */
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE_NAME}=([^;]+)`)
  );
  const fromCookie = match ? decodeURIComponent(match[1]) : null;
  if (fromCookie === CONSENT_ACCEPTED || fromCookie === CONSENT_REJECTED) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, fromCookie);
    } catch {
      /* ignore */
    }
    return fromCookie;
  }
  return null;
}

/** @param {"accepted"|"rejected"} choice */
export function writeConsent(choice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(choice)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  applyGoogleConsentUpdate(choice === CONSENT_ACCEPTED);
  window.dispatchEvent(
    new CustomEvent("pta:consent", { detail: choice })
  );
}

export function isAnalyticsAllowed() {
  return readConsent() === CONSENT_ACCEPTED;
}

/** Run callback once analytics consent is granted (now or after Accept). */
export function whenAnalyticsAllowed(callback) {
  if (typeof window === "undefined") return;
  if (isAnalyticsAllowed()) {
    callback();
    return;
  }
  const onChange = (e) => {
    if (e.detail === CONSENT_ACCEPTED) {
      window.removeEventListener("pta:consent", onChange);
      callback();
    }
  };
  window.addEventListener("pta:consent", onChange);
}

/** Push Google Consent Mode v2 update when gtag is available. */
export function applyGoogleConsentUpdate(granted) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  const state = granted ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}
