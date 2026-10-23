import { SITEMAP_URL } from "./seo.js";
export const dynamic = "force-static";
export default function robots() { return { rules: [{ userAgent: "*", allow: "/" }], sitemap: SITEMAP_URL }; }
