export { synthetic, allPages, pageAt, childrenOf, matchTitle, isoDate, pageDateIso, pageDateLabel, grouped } from "./site-data";
import { grouped, matchTitle } from "./site-data";
// Render bare http(s) URLs inside text as real links (source citations).
const URL_RE = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/g;
export function Linked({ t }) { const parts = String(t).split(URL_RE);
  return <>{parts.map((x, i) => i % 2 ? <a key={i} href={x} rel="noopener" target="_blank">{x}</a> : x)}</>; }
export function Li({ t }) { const m = matchTitle(t); if (!m) return <li><Linked t={t} /></li>;
  const head = String(t).split(" — ")[0]; const rest = String(t).slice(head.length);
  return <li><a href={m.path}>{head}</a>{rest}</li>; }
export function Cards({ items }) {
  return <div className="grid">{items.map(c => <a key={c.path} className="card tile" href={c.path}>{c.label && <span className="tag">{c.label}</span>}<h3>{c.title}</h3><p>{c.summary}</p></a>)}</div>;
}
export function Listing({ path }) {
  const gs = grouped(path); if (!gs.length) return null;
  const multi = gs.length > 1 || gs[0].seg;
  return <section className="listing">{gs.map(g => <div key={g.seg || "_"}>
    {multi && g.seg && <h2>{g.href ? <a href={g.href}>{g.name}</a> : g.name} <span className="muted small">({g.items.length})</span></h2>}
    <Cards items={g.items} /></div>)}</section>;
}
