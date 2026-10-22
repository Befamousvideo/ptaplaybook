import site from "../content/site.json";
import { allPages, pageDateIso } from "./site-data.js";

export const homeTitle = `${site.name} — ${site.tagline}`;
export const origin = `https://${site.domain}`;
export const SITEMAP_URL = `${origin}/sitemap.xml`;
export const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: homeTitle,
};

export const advertiseDescription = `Advertise on ${site.name}: labeled, reviewed ads with simple founding pricing.`;
export const adPolicyDescription = `What ${site.name} will and won't advertise.`;
export const thanksDescription = "We're confirming your payment. You'll get an email as soon as your ad is scheduled.";

const ALT_TYPES = { "application/rss+xml": "/rss.xml", "text/plain": "/llms.txt" };
const SITEMAP_EXTRAS = ["/advertise", "/advertise/policy"];

export function metaDesc(s) {
  if (!s || s.length <= 160) return s;
  const c = s.slice(0, 157);
  return c.slice(0, c.lastIndexOf(" ")).replace(/[,;:\u2014\u2013-]+$/, "") + "\u2026";
}

export function pageMetadata({ title, description, path, type = "website", absoluteTitle = false }) {
  const desc = metaDesc(description || site.description);
  const socialTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: path, types: { ...ALT_TYPES } },
    openGraph: {
      title: { absolute: socialTitle },
      description: desc,
      url: path,
      type,
      siteName: site.name,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: { absolute: socialTitle },
      description: desc,
      images: [shareImage],
    },
  };
}

export function homeMetadata() {
  return pageMetadata({
    title: homeTitle,
    description: site.description,
    path: "/",
    type: "website",
    absoluteTitle: true,
  });
}

export function jsonLdHtml(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function siteJsonLd() {
  const url = origin;
  const orgId = `${url}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        url,
        description: site.description,
        parentOrganization: { "@type": "Organization", name: "StorenTech" },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: site.name,
        url,
        description: site.description,
        publisher: { "@id": orgId },
      },
    ],
  };
}

export function faqJsonLd(faq) {
  if (!Array.isArray(faq) || faq.length === 0) return null;
  const mainEntity = [];
  for (const f of faq) {
    if (!f || typeof f.q !== "string" || typeof f.a !== "string" || !f.q.trim() || !f.a.trim()) return null;
    mainEntity.push({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } });
  }
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
}

export function sitemapEntries() {
  return [
    { url: `${origin}/`, lastModified: pageDateIso({}) },
    ...allPages().map((p) => ({ url: `${origin}${p.path}`, lastModified: pageDateIso(p) })),
    ...SITEMAP_EXTRAS.map((path) => ({ url: `${origin}${path}`, lastModified: pageDateIso({}) })),
  ];
}

export function llmsText() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.tagline}`,
    "",
    site.description,
    "",
    site.footer,
    "",
    "## Home",
    "",
    site.home.h1,
    "",
    site.home.lead,
    "",
    "## Newsletter",
    "",
    site.newsletter.title,
    "",
    site.newsletter.blurb,
    "",
    site.mainCta.title,
    "",
    site.mainCta.text,
    "",
    "## Pages",
    "",
  ];
  for (const p of allPages()) lines.push(`- [${p.title}](${origin}${p.path}): ${p.summary}`);
  lines.push(
    `- [Advertise](${origin}/advertise): ${advertiseDescription}`,
    `- [Ad Policy](${origin}/advertise/policy): ${adPolicyDescription}`,
    "",
    "## Advertising",
    "",
    site.sponsorSlot,
    "",
    "## FAQ",
    "",
  );
  for (const f of site.home.faq) lines.push(`### ${f.q}`, "", f.a, "");
  for (const p of site.pages) {
    if (!Array.isArray(p.faq) || !p.faq.length) continue;
    for (const f of p.faq) lines.push(`### ${f.q}`, "", f.a, "");
  }
  lines.push("## Also", "", `- [Sitemap](${SITEMAP_URL})`, `- [RSS](${origin}/rss.xml)`, "");
  return lines.join("\n");
}
