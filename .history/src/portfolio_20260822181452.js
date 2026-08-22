/* Quayyum Ariyo — portfolio behaviour.
   All content lives in index.html; this file only adds routing and the few
   interactions that make the site feel alive. */

const BASE_TITLE = "Quayyum Ariyo — Software Engineer & Builder";

const PROJ_TITLES = {
  papyr: "Papyr — a handwriting-first ledger for small businesses",
  olakz: "Olakz — multi-service mobile super-app",
  semicolon: "Semicolon — banking, rental & full-stack engineering",
  urbanfix: "UrbanFix — service & repair platform, in the making",
  investnaija: "InvestNaija — Nigerian fintech platform",
};

/* ------------------------------------------------------------------ */
/*  ✦ surprise me — the whole feature lives in src/surprise.js,          */
/*  which is loaded lazily on the first click so the page itself        */
/*  stays light. See that file for the pool and selection logic.        */
/* ------------------------------------------------------------------ */

const surpriseBtn = document.getElementById("surpriseBtn");
const surpriseCaption = document.getElementById("surpriseCaption");

if (surpriseBtn) {
  let surpriseModule = null;
  surpriseBtn.addEventListener("click", () => {
    if (!surpriseModule) {
      surpriseModule = import(new URL("src/surprise.js", document.baseURI).href).catch(() => {
        surpriseModule = null;
        if (surpriseCaption) surpriseCaption.textContent = "couldn't find one — try again.";
      });
    }
    surpriseModule.then((m) => m && m.handleSurpriseClick(surpriseBtn, surpriseCaption)).catch(() => {});
  });
}

/* ------------------------------------------------------------------ */
/*  routing                                                             */
/* ------------------------------------------------------------------ */

function currentSlug() {
  const m = location.hash.match(/^#\/work\/([a-z]+)/);
  return m ? m[1] : null;
}

function applyRoute() {
  const slug = currentSlug();
  const home = document.getElementById("home");
  const proj = slug ? document.getElementById("proj-" + slug) : null;

  document.querySelectorAll(".proj").forEach((p) => {
    p.hidden = true;
    p.classList.remove("active");
  });

  if (proj) {
    home.hidden = true;
    proj.hidden = false;
    requestAnimationFrame(() => proj.classList.add("active"));
    window.scrollTo(0, 0);
    document.title = (PROJ_TITLES[slug] || slug) + " — Quayyum Ariyo";
  } else {
    home.hidden = false;
    document.title = BASE_TITLE;
  }
}

function onHashChange() {
  const slug = currentSlug();
  const home = document.getElementById("home");
  if (slug) {
    applyRoute();
    return;
  }
  if (home.hidden) {
    applyRoute();
    const t = location.hash.slice(1);
    if (t) setTimeout(() => {
      const el = document.getElementById(t);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 40);
  }
}

window.addEventListener("hashchange", onHashChange);
applyRoute();

/* ------------------------------------------------------------------ */
/*  mobile nav — Menu / Close                                           */
/* ------------------------------------------------------------------ */

const navToggle = document.getElementById("navToggle");
const siteNav = document.querySelector(".site");

if (navToggle && siteNav) {
  const closeNav = () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "Menu";
  };

  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.textContent = open ? "Close" : "Menu";
  });

  document.querySelectorAll(".navlinks a").forEach((a) => a.addEventListener("click", closeNav));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  document.addEventListener("click", (e) => {
    if (siteNav.classList.contains("open") && !siteNav.contains(e.target)) closeNav();
  });
}

/* ------------------------------------------------------------------ */
/*  reveal on scroll                                                    */
/* ------------------------------------------------------------------ */

function revealAll() {
  document.querySelectorAll(".rv").forEach((el) => el.classList.add("in"));
}

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
} else {
  revealAll();
}

/* ------------------------------------------------------------------ */
/*  misc                                                                */
/* ------------------------------------------------------------------ */

const yearEl = document.getElementById("yearEl");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
