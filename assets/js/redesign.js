/* Behaviour for simonioffe.com (index.html): the network graphics and
   their motion, the portfolio sets, the resume table of contents, scroll
   reveal and the progress bar. */
(function () {
  "use strict";

  var SCROLL_REVEAL = true;

  /* Generative lines-and-dots networks on every canvas[data-net].

     Each canvas is a "field": a seeded layout of dots and links, drawn in the
     section's palette. The fields are animated from one loop by a slow sweep
     (see `sweep` below). With motion off — prefers-reduced-motion — every
     field is drawn once at rest, which is the original static graphic.

     Time is the only thing the loop scales. SPEED is the resting pace, and
     scrolling adds to it briefly (SCROLL_BOOST), so the networks quicken
     while the page moves and settle back afterwards. */
  function initNetworks() {
    const canvases = Array.prototype.slice.call(document.querySelectorAll("canvas[data-net]"));
    if (!canvases.length) return;

    const SPEED = 1.25;        // resting time scale
    const SCROLL_BOOST = 1.2;  // extra at a brisk scroll: SPEED * (1 + 1.2) at most
    const BRISK = 1400;        // px/s that counts as a brisk scroll
    const CYCLE = 25;          // seconds of animation time per sweep pass

    const PAL = {
      light: { nodes: [["#1c1a17", .42], ["#a09789", .2], ["#b35f34", .14], ["#4a6fa5", .13], ["#6b7f4f", .11]], ink: [28, 26, 23], accent: [179, 95, 52] },
      dark: { nodes: [["#f2ece2", .35], ["#a89e93", .3], ["#b35f34", .2], ["#8b8177", .15]], ink: [242, 236, 226], accent: [201, 121, 63] }
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    const lcg = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const mix = (a, b, t) => Math.round(a + (b - a) * t);

    /* The motion: a soft, wide band sweeps diagonally across each field on a
       25-second cycle. Dots and links inside the band warm toward the accent,
       swell slightly and shift along the band's axis; everything also drifts
       a few pixels on its own slow orbit so the field is never frozen between
       passes. The band starts and ends a full width outside the layout, so
       its influence is zero at the wrap and the loop has no seam.

       The sweep was written by Gemini CLI against this engine's contract and
       chosen from seven candidates; its maths is unchanged. */
    const sweep = {
      init(S) {
        const angle = Math.PI * -0.25;
        const st = S.store;
        st.nx = Math.cos(angle);
        st.ny = Math.sin(angle);
        st.nd = [];
        let minProj = Infinity, maxProj = -Infinity;
        for (let i = 0; i < S.nodes.length; i++) {
          const n = S.nodes[i];
          const proj = n.hx * st.nx + n.hy * st.ny;
          st.nd.push({ proj: proj });
          if (proj < minProj) minProj = proj;
          if (proj > maxProj) maxProj = proj;
        }
        st.bandWidth = 250;
        st.minProj = minProj - st.bandWidth;
        st.maxProj = maxProj + st.bandWidth;
        st.range = st.maxProj - st.minProj;
      },
      update(S, t) {
        const st = S.store;
        const progress = (t % CYCLE) / CYCLE;
        const currentProj = st.minProj + progress * st.range;
        for (let i = 0; i < S.nodes.length; i++) {
          const n = S.nodes[i];
          const dist = Math.abs(st.nd[i].proj - currentProj);
          let influence = 0;
          if (dist < st.bandWidth) influence = 0.5 * (1 + Math.cos(Math.PI * dist / st.bandWidth));
          const driftX = Math.sin(t * 0.3 + n.p[1] * Math.PI * 2) * 8;
          const driftY = Math.cos(t * 0.4 + n.p[2] * Math.PI * 2) * 8;
          const shift = influence * 18;
          n.x = n.hx + driftX - st.ny * shift;
          n.y = n.hy + driftY + st.nx * shift;
          n.glow = influence * 0.6;
          n.scale = 1 + influence * 0.3;
          n.am = 1 + influence * 0.5;
        }
        for (let i = 0; i < S.links.length; i++) {
          const link = S.links[i];
          const linkInf = (S.nodes[link.a].glow + S.nodes[link.b].glow) * 0.5;
          link.glow = linkInf;
          link.am = 1 + linkInf * 0.8;
        }
      }
    };

    function Field(cv) {
      const mode = cv.getAttribute("data-net-mode") === "dark" ? "dark" : "light";
      this.cv = cv;
      this.g = cv.getContext("2d");
      /* Visibility is judged by the section, not the canvas: the hero canvas
         is pinned (position:fixed), so it is "in the viewport" forever, even
         after its section has scrolled away and clipped it. */
      this.section = cv.closest("section,header") || cv;
      this.visible = true;
      this.pal = PAL[mode];
      this.anchor = cv.getAttribute("data-net-anchor") || "top";
      this.density = parseFloat(cv.getAttribute("data-net-density") || "1");
      this.seed = parseInt(cv.getAttribute("data-net-seed") || "7", 10) || 7;
      this.linkMax = parseFloat(cv.getAttribute("data-net-link") || "150");
      this.maxLinks = parseInt(cv.getAttribute("data-net-links") || "3", 10);
      /* Motion is authored in px for the hero. Smaller fields declare a
         shorter link reach, and k scales displacement to match, so a 300px
         column does not get a 1440px hero's amplitude. */
      this.k = Math.max(.5, Math.min(1, this.linkMax / 150));
      this.S = { w: 0, h: 0, nodes: [], links: [], store: {} };
    }

    /* The layout. The seeded sequence here is load-bearing: it is what makes
       the graphic the same on every visit. Per-node extras (p) come from a
       second generator so they cannot disturb it. */
    Field.prototype.build = function () {
      const cv = this.cv, S = this.S;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) { S.w = 0; S.h = 0; return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
      S.w = w; S.h = h;

      const rnd = lcg(this.seed), extra = lcg(this.seed * 7919 + 17), colors = this.pal.nodes;
      const pick = () => {
        let r = rnd(), acc = 0;
        for (let k = 0; k < colors.length; k++) { acc += colors[k][1]; if (r <= acc) return colors[k][0]; }
        return colors[0][0];
      };
      const area = w * h;
      /* The node count is per-area, so a small canvas gets proportionally few.
         This floor used to be 30, which packed a 314x190 fill with five times
         the hero's density -- that is what read as chaotic. */
      const N = Math.max(8, Math.round(area / 3400 * this.density));
      const rScale = Math.max(.62, Math.min(1, Math.sqrt(area) / 560));
      const nodes = [];
      for (let i = 0; i < N; i++) {
        let x, y;
        if (this.anchor === "top-right") { x = w - Math.pow(rnd(), 1.6) * w; y = Math.pow(rnd(), 1.9) * h; }
        else if (this.anchor === "fill") {
          /* Inset from the edges so dots and rings are never sliced in half by
             the canvas boundary. */
          const pad = Math.min(20, Math.min(w, h) * 0.07);
          x = pad + rnd() * (w - pad * 2); y = pad + rnd() * (h - pad * 2);
        }
        else { x = rnd() * w; y = Math.pow(rnd(), 2.1) * h; }
        const depth = this.anchor === "top-right" ? Math.max(1 - x / w, y / h)
          : this.anchor === "fill" ? 0.58 - 0.34 * (y / h)
          : y / h;
        const r = (1.4 + Math.pow(rnd(), 3) * 5.5) * rScale;
        const ring = rnd() < 0.13;
        const c = pick();
        nodes.push({
          hx: x, hy: y, x: x, y: y,
          r: r, ring: ring, c: c, a: Math.max(.14, 1 - depth * 1.05),
          p: [extra(), extra(), extra(), extra()],
          glow: 0, scale: 1, am: 1
        });
      }
      /* Each node links to its nearest few later neighbours. The topology is
         fixed at rest; the lines stretch as the dots move. */
      const links = [];
      for (let a = 0; a < N; a++) {
        const cand = [];
        for (let b = a + 1; b < N; b++) {
          const d = Math.hypot(nodes[b].hx - nodes[a].hx, nodes[b].hy - nodes[a].hy);
          if (d > 6 && d < this.linkMax) cand.push({ b: b, d: d });
        }
        cand.sort((p, q) => p.d - q.d);
        for (let k = 0; k < Math.min(this.maxLinks, cand.length); k++) {
          links.push({ a: a, b: cand[k].b, am: 1, glow: 0 });
        }
      }
      S.nodes = nodes; S.links = links; S.store = {};
      sweep.init(S);
    };

    Field.prototype.render = function () {
      const S = this.S, g = this.g, nodes = S.nodes, links = S.links;
      const ink = this.pal.ink, ac = this.pal.accent, acs = ac.join(",");
      if (!S.w) return;
      g.clearRect(0, 0, S.w, S.h);

      for (let k = 0; k < links.length; k++) {
        const L = links[k], p = nodes[L.a], q = nodes[L.b];
        const dist = Math.hypot(q.x - p.x, q.y - p.y);
        /* The cutoff is on the link's own strength, before any brightening,
           and at exactly this value: it decides which of the faintest lines
           exist at all, so it is part of the resting graphic. */
        const base = Math.min(p.a, q.a) * (1 - dist / (this.linkMax * 1.1)) * .9;
        if (base <= .02) continue;
        const alpha = base * .55 * L.am;
        if (L.glow > 0) {
          const t = Math.min(1, L.glow);
          g.strokeStyle = "rgba(" + mix(ink[0], ac[0], t) + "," + mix(ink[1], ac[1], t) + "," + mix(ink[2], ac[2], t) + "," + Math.min(1, alpha * (1 + t * 1.4)).toFixed(3) + ")";
          g.lineWidth = .8 + t * .5;
        } else {
          g.strokeStyle = "rgba(" + ink[0] + "," + ink[1] + "," + ink[2] + "," + alpha.toFixed(3) + ")";
          g.lineWidth = .8;
        }
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i], r = n.r * n.scale;
        if (n.glow > .01) {
          const gr = r * 2.6 + 7;
          const grad = g.createRadialGradient(n.x, n.y, r * .5, n.x, n.y, gr);
          grad.addColorStop(0, "rgba(" + acs + "," + (n.glow * .5 * Math.min(1, n.a + .25)).toFixed(3) + ")");
          grad.addColorStop(1, "rgba(" + acs + ",0)");
          g.globalAlpha = 1; g.fillStyle = grad;
          g.beginPath(); g.arc(n.x, n.y, gr, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = Math.max(0, Math.min(1, n.a * n.am + n.glow * .3));
        g.beginPath();
        if (n.ring) {
          g.strokeStyle = n.c; g.lineWidth = 1.4;
          g.arc(n.x, n.y, r + 2.4, 0, Math.PI * 2); g.stroke();
          g.fillStyle = n.c; g.beginPath();
          g.arc(n.x, n.y, Math.max(1, r * .4), 0, Math.PI * 2); g.fill();
        } else {
          g.fillStyle = n.c;
          g.arc(n.x, n.y, r, 0, Math.PI * 2); g.fill();
        }
      }
      g.globalAlpha = 1;
    };

    Field.prototype.step = function (t) {
      const nodes = this.S.nodes, k = this.k;
      sweep.update(this.S, t);
      if (k !== 1) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x = n.hx + (n.x - n.hx) * k; n.y = n.hy + (n.y - n.hy) * k;
        }
      }
      this.render();
    };

    /* Where in its cycle the sweep should be when the page loads.

       Each pass crosses the whole layout, but in the hero only the top-right
       corner is visible — the dots fade toward the headline and the CSS mask
       hides the rest. Started from zero, the band spent its first ~11 seconds
       in the hidden bottom-left, so a visitor saw only the drift. This finds
       where the band would light the most visible dots, and starts the clock
       LEAD seconds before that: the first thing on screen is the sweep
       arriving. Only the hero is aligned; it is what a page load shows, and
       the loop's clock is shared by every field.

       Visibility is weighted by each dot's own alpha, which already encodes the
       top-right falloff, squared to track the mask's steeper fade. */
    function sweepStart(hero) {
      const LEAD = 2.5;
      if (!hero || !hero.S.w) return 0;
      const S = hero.S, st = S.store, bw = st.bandWidth;
      let best = st.minProj, bestScore = -1;
      for (let k = 0; k <= 200; k++) {
        const P = st.minProj + st.range * k / 200;
        let score = 0;
        for (let i = 0; i < S.nodes.length; i++) {
          const d = Math.abs(st.nd[i].proj - P);
          if (d < bw) score += S.nodes[i].a * S.nodes[i].a * .5 * (1 + Math.cos(Math.PI * d / bw));
        }
        if (score > bestScore) { bestScore = score; best = P; }
      }
      const t = CYCLE * (best - st.minProj) / st.range - LEAD * SPEED;
      return ((t % CYCLE) + CYCLE) % CYCLE;
    }

    const fields = canvases.map((cv) => new Field(cv));
    let running = false, raf = 0, last = 0, T = 0, boost = 0, lastY = 0;

    function frame(now) {
      raf = 0;
      if (!running) return;
      const raw = Math.min(.05, Math.max(0, (now - last) / 1000));
      last = now;
      /* Scroll velocity against BRISK. The follow rate is asymmetric: it
         catches up in about a tenth of a second, so the response feels tied
         to the hand, and takes most of a second to relax, so the motion
         glides back to its resting pace instead of dropping to it. */
      const y = window.scrollY || 0;
      const target = raw > 0 ? clamp01(Math.abs(y - lastY) / raw / BRISK) : 0;
      lastY = y;
      boost += (target - boost) * (1 - Math.exp(-raw * (target > boost ? 9 : 2.2)));
      if (boost < .001) boost = 0;
      T += raw * SPEED * (1 + SCROLL_BOOST * boost);
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        if (f.visible && f.S.w) f.step(T);
      }
      raf = requestAnimationFrame(frame);
    }

    /* Run only while something is on screen, the tab is showing, and the
       visitor has not asked for reduced motion. Otherwise hold the frame. */
    function sync() {
      const want = fields.some((f) => f.visible) && !document.hidden && !reduceMotion.matches;
      if (want && !running) {
        /* Resuming: forget the scroll that happened meanwhile, or the first
           frame would read it as one enormous flick. */
        running = true; last = performance.now(); lastY = window.scrollY || 0; boost = 0;
        raf = requestAnimationFrame(frame);
      } else if (!want && running) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    /* The pinned hero canvas sits just below the sticky nav (see .net-hero in
       redesign.css), and the nav is one row or two depending on width. */
    function setNavHeight() {
      const nav = document.querySelector(".site-nav");
      if (nav) root.style.setProperty("--nav-h", Math.round(nav.getBoundingClientRect().height) + "px");
    }

    setNavHeight();
    fields.forEach((f) => {
      f.build();
      f.render();
      let rt;
      /* A canvas resizes when the window does, when web fonts land and move
         the layout, and when a column's sibling changes height. */
      const rebuild = () => { clearTimeout(rt); rt = setTimeout(() => { f.build(); if (!running) f.render(); }, 140); };
      if (window.ResizeObserver) new ResizeObserver(rebuild).observe(f.cv);
      else window.addEventListener("resize", rebuild);
      if (window.IntersectionObserver) {
        new IntersectionObserver((es) => { f.visible = es[es.length - 1].isIntersecting; sync(); }, { threshold: 0 }).observe(f.section);
      }
    });
    window.addEventListener("resize", setNavHeight);
    document.addEventListener("visibilitychange", sync);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", () => { sync(); if (!running) fields.forEach((f) => { f.build(); f.render(); }); });
    T = sweepStart(fields.find((f) => f.cv.classList.contains("net-hero")));
    sync();
  }


  /* The link's own href is the single source of truth for which PDF is current
     -- this used to be hardcoded here as well, which is how it went stale. */
  function initResumeButtons() {
    document.querySelectorAll(".resume-open").forEach((el) => {
      el.addEventListener("click", (e) => {
        const href = el.getAttribute("href");
        if (!href) return;
        e.preventDefault();
        window.open(href, "_blank", "noopener");
      });
    });
  }

  function initProgress() {
    const bar = document.querySelector("[data-progress]");
    if (!bar) return;
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = "scaleX(" + Math.max(0, Math.min(1, p)).toFixed(4) + ")";
    };
    window.addEventListener("scroll", upd, { passive: true });
    upd();
  }

  function initReveal() {
    if (SCROLL_REVEAL === false) {
      document.querySelectorAll(".reveal").forEach((el) => el.style.setProperty("--in", "1"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.style.setProperty("--in", "1");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* Portfolio — the sets are stepped through, not scrubbed. Tabs jump straight
     to a set; the flanking arrows walk them in order and wrap, so there is
     always somewhere to go next. */
  function initPortfolio() {
    const wrap = document.querySelector("[data-pf-panels]");
    if (!wrap) return;
    const panels = Array.prototype.slice.call(wrap.querySelectorAll(".pf-panel"));
    const tabs = Array.prototype.slice.call(document.querySelectorAll(".pf-tab"));
    const prevs = Array.prototype.slice.call(document.querySelectorAll("[data-pf-prev]"));
    const nexts = Array.prototype.slice.call(document.querySelectorAll("[data-pf-next]"));
    const title = document.querySelector("[data-pf-title]");
    const counter = document.querySelector("[data-pf-counter]");
    const bar = document.querySelector("[data-pf-bar]");
    const nextLabel = document.querySelector("[data-pf-next-label]");
    if (!panels.length) return;

    const total = panels.length;
    const pad = function (n) { return String(n).padStart(2, "0"); };
    const labelAt = function (i) {
      return tabs[i] ? tabs[i].childNodes[0].textContent.trim() : "";
    };
    let idx = -1;

    function show(n) {
      const next = ((n % total) + total) % total;
      if (next === idx) return;
      idx = next;
      panels.forEach(function (p, i) { p.hidden = i !== idx; });
      tabs.forEach(function (t, i) {
        t.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
      if (title) title.textContent = labelAt(idx);
      if (counter) counter.textContent = pad(idx + 1) + " / " + pad(total);
      if (bar) bar.style.width = ((idx + 1) / total * 100).toFixed(1) + "%";
      if (nextLabel) nextLabel.textContent = "Next: " + labelAt((idx + 1) % total);
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); });
    });
    prevs.forEach(function (b) {
      b.addEventListener("click", function () { show(idx - 1); });
    });
    nexts.forEach(function (b) {
      b.addEventListener("click", function () { show(idx + 1); });
    });

    /* Arrow keys step the sets, but only while the portfolio is what you are
       looking at, and never while you are typing or tabbing through a frame. */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const sec = document.getElementById("portfolio");
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom < window.innerHeight * 0.4) return;
      e.preventDefault();
      show(e.key === "ArrowRight" ? idx + 1 : idx - 1);
    });

    /* Frames are focusable so keyboard users get the same reveal as hover;
       Enter/Space pins it open, which is also the tap behaviour on hybrids. */
    wrap.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const frame = e.target.closest && e.target.closest(".pf-frame");
      if (!frame) return;
      e.preventDefault();
      const veil = frame.querySelector(".pf-veil");
      if (!veil) return;
      const open = veil.style.opacity !== "1";
      veil.style.opacity = open ? "1" : "";
      frame.setAttribute("aria-expanded", open ? "true" : "false");
    });

    show(0);
  }


  /* Floating resume TOC — logic ported from assets/js/custom.js.
     Motion math unchanged; only the visual hooks moved from CSS classes
     to custom properties so styling can stay inline. */
  function initResumeToc() {
    const resume = document.getElementById("resume");
    if (!resume) return;

    const mqDesktop = window.matchMedia("(min-width: 901px)");
    const tocAside = resume.querySelector(".resume-toc");
    const tocNav = resume.querySelector("[data-resume-toc]");
    const tocShell = resume.querySelector(".resume-toc-shell");
    const tocTitle = resume.querySelector(".resume-toc-title");
    const experienceCard = resume.querySelector(".resume-experience-card");
    const experienceBody = experienceCard && experienceCard.querySelector(".card-body");
    if (!tocAside || !tocNav || !tocShell || !tocTitle || !experienceCard || !experienceBody) return;

    const companyEls = Array.prototype.slice.call(resume.querySelectorAll("[data-resume-company]"));
    if (!companyEls.length) return;

    function slugify(str) {
      return String(str || "").trim().toLowerCase().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    function ensureId(el, fallback) {
      if (!el) return fallback;
      if (el.id) return el.id;
      el.id = fallback;
      return el.id;
    }
    function clamp01(n) { return Math.max(0, Math.min(1, n)); }
    function hiddenFromTop(y, top, band) {
      if (y <= top - band) return 1;
      if (y < top) return clamp01((top - y) / band);
      return 0;
    }
    function hiddenFromBottom(y, bottom, band) {
      if (y <= bottom) return 0;
      if (y < bottom + band) return clamp01((y - bottom) / band);
      return 1;
    }
    function escapeHtml(str) {
      return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    const tocModel = [];
    const roleToCompanyId = new Map();

    companyEls.forEach(function (companyEl) {
      const companyName =
        companyEl.getAttribute("data-resume-company") ||
        (companyEl.querySelector("img[alt]") && companyEl.querySelector("img[alt]").getAttribute("alt")) ||
        "Company";
      const companyId = ensureId(companyEl, "exp-" + slugify(companyName));
      let roleEls = Array.prototype.slice.call(companyEl.querySelectorAll("[data-resume-role]"));
      if (!roleEls.length) roleEls = Array.prototype.slice.call(companyEl.querySelectorAll("h6.title"));
      const isSingleRoleCompany = roleEls.length === 1;
      const roles = roleEls.map(function (roleEl) {
        const roleName = roleEl.getAttribute("data-resume-role") || roleEl.textContent.trim();
        const roleId = ensureId(roleEl, "role-" + slugify(companyName) + "-" + slugify(roleName));
        roleToCompanyId.set(roleId, companyId);
        return { name: roleName, id: roleId, scrollId: isSingleRoleCompany ? companyId : roleId };
      });
      tocModel.push({ name: companyName, id: companyId, roles: roles });
    });

    let html = '<ul class="resume-toc-list">';
    tocModel.forEach(function (company) {
      html +=
        '<li class="toc-company">' +
        '<a href="#' + escapeHtml(company.id) + '" data-scroll-target="' + escapeHtml(company.id) +
        '" data-active-target="' + escapeHtml(company.id) + '" data-toc-type="company" data-act="0">' +
        escapeHtml(company.name) + "</a>";
      if (company.roles && company.roles.length) {
        html += '<ul class="toc-roles">';
        company.roles.forEach(function (role) {
          html +=
            '<li class="toc-role">' +
            '<a href="#' + escapeHtml(role.scrollId || role.id) + '" data-scroll-target="' + escapeHtml(role.scrollId || role.id) +
            '" data-active-target="' + escapeHtml(role.id) + '" data-toc-type="role" data-act="0">' +
            escapeHtml(role.name) + "</a></li>";
        });
        html += "</ul>";
      }
      html += "</li>";
    });
    html += "</ul>";
    tocNav.innerHTML = html;

    const tocLinks = Array.prototype.slice.call(tocNav.querySelectorAll("a[data-scroll-target]"));
    tocLinks.forEach(function (a, index) {
      a.style.setProperty("--toc-link-index", String(index));
    });

    const roleLinkByRoleId = new Map();
    const companyLinkByCompanyId = new Map();
    tocLinks.forEach(function (a) {
      const tocType = a.getAttribute("data-toc-type");
      const activeTarget = a.getAttribute("data-active-target");
      if (!activeTarget) return;
      if (tocType === "role") roleLinkByRoleId.set(activeTarget, a);
      if (tocType === "company") companyLinkByCompanyId.set(activeTarget, a);
    });

    const tocEntries = tocLinks.map(function (a) {
      return { link: a, target: document.getElementById(a.getAttribute("data-scroll-target")) };
    });

    tocNav.addEventListener("mouseover", function (e) {
      const a = e.target.closest && e.target.closest("a[data-scroll-target]");
      if (a) a.style.setProperty("--hov", "1");
    });
    tocNav.addEventListener("mouseout", function (e) {
      const a = e.target.closest && e.target.closest("a[data-scroll-target]");
      if (a) a.style.setProperty("--hov", "0");
    });

    tocNav.addEventListener("click", function (e) {
      const a = e.target.closest && e.target.closest("a[data-scroll-target]");
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("data-scroll-target");
      const target = document.getElementById(id);
      if (!target) return;
      const y = window.scrollY + target.getBoundingClientRect().top - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    });

    const roleElsAll = Array.prototype.slice.call(resume.querySelectorAll("[data-resume-role]"));
    const activeSet = new Set();
    let activeRoleId = null;
    let activeCompanyId = null;

    function clearActive(link) {
      if (!link) return;
      link.setAttribute("data-act", "0");
      link.style.setProperty("--act", "0");
    }
    function setActiveRole(roleId) {
      if (!roleId || roleId === activeRoleId) return;
      clearActive(roleLinkByRoleId.get(activeRoleId));
      clearActive(companyLinkByCompanyId.get(activeCompanyId));
      activeRoleId = roleId;
      activeCompanyId = roleToCompanyId.get(roleId) || null;
      const roleLink = roleLinkByRoleId.get(activeRoleId);
      const companyLink = companyLinkByCompanyId.get(activeCompanyId);
      [roleLink, companyLink].forEach(function (l) {
        if (!l) return;
        l.setAttribute("data-act", "1");
        l.style.setProperty("--act", "1");
      });
    }

    const activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry || !entry.target || !entry.target.id) return;
          if (entry.isIntersecting) activeSet.add(entry.target);
          else activeSet.delete(entry.target);
        });
        if (!activeSet.size) return;
        const candidates = Array.from(activeSet);
        candidates.sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });
        setActiveRole(candidates[0].id);
      },
      { threshold: 0, rootMargin: "-40% 0px -55% 0px" }
    );
    roleElsAll.forEach(function (el) { if (el && el.id) activeObserver.observe(el); });

    const STICKY_TOP = 176;
    const BOUNDARY_MARGIN = 10;
    const VIEWPORT_BOTTOM_OFFSET = 24;
    const CONTAINER_FADE_BAND = 92;
    const LINE_BAND = 26;
    let raf = 0;
    let lastScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    function updateTocMotion() {
      if (!mqDesktop.matches) {
        tocAside.style.setProperty("--toc-vis", "0");
        tocAside.setAttribute("data-visible", "0");
        tocAside.style.top = "";
        tocLinks.forEach(function (a) {
          a.style.setProperty("--toc-hidden", "1");
          a.style.setProperty("--toc-shift-sign", "-1");
        });
        return;
      }

      const firstRole = roleElsAll[0];
      const lastCompany = companyEls[companyEls.length - 1];
      if (!firstRole || !lastCompany) return;

      const firstRoleRect = firstRole.getBoundingClientRect();
      const lastCompanyRect = lastCompany.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollingDown = scrollY >= lastScrollY;
      lastScrollY = scrollY;
      const viewportTopBoundary = STICKY_TOP;
      const viewportBottomBoundary = viewportHeight - VIEWPORT_BOTTOM_OFFSET;
      const contentTop = firstRoleRect.top;
      const contentBottom = lastCompanyRect.bottom;
      const inWindow = contentBottom > viewportTopBoundary && contentTop < viewportBottomBoundary;

      const topBoundary = viewportTopBoundary;
      let bottomBoundary = viewportBottomBoundary;
      if (contentBottom < viewportBottomBoundary) {
        bottomBoundary = Math.max(topBoundary + 16, contentBottom - BOUNDARY_MARGIN);
      }

      const enterFromBelow = clamp01((bottomBoundary - contentTop) / CONTAINER_FADE_BAND);
      const leaveFromAbove = clamp01((contentBottom - topBoundary) / CONTAINER_FADE_BAND);
      const containerVisible = inWindow ? Math.min(enterFromBelow, leaveFromAbove) : 0;
      const vis = containerVisible > 0.02 ? 1 : 0;
      tocAside.style.setProperty("--toc-vis", String(vis));
      tocAside.setAttribute("data-visible", String(vis));

      const tocHeight = tocShell.offsetHeight || 0;
      const minTop = STICKY_TOP;
      const maxTop = Math.min(bottomBoundary - tocHeight, contentBottom - BOUNDARY_MARGIN - tocHeight);
      let desiredTop = maxTop < minTop ? maxTop : Math.max(minTop, Math.min(STICKY_TOP, maxTop));
      desiredTop = Math.max(8, desiredTop);
      if (!inWindow) tocAside.style.top = STICKY_TOP + "px";
      else tocAside.style.top = desiredTop.toFixed(1) + "px";

      const tocRect = tocShell.getBoundingClientRect();
      const topEdgeActive = contentTop > viewportTopBoundary;
      const bottomEdgeActive = contentBottom < viewportBottomBoundary;
      const topShift = Math.max(0, contentTop - viewportTopBoundary);
      const mirrorAxis = tocRect.top + tocRect.bottom;

      function metricForTopEdge(y) {
        if (!topEdgeActive) return y;
        if (scrollingDown) return mirrorAxis - y - topShift;
        return y - topShift;
      }

      const titleCenter = tocRect.top + 8;
      const titleTopHidden = topEdgeActive ? hiddenFromTop(metricForTopEdge(titleCenter), topBoundary, LINE_BAND) : 0;
      const titleBottomHidden = bottomEdgeActive ? hiddenFromBottom(titleCenter, bottomBoundary, LINE_BAND) : 0;
      tocTitle.style.setProperty("--toc-title-hidden", Math.max(titleTopHidden, titleBottomHidden).toFixed(3));

      tocEntries.forEach(function (entry) {
        if (!entry || !entry.link || !entry.target) return;
        const rowRect = entry.link.getBoundingClientRect();
        const rowCenter = rowRect.top + rowRect.height * 0.5;
        const topHidden = topEdgeActive ? hiddenFromTop(metricForTopEdge(rowCenter), topBoundary, LINE_BAND) : 0;
        const bottomHidden = bottomEdgeActive ? hiddenFromBottom(rowCenter, bottomBoundary, LINE_BAND) : 0;
        const hidden = Math.max(topHidden, bottomHidden);
        entry.link.style.setProperty("--toc-hidden", hidden.toFixed(3));
        entry.link.style.setProperty("--toc-shift-sign", "-1");
      });
    }

    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        updateTocMotion();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateTocMotion);
    window.addEventListener("load", updateTocMotion, { once: true });
    if (mqDesktop && mqDesktop.addEventListener) {
      mqDesktop.addEventListener("change", updateTocMotion);
    }
    updateTocMotion();
    setTimeout(updateTocMotion, 400);
  }

  function boot() {
    initResumeToc();
    initPortfolio();
    initNetworks();
    initReveal();
    initProgress();
    initResumeButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
