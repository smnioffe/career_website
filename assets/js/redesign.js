/* Career site redesign — staged, not yet live.
   Ported from the Claude Design handoff "Simon Ioffe Site.dc.html".
   The design tool wrapped this logic in a DCLogic component; here it is a
   plain IIFE with the component's props baked in at their defaults
   (accent + display face are set inline on [data-site] in the markup). */
(function () {
  "use strict";

  var SCROLL_REVEAL = true;

  /* Generative lines-and-dots networks (palette-matched) drawn on canvas[data-net] */
  function initNetworks() {
    const draw = (cv) => {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mode = cv.getAttribute("data-net-mode") || "light";
      const anchor = cv.getAttribute("data-net-anchor") || "top";
      const density = parseFloat(cv.getAttribute("data-net-density") || "1");
      let seed = parseInt(cv.getAttribute("data-net-seed") || "7", 10) || 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const colors = mode === "dark"
        ? [["#f2ece2", .35], ["#a89e93", .3], ["#b35f34", .2], ["#8b8177", .15]]
        : [["#1c1a17", .42], ["#a09789", .2], ["#b35f34", .14], ["#4a6fa5", .13], ["#6b7f4f", .11]];
      const pick = () => {
        let r = rnd(), acc = 0;
        for (let k = 0; k < colors.length; k++) { acc += colors[k][1]; if (r <= acc) return colors[k][0]; }
        return colors[0][0];
      };
      const area = w * h;
      /* The node count is per-area, so a small canvas gets proportionally few.
         This floor used to be 30, which packed a 314x190 fill with five times
         the hero's density -- that is what read as chaotic. */
      const N = Math.max(8, Math.round(area / 3400 * density));
      /* Link reach and dot size are fixed pixel values, so they cover far more
         of a small canvas than a large one. Both are tunable per canvas; the
         defaults leave the large ones exactly as they were. */
      const linkMax = parseFloat(cv.getAttribute("data-net-link") || "150");
      const maxLinks = parseInt(cv.getAttribute("data-net-links") || "3", 10);
      const rScale = Math.max(.62, Math.min(1, Math.sqrt(area) / 560));
      const nodes = [];
      for (let i = 0; i < N; i++) {
        let x, y;
        if (anchor === "top-right") { x = w - Math.pow(rnd(), 1.6) * w; y = Math.pow(rnd(), 1.9) * h; }
        else if (anchor === "fill") {
          /* Inset from the edges so dots and rings are never sliced in half by
             the canvas boundary. */
          const pad = Math.min(20, Math.min(w, h) * 0.07);
          x = pad + rnd() * (w - pad * 2); y = pad + rnd() * (h - pad * 2);
        }
        else { x = rnd() * w; y = Math.pow(rnd(), 2.1) * h; }
        const depth = anchor === "top-right" ? Math.max(1 - x / w, y / h)
          : anchor === "fill" ? 0.58 - 0.34 * (y / h)
          : y / h;
        nodes.push({
          x, y,
          r: (1.4 + Math.pow(rnd(), 3) * 5.5) * rScale,
          ring: rnd() < 0.13,
          c: pick(),
          a: Math.max(.14, 1 - depth * 1.05)
        });
      }
      ctx.lineWidth = .8;
      nodes.forEach((n, i) => {
        nodes
          .map((m, j) => ({ m, d: Math.hypot(m.x - n.x, m.y - n.y), j }))
          .filter((o) => o.j > i && o.d > 6 && o.d < linkMax)
          .sort((a, b) => a.d - b.d)
          .slice(0, maxLinks)
          .forEach((o) => {
            const a = Math.min(n.a, o.m.a) * (1 - o.d / (linkMax * 1.1)) * .9;
            if (a <= .02) return;
            ctx.strokeStyle = mode === "dark"
              ? "rgba(242,236,226," + (a * .55).toFixed(3) + ")"
              : "rgba(28,26,23," + (a * .55).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(o.m.x, o.m.y);
            ctx.stroke();
          });
      });
      nodes.forEach((n) => {
        ctx.globalAlpha = n.a;
        ctx.beginPath();
        if (n.ring) {
          ctx.strokeStyle = n.c;
          ctx.lineWidth = 1.4;
          ctx.arc(n.x, n.y, n.r + 2.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = n.c;
          ctx.beginPath();
          ctx.arc(n.x, n.y, Math.max(1, n.r * .4), 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = .8;
        } else {
          ctx.fillStyle = n.c;
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };
    const all = Array.prototype.slice.call(document.querySelectorAll("canvas[data-net]"));
    const drawAll = () => all.forEach(draw);
    drawAll();
    window.addEventListener("load", drawAll, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);
    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => all.forEach(draw), 160);
    });
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
