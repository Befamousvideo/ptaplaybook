"use client";
import { useState, useEffect, useRef } from "react";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export default function ContactForm() {
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");
  const started = useRef(Date.now());
  const tsRef = useRef(null);
  const tsId = useRef(null);
  useEffect(() => {
    if (!SITE_KEY) return;
    const render = () => { if (window.turnstile && tsRef.current && tsId.current == null) tsId.current = window.turnstile.render(tsRef.current, { sitekey: SITE_KEY }); };
    if (window.turnstile) render();
    else if (!document.getElementById("cf-turnstile-js")) {
      const sc = document.createElement("script"); sc.id = "cf-turnstile-js"; sc.async = true; sc.defer = true;
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.onload = render; document.head.appendChild(sc);
    } else { const t = setInterval(() => { if (window.turnstile) { clearInterval(t); render(); } }, 200); return () => clearInterval(t); }
  }, []);
  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("loading"); setMsg("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), email: f.get("email"), message: f.get("message"),
          elapsed: Date.now() - started.current,
          turnstile: SITE_KEY && window.turnstile && tsId.current != null ? window.turnstile.getResponse(tsId.current) : undefined,
          website: f.get("website") }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) setState("done");
      else {
        setState("error");
        setMsg(j.error || "We couldn't send your message. Please try again later.");
        if (SITE_KEY && window.turnstile && tsId.current != null) window.turnstile.reset(tsId.current);
      }
    } catch { setState("error"); setMsg("We couldn't send your message. Please try again later."); }
  }
  if (state === "done") return (<p className="nl-success" role="status">Thanks. We received your message and will get back to you.</p>);
  const busy = state === "loading";
  return (<>
    <form className="brf" onSubmit={onSubmit}>
      <label>Name<input name="name" required maxLength={120} autoComplete="name" disabled={busy} /></label>
      <label>Email<input type="email" name="email" required maxLength={254} autoComplete="email" disabled={busy} /></label>
      <label>Message<textarea name="message" required rows={6} maxLength={4000} disabled={busy} /></label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      {SITE_KEY && <div ref={tsRef} style={{ margin: "12px 0" }} />}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
      {state === "error" && <p className="small" role="alert" style={{ color: "#b42318" }}>{msg}</p>}
    </form>
    <p className="muted small">We’ll only use these details to reply to your message. We don’t sell your information. See our <a href="/privacy">Privacy policy</a>.</p>
  </>);
}
