/* Flores Serna Group — interactions */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav elevate on scroll ---------- */
  const nav = document.getElementById("nav");
  const hero = document.querySelector(".hero, .dhero");

  function onScroll() {
    // elevate once we've scrolled past ~70% of the hero
    const threshold = hero ? hero.offsetHeight * 0.72 : 400;
    nav.dataset.elevated = window.scrollY > threshold ? "true" : "false";
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) {
    toggle.addEventListener("click", () =>
      setMenu(toggle.getAttribute("aria-expanded") !== "true")
    );
  }
  if (menu) {
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu && !menu.hidden) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat__num[data-count]");
  if (counters.length && !prefersReduced && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          const dur = 1100;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Hero mouse parallax ---------- */
  const heroEl = document.querySelector(".hero");
  const heroBg = document.querySelector(".hero__bg");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (heroEl && heroBg && finePointer && !prefersReduced) {
    const AMP = 16; // px of drift
    let hticking = false;
    let tx = 0, ty = 0;
    function applyHero() {
      heroBg.style.setProperty("--hx", tx.toFixed(1) + "px");
      heroBg.style.setProperty("--hy", ty.toFixed(1) + "px");
      hticking = false;
    }
    heroEl.addEventListener("mousemove", (e) => {
      const r = heroEl.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = -nx * AMP * 2; // move opposite to cursor for depth
      ty = -ny * AMP * 2;
      if (!hticking) { hticking = true; requestAnimationFrame(applyHero); }
    });
    heroEl.addEventListener("mouseleave", () => {
      tx = 0; ty = 0;
      requestAnimationFrame(applyHero);
    });
  }

  /* ---------- Map parallax ---------- */
  const parallax = document.querySelector("[data-parallax]");
  const stage = parallax ? parallax.closest(".mapstage") : null;
  if (parallax && stage && !prefersReduced) {
    const MAX = 22; // px of drift
    let ticking = false;
    function apply() {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const center = r.top + r.height / 2;
      const prog = (center - vh / 2) / (vh / 2 + r.height / 2);
      const clamped = Math.max(-1, Math.min(1, prog));
      parallax.style.setProperty("--py", (clamped * MAX).toFixed(1) + "px");
      ticking = false;
    }
    function onP() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }
    apply();
    window.addEventListener("scroll", onP, { passive: true });
    window.addEventListener("resize", onP);
  }
})();
