/* ============================================================
   ✦ surprise me — take the visitor somewhere genuinely random.

   The destination is picked locally from the curated pool in
   src/surprise-sites.js — no APIs, no network requests, nothing
   to load. It's validated and screened before use, and kept away
   from the session's recently-visited hosts so repeats are rare.
   ============================================================ */

import { SURPRISE_SITES } from "./surprise-sites.js";

const RECENT_KEY = "qasurpriseRecent";
const RECENT_LIMIT = 15;

/* Lightweight safety screen. Covers the obvious categories without
   pretending to be a full web-safety database. */
const UNSAFE_TOKEN =
  /porn|nude|escort|onlyfans|erotic|xxx|cams|camgirl|casino|gambl/i;
const UNSAFE_HOST =
  /\\.onion$|\\.i2p$|\\.bit$|(^|\\.)bitcoin|(^|\\.)crypto|(^|\\.)forex|(^|\\.)payday|(^|\\.)pharm|viagra|tadalafil/i;

export function looksUnsafe(hostname, path, title) {
  const host = String(hostname || "").toLowerCase();
  const p = String(path || "").toLowerCase();
  if (UNSAFE_HOST.test(host)) return true;
  if (UNSAFE_TOKEN.test(host + " " + p)) return true;
  if (title && UNSAFE_TOKEN.test(String(title))) return true;
  return false;
}

export function parseSite(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (!u.hostname || !u.hostname.includes(".")) return null;
  if (u.username || u.password) return null;
  if (looksUnsafe(u.hostname, u.pathname + u.search)) return null;
  return u;
}

/* ---------- session memory of recently visited hosts ---------- */

export function getRecent() {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function remember(host) {
  try {
    const arr = getRecent().filter((h) => h !== host);
    arr.push(host);
    sessionStorage.setItem(
      RECENT_KEY,
      JSON.stringify(arr.slice(-RECENT_LIMIT)),
    );
  } catch {
    /* storage may be unavailable — dedup just degrades */
  }
}

/* ---------- picking a destination ---------- */

export function pickOne() {
  const recents = getRecent();
  const tries = Math.min(SURPRISE_SITES.length, 60);
  for (let i = 0; i < tries; i++) {
    const site = parseSite(
      SURPRISE_SITES[(Math.random() * SURPRISE_SITES.length) | 0],
    );
    if (site && !recents.includes(site.hostname)) return site;
  }
  /* every option was a recent host (tiny pool) — take anything valid */
  for (let i = 0; i < tries; i++) {
    const site = parseSite(
      SURPRISE_SITES[(Math.random() * SURPRISE_SITES.length) | 0],
    );
    if (site) return site;
  }
  return null;
}

/* ---------- orchestration ---------- */

function go(url) {
  if (typeof window.__surpriseNav === "function") {
    window.__surpriseNav(url);
  } else {
    window.location.href = url;
  }
}

function setBusy(btn, busy) {
  btn.dataset.busy = busy ? "true" : "false";
  btn.disabled = busy;
  btn.setAttribute("aria-busy", busy ? "true" : "false");
  btn.classList.toggle("busy", busy);
}

export function handleSurpriseClick(btn, captionEl) {
  if (btn.dataset.busy === "true") return;
  setBusy(btn, true);
  const label = btn.querySelector(".slabel");
  if (label) label.textContent = "finding something…";
  if (captionEl) captionEl.textContent = "somewhere on the internet…";

  const site = pickOne();
  if (!site) {
    if (label) label.textContent = "surprise me";
    if (captionEl) captionEl.textContent = "couldn't find one — try again.";
    setBusy(btn, false);
    return;
  }

  remember(site.hostname);

  /* a hair of a beat so the state change registers before we leave */
  setTimeout(() => {
    if (captionEl) captionEl.textContent = "off you go.";
    /* restore state before navigation, in case navigation is blocked */
    if (label) label.textContent = "surprise me";
    setBusy(btn, false);
    go(site.href);
  }, 220);
}
