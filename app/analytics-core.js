// GA4 helpers with no DOM side effects. Event params never include contact or payment data.

const GA_ID_RE = /^G-[A-Za-z0-9]{4,}$/;
const PII_KEY_RE = /email|e-?mail|phone|tel|name|message|address|notes?|headline|password|secret|token|ssn|card|cvv|account/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const CARD_RE = /\b\d{13,19}\b/;

export const CTA_LOCATIONS = new Set(["hero", "cta_band", "newsletter", "ad_order", "ad_slot", "ad_policy"]);
export const LEAD_FORMS = new Set(["newsletter", "ad_order"]);

export function gaMeasurementId(raw = process.env.NEXT_PUBLIC_GA_ID) {
  const id = String(raw ?? "").trim();
  return GA_ID_RE.test(id) ? id : "";
}

export function gaScriptSrc(raw) {
  const id = gaMeasurementId(raw);
  return id ? `https://www.googletagmanager.com/gtag/js?id=${id}` : "";
}

// Page views are sent manually so query strings (such as a Stripe session id) are never included.
export function gaInlineSnippet(raw) {
  const id = gaMeasurementId(raw);
  if (!id) return "";
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(id)},{send_page_view:false});`;
}

function clip(value, max) {
  return String(value ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function looksLikePii(value) {
  const s = String(value ?? "");
  return EMAIL_RE.test(s) || PHONE_RE.test(s) || CARD_RE.test(s);
}

export function sanitizeEventParams(params) {
  const out = {};
  if (!params || typeof params !== "object") return out;
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEY_RE.test(key)) continue;
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;
    if (looksLikePii(value)) continue;
    out[key] = typeof value === "string" ? clip(value, 120) : value;
  }
  return out;
}

export function ctaParams(label, location) {
  if (!CTA_LOCATIONS.has(location)) return null;
  const cta_label = clip(label, 80);
  const cta_location = clip(location, 40);
  if (!cta_label || !cta_location) return null;
  const safe = sanitizeEventParams({ cta_label, cta_location });
  if (safe.cta_label !== cta_label || safe.cta_location !== cta_location) return null;
  return safe;
}

export function leadParams(formId) {
  if (!LEAD_FORMS.has(formId)) return null;
  return { form_id: formId };
}

export function safePath(pathname) {
  const raw = String(pathname ?? "/").split("#")[0].split("?")[0];
  if (!raw.startsWith("/")) return "/";
  return raw || "/";
}

export function pageViewParams(pathname, origin) {
  const page_path = safePath(pathname);
  const params = { page_path };
  if (typeof origin === "string" && /^https?:\/\/[A-Za-z0-9.-]+(?::\d+)?$/.test(origin)) {
    params.page_location = `${origin}${page_path}`;
  }
  const safe = sanitizeEventParams(params);
  if (!safe.page_path) safe.page_path = "/";
  return safe;
}
