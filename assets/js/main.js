/* Flores Serna Group — interactions */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav elevate on scroll ---------- */
  const nav = document.getElementById("nav");
  const hero = document.querySelector(".dhero");
  const reel = document.getElementById("reel");
  const reelTrack = document.getElementById("reelTrack");

  function onScroll() {
    let elevated;
    if (reelTrack) {
      // El hero mide varias pantallas: la barra sólo se aclara cuando el
      // encuadre está por salir, no a una fracción de su altura total.
      elevated = reelTrack.getBoundingClientRect().bottom < window.innerHeight * 0.6;
    } else {
      const threshold = hero ? hero.offsetHeight * 0.72 : 400;
      elevated = window.scrollY > threshold;
    }
    nav.dataset.elevated = elevated ? "true" : "false";
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

  /* ---------- Medios (data-driven from data/medios.json) ---------- */
  const mediosGrid = document.getElementById("mediosGrid");
  if (mediosGrid) {
    const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const esc = (s) =>
      String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
      );
    fetch("data/medios.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const items = (data && data.publicaciones) || [];
        if (!items.length) return; // keep static fallback cards
        items.sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
        mediosGrid.innerHTML = items
          .map((p) => {
            const d = new Date(String(p.fecha || "") + "T00:00:00");
            const fecha = isNaN(d.getTime())
              ? esc(p.fecha)
              : String(d.getDate()).padStart(2, "0") + " " + MESES[d.getMonth()] + " " + d.getFullYear();
            let href = p.pdf || p.url || "";
            if (href && !/^https?:/i.test(href)) href = href.replace(/^\//, "");
            const isPdf = /\.pdf$/i.test(href);
            const tag = href ? "a" : "article";
            const attrs = href ? ' href="' + esc(href) + '"' + (isPdf ? ' target="_blank" rel="noopener"' : "") : "";
            const cta = '<span class="post__cta">Leer <span aria-hidden="true">&rarr;</span></span>';
            return (
              "<" + tag + ' class="post"' + attrs + ">" +
              '<div class="post__meta"><span>' + esc(p.fuente) + "</span>" +
              '<time datetime="' + esc(p.fecha) + '">' + fecha + "</time></div>" +
              '<h3 class="post__title">' + esc(p.titulo) + "</h3>" +
              '<p class="post__excerpt">' + esc(p.resumen) + "</p>" +
              cta +
              "</" + tag + ">"
            );
          })
          .join("");
      })
      .catch(() => { /* network/parse error → keep the static cards already in the HTML */ });
  }

  /* ---------- Reel: el encuadre dirigido por scroll ----------
     Un solo valor de progreso (0..1) mueve las tres cosas del hero:
     el obturador, el eje `wdth` del wordmark y el acercamiento de la toma.
     El obturador NO abre de forma continua: abre en dos cortes, igual que
     un cambio de formato en proyección. Por eso la lectura de encuadre
     puede anunciar 2.39 → 1.90 → 1.43 y estar diciendo la verdad. */
  const reelFrames = reel ? Array.prototype.slice.call(reel.querySelectorAll(".reel__frame")) : [];
  const reelRatio = document.getElementById("reelRatio");

  if (reel) requestAnimationFrame(() => reel.classList.add("is-ready"));

  if (reel && reelTrack && !prefersReduced) {
    const RATIOS = ["2.39 : 1", "1.90 : 1", "1.43 : 1"];
    const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
    // smoothstep sobre un tramo: fuera del tramo entrega 0 o 1 exactos
    const seg = (a, b, x) => {
      const t = clamp01((x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };

    const reelFoot = document.getElementById("reelFoot");
    // Un tramo de acople por renglón, encabalgados sobre los cortes del
    // obturador: el wordmark termina de armarse cuando el encuadre termina de abrir.
    const LOCK = [[0.02, 0.34], [0.26, 0.60], [0.50, 0.86]];
    let shot = -1;
    let rticking = false;

    // El relleno del cartón de título depende del alto real del pie, que
    // cambia con el ancho de la ventana. Se mide al redimensionar, no por cuadro.
    function measureFoot() {
      if (reelFoot) reel.style.setProperty("--foot-h", reelFoot.offsetHeight + "px");
    }

    function drawReel() {
      const vh = window.innerHeight;
      const r = reelTrack.getBoundingClientRect();
      const range = r.height - vh; // recorrido en el que el escenario está pegado
      const p = range > 0 ? clamp01(-r.top / range) : 0;

      const k = 1 - 0.55 * seg(0.30, 0.40, p) - 0.45 * seg(0.56, 0.66, p);
      reel.style.setProperty("--k", Math.max(0, k).toFixed(4));
      reel.style.setProperty("--push", (1.14 - 0.13 * p).toFixed(4));

      // Las tres palabras del logo se acoplan en su tramo (FLORES, luego SERNA,
      // luego GROUP), encabalgadas sobre los cortes del obturador.
      reel.style.setProperty("--l0", seg(LOCK[0][0], LOCK[0][1], p).toFixed(4));
      reel.style.setProperty("--l1", seg(LOCK[1][0], LOCK[1][1], p).toFixed(4));
      reel.style.setProperty("--l2", seg(LOCK[2][0], LOCK[2][1], p).toFixed(4));
      // El cartón crece con el encuadre; el pie entra con el primer corte.
      reel.style.setProperty("--tk", (0.68 + 0.32 * seg(0.02, 0.66, p)).toFixed(4));
      reel.style.setProperty("--foot", seg(0.20, 0.42, p).toFixed(4));
      // El reloj de arena no está al principio: entra más tarde, con fade, y se
      // acomoda mientras se scrollea; termina de armarse junto con GROUP.
      reel.style.setProperty("--asm", seg(0.30, 0.82, p).toFixed(4));
      // Salida: una vez formado el logo, al seguir bajando las letras se apagan
      // y sólo queda el reloj de arena brillando, antes de dar paso a la sección.
      reel.style.setProperty("--out", seg(0.80, 0.98, p).toFixed(4));

      // Los cortes de toma caen sobre los mismos puntos que los del obturador.
      const next = p < 0.35 ? 0 : p < 0.61 ? 1 : 2;
      if (next !== shot) {
        shot = next;
        reelFrames.forEach((f, i) => f.classList.toggle("is-on", i === shot));
        if (reelRatio) reelRatio.textContent = RATIOS[shot];
      }
      rticking = false;
    }

    function onReel() {
      if (!rticking) { rticking = true; requestAnimationFrame(drawReel); }
    }
    measureFoot();
    drawReel();
    window.addEventListener("scroll", onReel, { passive: true });
    window.addEventListener("resize", () => { measureFoot(); onReel(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measureFoot(); onReel(); });
    }
  }

  /* ==========================================================
     PRESENCIA — la línea del día
     El mapa es equirectangular sobre un lienzo de 2000×1000 con la costura
     en lon −20: X = mod(lon+20,360)/360*2000, Y = (90-lat)/180*1000. El
     <svg> encima comparte ese sistema, así que el terminador solar que se
     dibuja cae justo sobre la geografía.
     Con plazas de Shanghái a Panamá siempre hay sol en alguna; eso es lo
     que cuenta la lectura de arriba del mapa.
     ========================================================== */
  const mapPins = document.getElementById("mapPins");

  // Coordenadas reales. Antes vivían como porcentajes escritos a mano.
  const PLAZAS = [
    { k: "cdmx", n: "Ciudad de México",  lat: 19.4326, lon:  -99.1332, tz: "America/Mexico_City", side: "l", hq: true },
    { k: "mty",  n: "Monterrey",         lat: 25.6866, lon: -100.3161, tz: "America/Monterrey",   side: "l" },
    { k: "mia",  n: "Miami",             lat: 25.7617, lon:  -80.1918, tz: "America/New_York",    side: "r" },
    { k: "sha",  n: "Shanghái",          lat: 31.2304, lon:  121.4737, tz: "Asia/Shanghai",       side: "r" },
    // `m` es el nombre corto del mapa: el completo se salía por la derecha.
    { k: "pty",  n: "Ciudad de Panamá",  lat:  8.9824, lon:  -79.5199, tz: "America/Panama",      side: "r", m: "Panamá" }
  ];
  const OFICINAS_MX = [
    ["Guadalajara", 20.6597, -103.3496], ["Querétaro", 20.5888, -100.3899],
    ["Puebla", 19.0414, -98.2063],       ["León", 21.1219, -101.6833],
    ["San Luis Potosí", 22.1565, -100.9855], ["Saltillo", 25.4232, -101.0053],
    ["Chihuahua", 28.6330, -106.0691],   ["Hermosillo", 29.0729, -110.9559],
    ["Tijuana", 32.5149, -117.0382],     ["Mérida", 20.9674, -89.5926],
    ["Tampico", 22.2331, -97.8611],      ["Boca del Río", 19.1057, -96.1062]
  ];

  // Ventana visible del mapa. El alto NO es fijo: el <img> se recorta por
  // arriba con `cover`, así que lo que se alcanza a ver depende de la
  // proporción real del contenedor. Se recalcula en calcVB(), y por eso la
  // sección puede cambiar de formato entre escritorio y móvil sin que los
  // pines se despeguen de la geografía.
  const VB = { x: 416.7, y: 122.2, w: 1472.2, h: 615.98 };
  const RAD = Math.PI / 180;
  const projX = (lon) => (((lon + 20) % 360 + 360) % 360) / 360 * 2000;
  const projY = (lat) => (90 - lat) / 180 * 1000;
  const pctX = (lon) => (projX(lon) - VB.x) / VB.w * 100;
  const pctY = (lat) => (projY(lat) - VB.y) / VB.h * 100;

  // Posición solar (Astronomical Almanac, low precision). Verificada contra
  // los cuatro solsticios/equinoccios: error por debajo de 0.2°.
  function solar(date) {
    const n = date.getTime() / 86400000 + 2440587.5 - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360) * RAD;
    const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
    const eps = (23.439 - 0.0000004 * n) * RAD;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / RAD;
    const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
    let subLon = ra - gmst * 15;
    subLon = ((subLon + 180) % 360 + 360) % 360 - 180;
    return { dec: dec / RAD, subLon };
  }
  // Altura del sol sobre el horizonte: > 0 es de día.
  function elevacion(lat, lon, s) {
    const H = (lon - s.subLon) * RAD;
    return Math.asin(
      Math.sin(lat * RAD) * Math.sin(s.dec * RAD) +
      Math.cos(lat * RAD) * Math.cos(s.dec * RAD) * Math.cos(H)
    ) / RAD;
  }

  if (mapPins) {
    const stageEl = document.getElementById("mapStage");
    const sunSvg = document.querySelector(".mapstage__sun");
    const colocables = [];   // { el, lat, lon }

    // El viewBox tiene que tener exactamente la proporción del contenedor,
    // porque el <img> se escala a lo ancho y se recorta por abajo.
    function calcVB() {
      const r = stageEl.getBoundingClientRect();
      if (!r.width || !r.height) return;
      VB.h = VB.w / (r.width / r.height);
      if (sunSvg) {
        sunSvg.setAttribute("viewBox",
          VB.x + " " + VB.y + " " + VB.w + " " + VB.h.toFixed(2));
      }
    }
    function colocar() {
      colocables.forEach((o) => {
        o.el.style.left = pctX(o.lon).toFixed(3) + "%";
        o.el.style.top = pctY(o.lat).toFixed(3) + "%";
      });
    }

    // --- Pines, una sola vez ---
    const frag = document.createDocumentFragment();
    OFICINAS_MX.forEach(([n, lat, lon]) => {
      const d = document.createElement("span");
      d.className = "cdot";
      d.title = n;
      colocables.push({ el: d, lat: lat, lon: lon });
      frag.appendChild(d);
    });
    PLAZAS.forEach((p, i) => {
      const pin = document.createElement("span");
      pin.className = "pin" + (p.hq ? " pin--hq" : "");
      pin.dataset.plaza = p.k;
      pin.style.setProperty("--i", i);
      const lab = document.createElement("span");
      lab.className = "pinlabel pinlabel--" + p.side;
      lab.dataset.plaza = p.k;
      lab.style.setProperty("--i", i);
      lab.textContent = p.m || p.n;
      colocables.push({ el: pin, lat: p.lat, lon: p.lon },
                      { el: lab, lat: p.lat, lon: p.lon });
      frag.appendChild(pin);
      frag.appendChild(lab);
    });
    mapPins.appendChild(frag);
    calcVB();
    colocar();

    // --- Terminador + relojes ---
    const nightEl = document.getElementById("sunNight");
    const edgeEl = document.getElementById("sunEdge");
    const readout = document.getElementById("mapReadout");
    const clocks = Array.prototype.slice.call(document.querySelectorAll(".clock"));
    const X0 = VB.x, X1 = VB.x + VB.w, Y0 = VB.y, Y1 = VB.y + VB.h;

    function trazarSol() {
      const now = new Date();
      const s = solar(now);

      // El terminador: para cada longitud, la latitud donde el sol roza el
      // horizonte. Se muestrea a lo ancho de la ventana visible.
      const pts = [];
      const PASOS = 160;
      for (let i = 0; i <= PASOS; i++) {
        const X = X0 + (X1 - X0) * (i / PASOS);
        const lon = X / 2000 * 360 - 20;
        const H = (lon - s.subLon) * RAD;
        const latT = Math.atan(-Math.cos(H) / Math.tan(s.dec * RAD)) / RAD;
        pts.push(X.toFixed(1) + " " + projY(latT).toFixed(1));
      }
      // La noche cae del lado opuesto al hemisferio iluminado: si el sol está
      // al norte del ecuador, la noche polar está al sur, y al revés.
      const borde = s.dec > 0 ? Y1 : Y0;
      if (nightEl) {
        nightEl.setAttribute("d",
          "M " + X0.toFixed(1) + " " + borde + " L " + pts.join(" L ") +
          " L " + X1.toFixed(1) + " " + borde + " Z");
      }
      if (edgeEl) edgeEl.setAttribute("d", "M " + pts.join(" L "));

      // Relojes locales y estado día/noche
      let conLuz = 0;
      PLAZAS.forEach((p) => {
        const dia = elevacion(p.lat, p.lon, s) > 0;
        if (dia) conLuz++;
        let hora = "";
        try {
          hora = new Intl.DateTimeFormat("es-MX", {
            timeZone: p.tz, hour: "2-digit", minute: "2-digit", hour12: false
          }).format(now);
        } catch (e) { hora = ""; }   // zona horaria no soportada
        clocks.forEach((c) => {
          if (c.dataset.plaza !== p.k) return;
          c.textContent = hora;
          c.classList.toggle("is-day", dia);
          c.title = dia ? "De día en " + p.n : "De noche en " + p.n;
        });
        const pin = mapPins.querySelector('.pin[data-plaza="' + p.k + '"]');
        if (pin) pin.classList.toggle("is-day", dia);
      });
      if (readout) {
        readout.textContent = conLuz + " de " + PLAZAS.length + " plazas con luz";
      }
    }

    trazarSol();
    setInterval(trazarSol, 60000);   // el terminador avanza ~0.25° por minuto
    window.addEventListener("resize", () => { calcVB(); colocar(); trazarSol(); });

    // --- Lista ↔ mapa: al recorrer la lista se enciende su pin ---
    document.querySelectorAll("[data-plaza]").forEach((el) => {
      if (el.closest("#mapPins")) return;
      const k = el.dataset.plaza;
      const marcar = (on) => {
        mapPins.querySelectorAll('[data-plaza="' + k + '"]')
          .forEach((n) => n.classList.toggle("is-hot", on));
      };
      el.addEventListener("mouseenter", () => marcar(true));
      el.addEventListener("mouseleave", () => marcar(false));
      el.addEventListener("focusin", () => marcar(true));
      el.addEventListener("focusout", () => marcar(false));
    });

    // --- Adquisición: los pines entran escalonados al asomar el mapa ---
    const stage = stageEl;
    if (stage && !prefersReduced && "IntersectionObserver" in window) {
      const mio = new IntersectionObserver((es, obs) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          stage.classList.add("is-acquired");
          obs.unobserve(e.target);
        });
      }, { threshold: 0.25 });
      mio.observe(stage);
    } else if (stage) {
      stage.classList.add("is-acquired");
    }
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
