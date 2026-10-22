import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOT = new URL("..", import.meta.url);
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;

function read(rel) {
  return readFileSync(new URL(rel, ROOT), "utf8");
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|html|rsc|txt)$/.test(name)) out.push(p);
  }
  return out;
}

function scanText(rel, text) {
  const found = [];
  for (const value of text.match(EMAIL_RE) || []) found.push({ file: rel, kind: "email", value });
  for (const value of text.match(PHONE_RE) || []) found.push({ file: rel, kind: "phone", value });
  for (const match of text.matchAll(CARD_RE)) {
    const value = match[0];
    const digits = value.replace(/\D/g, "");
    const before = text.slice(Math.max(0, (match.index || 0) - 48), match.index || 0);
    if (digits.length < 13 || digits.length > 19) continue;
    if (/https?:\/\/|articles\/|zendesk/i.test(before)) continue;
    found.push({ file: rel, kind: "card", value });
  }
  return found;
}

test("public copy has no real contact or payment PII", () => {
  const publicFiles = [
    "content/site.json",
    "app/page.js",
    "app/layout.js",
    "app/components.js",
    "app/nav.js",
    "app/network.js",
    "app/NewsletterForm.js",
    "app/AdOrderForm.js",
    "app/HouseAd.js",
    "app/analytics.js",
    "app/analytics-core.js",
    "app/seo.js",
    "app/[...slug]/page.js",
    "app/advertise/page.js",
    "app/advertise/policy/page.js",
    "app/advertise/thanks/page.js",
    "app/advertise/thanks/Confirm.js",
  ];
  const found = publicFiles.flatMap((rel) => scanText(rel, read(rel)));
  assert.deepEqual(found.sort((a, b) => a.value.localeCompare(b.value)), [
    { file: "app/AdOrderForm.js", kind: "phone", value: "(949) 555-1234" },
    { file: "app/NewsletterForm.js", kind: "email", value: "you@example.com" },
  ]);
  const server = scanText("app/ads-lib.js", read("app/ads-lib.js")).filter((f) => f.kind === "email");
  assert.deepEqual(server.map((f) => f.value).sort(), ["ads@agentsformainstreet.com", "vincent@storentech.com"]);
});

test("client build output does not contain operational inboxes", () => {
  const dir = join(ROOT.pathname, ".next/static");
  if (!existsSync(dir)) return;
  const banned = ["vincent@storentech.com", "ads@agentsformainstreet.com"];
  const hits = [];
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    for (const value of banned) if (text.includes(value)) hits.push({ file, value });
  }
  assert.deepEqual(hits, []);
});
