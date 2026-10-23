import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ctaParams,
  gaInlineSnippet,
  gaMeasurementId,
  gaScriptSrc,
  leadParams,
  looksLikePii,
  pageViewParams,
  sanitizeEventParams,
} from "../app/analytics-core.js";

test("GA id loads only for a GA4 measurement id", () => {
  assert.equal(gaMeasurementId(""), "");
  assert.equal(gaMeasurementId(undefined), "");
  assert.equal(gaMeasurementId("UA-123456"), "");
  assert.equal(gaMeasurementId("G-12"), "");
  assert.equal(gaMeasurementId("<script>"), "");
  assert.equal(gaMeasurementId("G-TEST1234"), "G-TEST1234");
  assert.equal(gaScriptSrc("G-TEST1234"), "https://www.googletagmanager.com/gtag/js?id=G-TEST1234");
  assert.equal(gaScriptSrc(""), "");
  const snippet = gaInlineSnippet("G-TEST1234");
  assert.match(snippet, /send_page_view:false/);
  assert.match(snippet, /"G-TEST1234"/);
  assert.equal(snippet.includes("@"), false);
  assert.equal(gaInlineSnippet("nope"), "");
});

test("lead and cta params exclude contact and payment data", () => {
  assert.deepEqual(leadParams("newsletter"), { form_id: "newsletter" });
  assert.deepEqual(leadParams("ad_order"), { form_id: "ad_order" });
  assert.equal(leadParams("you@example.com"), null);
  assert.equal(leadParams("newsletter\nemail"), null);
  assert.deepEqual(ctaParams("Join the newsletter", "cta_band"), {
    cta_label: "Join the newsletter",
    cta_location: "cta_band",
  });
  assert.equal(ctaParams("Email me", "not-a-place"), null);
  assert.equal(ctaParams("ada@example.com", "hero"), null);
  assert.equal(ctaParams("Call (949) 555-1234", "hero"), null);
  assert.equal(ctaParams("4111111111111111", "hero"), null);
  const dirty = sanitizeEventParams({
    cta_label: "Join",
    email: "a@b.co",
    phone: "555-555-5555",
    message: "hello",
    name: "Ada",
    notes: "secret",
  });
  assert.deepEqual(dirty, { cta_label: "Join" });
  assert.equal(looksLikePii("parent@school.org"), true);
});

test("page views drop query strings", () => {
  assert.deepEqual(pageViewParams("/advertise/thanks?session_id=cs_test_123", "https://ptaplaybook.com"), {
    page_path: "/advertise/thanks",
    page_location: "https://ptaplaybook.com/advertise/thanks",
  });
  assert.equal(pageViewParams("/pta", "https://user:pass@ptaplaybook.com").page_location, undefined);
  assert.equal(String(pageViewParams("/x", "https://ptaplaybook.com").page_location).includes("session_id"), false);
});

test("form handlers record leads without reading fields into events", () => {
  const newsletter = readFileSync(new URL("../app/NewsletterForm.js", import.meta.url), "utf8");
  const order = readFileSync(new URL("../app/AdOrderForm.js", import.meta.url), "utf8");
  assert.match(newsletter, /trackLead\("newsletter"\)/);
  assert.match(newsletter, /trackCta\("Join the list", "newsletter"\)/);
  assert.match(order, /trackLead\("ad_order"\)/);
  assert.match(order, /trackCta\("Submit ad for review", "ad_order"\)/);
  assert.doesNotMatch(newsletter, /track(?:Lead|Cta)\([^)]*f\.get/);
  assert.doesNotMatch(order, /track(?:Lead|Cta)\([^)]*(?:f\.get|name|email|phone|notes)/);
});
