import site from "../content/site.json";

export function newsletterFooterLines() {
  return site.newsletter.emailFooter || [];
}

export function newsletterFooterHtml() {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  return `<p>${newsletterFooterLines().map(esc).join("<br />\n")}</p>`;
}
