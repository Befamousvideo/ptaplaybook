import assert from "node:assert/strict";
import test from "node:test";
import { allPages } from "../app/site-data.js";
import robots from "../app/robots.js";
import {
  adPolicyDescription,
  advertiseDescription,
  faqJsonLd,
  homeMetadata,
  homeTitle,
  llmsText,
  origin,
  pageMetadata,
  siteJsonLd,
  sitemapEntries,
} from "../app/seo.js";
import site from "../content/site.json";

test("sitemap and robots target the production domain", () => {
  const entries = sitemapEntries();
  const urls = entries.map((e) => e.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes(`${origin}/`));
  assert.ok(urls.includes(`${origin}/advertise`));
  assert.ok(urls.includes(`${origin}/advertise/policy`));
  assert.equal(urls.some((u) => u.includes("/advertise/thanks")), false);
  assert.equal(urls.some((u) => u.includes("/api/")), false);
  for (const e of entries) {
    assert.match(e.url, /^https:\/\/ptaplaybook\.com\//);
    assert.match(e.lastModified, /^\d{4}-\d{2}-\d{2}$/);
  }
  for (const p of allPages()) assert.ok(urls.includes(`${origin}${p.path}`), p.path);
  const robotsTxt = robots();
  assert.equal(robotsTxt.sitemap, "https://ptaplaybook.com/sitemap.xml");
  assert.equal(robotsTxt.rules[0].allow, "/");
});

test("site JSON-LD is Organization and WebSite, and FAQPage only for real FAQs", () => {
  const graph = siteJsonLd()["@graph"];
  assert.deepEqual(graph.map((n) => n["@type"]), ["Organization", "WebSite"]);
  assert.equal(graph.some((n) => n.email || n.telephone || n.contactPoint), false);
  assert.equal(/[^\s"@]+@[^\s"@]+\.[^\s"@]+/.test(JSON.stringify(graph)), false);
  assert.equal(faqJsonLd(null), null);
  assert.equal(faqJsonLd([]), null);
  assert.equal(faqJsonLd([{ q: "Only a question" }]), null);
  const homeFaq = faqJsonLd(site.home.faq);
  assert.equal(homeFaq["@type"], "FAQPage");
  assert.equal(homeFaq.mainEntity.length, site.home.faq.length);
  const withFaq = site.pages.filter((p) => Array.isArray(p.faq) && p.faq.length);
  assert.ok(withFaq.length > 0);
  for (const p of site.pages.filter((p) => !p.faq)) assert.equal(faqJsonLd(p.faq), null);
});

test("each page metadata includes canonical, description, Open Graph, and Twitter", () => {
  const home = homeMetadata();
  assert.equal(home.title.absolute, homeTitle);
  assert.equal(home.description, site.description);
  assert.equal(home.alternates.canonical, "/");
  assert.equal(home.openGraph.url, "/");
  assert.equal(home.openGraph.siteName, site.name);
  assert.equal(home.twitter.card, "summary");
  assert.equal(home.twitter.title.absolute, homeTitle);
  const sample = pageMetadata({ title: "Advertise", description: advertiseDescription, path: "/advertise", type: "website" });
  assert.equal(sample.title, "Advertise");
  assert.equal(sample.openGraph.title.absolute, `Advertise | ${site.name}`);
  assert.equal(sample.twitter.description, advertiseDescription);
  assert.equal(sample.alternates.types["text/plain"], "/llms.txt");
  const policy = pageMetadata({ title: "Ad Policy", description: adPolicyDescription, path: "/advertise/policy" });
  assert.ok(policy.description.length > 0 && policy.description.length <= 160);
});

test("llms.txt summarizes existing copy and adds no contact address", () => {
  const text = llmsText();
  assert.match(text, new RegExp(`# ${site.name}`));
  assert.ok(text.includes(site.description));
  assert.ok(text.includes(site.home.h1));
  assert.ok(text.includes(site.home.faq[0].q));
  assert.ok(text.includes(site.home.faq[0].a));
  assert.ok(text.includes("https://ptaplaybook.com/sitemap.xml"));
  assert.equal(text.includes("@"), false);
  assert.equal(/meaningful traffic|visitors|pageviews/i.test(text), false);
});
