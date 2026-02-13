
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });


    $('.ti-linkedin').click(function(e) {
        e.preventDefault(); // prevent the default link behavior
        window.open('https://www.linkedin.com/in/simonioffe/'); // open the URL in a new tab
      });
      
      // Handle clicks on .ti-github
      $('.ti-github').click(function(e) {
        e.preventDefault(); // prevent the default link behavior
        window.open('https://github.com/smnioffe'); // open the URL in a new tab
      });



});

// protfolio filters
$(window).on("load", function() {
    var t = $(".portfolio-container");
    t.isotope({
        filter: ".start-item",
        animationOptions: {
            duration: 750,
            easing: "linear",
            queue: !1
        }
    }), $(".filters a").click(function() {
        $(".filters .active").removeClass("active"), $(this).addClass("active");
        var i = $(this).attr("data-filter");
        return t.isotope({
            filter: i,
            animationOptions: {
                duration: 750,
                easing: "linear",
                queue: !1
            }
        }), !1
    });
});

/**
 * Resume Floating TOC (single-page site)
 *
 * Renders a 2-level TOC (Company -> Role) that:
 * - Animates in/out as the Resume section enters/leaves view
 * - Uses a subtle parallax lag while scrolling within the Resume section
 * - Smooth-scrolls to anchors on click
 * - Highlights the active role as you scroll
 *
 * To add/update entries:
 * - Edit `src/partials/experience-card-body.html`
 * - Keep `data-resume-company` + `data-resume-role` and `id`s stable
 */
(function () {
  var resume = document.getElementById("resume");
  if (!resume) return;

  // Debug helper for automated screenshots: `?autoscroll=resume` will scroll the
  // page to the Resume section on load. No effect during normal browsing.
  try {
    var params = new URLSearchParams(window.location.search || "");
    if (params.get("autoscroll") === "resume") {
      window.addEventListener(
        "load",
        function () {
          // Defer to ensure layout is complete (Bootstrap/images).
          window.requestAnimationFrame(function () {
            resume.scrollIntoView({ behavior: "auto", block: "start" });
          });
        },
        { once: true }
      );
    }
  } catch (e) {}

  // TOC is hidden on small screens via CSS. We still initialize so it can appear
  // if the user resizes from mobile -> desktop without requiring a reload.
  var mqDesktop = window.matchMedia("(min-width: 901px)");

  var tocAside = resume.querySelector(".resume-toc");
  var tocNav = resume.querySelector("[data-resume-toc]");
  var tocShell = resume.querySelector(".resume-toc-shell");
  var tocTitle = resume.querySelector(".resume-toc-title");
  var experienceCard = resume.querySelector(".resume-experience-card");
  var experienceBody =
    experienceCard && experienceCard.querySelector(".card-body");
  if (
    !tocAside ||
    !tocNav ||
    !tocShell ||
    !tocTitle ||
    !experienceCard ||
    !experienceBody
  )
    return;

  var companyEls = Array.prototype.slice.call(
    resume.querySelectorAll("[data-resume-company]")
  );
  if (!companyEls.length) return;

  function slugify(str) {
    return String(str || "")
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function ensureId(el, fallback) {
    if (!el) return fallback;
    if (el.id) return el.id;
    el.id = fallback;
    return el.id;
  }

  function clamp01(n) {
    return Math.max(0, Math.min(1, n));
  }

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

  // Build TOC model from DOM anchors.
  var tocModel = [];
  var roleToCompanyId = new Map();

  companyEls.forEach(function (companyEl) {
    var companyName =
      companyEl.getAttribute("data-resume-company") ||
      (companyEl.querySelector("img[alt]") &&
        companyEl.querySelector("img[alt]").getAttribute("alt")) ||
      "Company";

    var companyId = ensureId(companyEl, "exp-" + slugify(companyName));

    var roleEls = Array.prototype.slice.call(
      companyEl.querySelectorAll("[data-resume-role]")
    );

    // Backward-compatible fallback: if roles aren't annotated, use h6.title.
    if (!roleEls.length) {
      roleEls = Array.prototype.slice.call(companyEl.querySelectorAll("h6.title"));
    }

    var roles = roleEls.map(function (roleEl) {
      var roleName =
        roleEl.getAttribute("data-resume-role") || roleEl.textContent.trim();
      var roleId = ensureId(
        roleEl,
        "role-" + slugify(companyName) + "-" + slugify(roleName)
      );
      roleToCompanyId.set(roleId, companyId);
      return { name: roleName, id: roleId };
    });

    tocModel.push({ name: companyName, id: companyId, roles: roles });
  });

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Render TOC
  var html = '<ul class="resume-toc-list">';
  tocModel.forEach(function (company) {
    html +=
      '<li class="toc-company">' +
      '<a href="#' +
      escapeHtml(company.id) +
      '" data-scroll-target="' +
      escapeHtml(company.id) +
      '">' +
      escapeHtml(company.name) +
      "</a>";

    if (company.roles && company.roles.length) {
      html += '<ul class="toc-roles">';
      company.roles.forEach(function (role) {
        html +=
          '<li class="toc-role">' +
          '<a href="#' +
          escapeHtml(role.id) +
          '" data-scroll-target="' +
          escapeHtml(role.id) +
          '">' +
          escapeHtml(role.name) +
          "</a>" +
          "</li>";
      });
      html += "</ul>";
    }

    html += "</li>";
  });
  html += "</ul>";
  tocNav.innerHTML = html;

  // Index TOC links for fast active-state updates.
  var tocLinks = Array.prototype.slice.call(
    tocNav.querySelectorAll("a[data-scroll-target]")
  );
  tocLinks.forEach(function (a, index) {
    a.style.setProperty("--toc-link-index", String(index));
  });

  var linkByTarget = new Map();
  tocLinks.forEach(function (a) {
    linkByTarget.set(a.getAttribute("data-scroll-target"), a);
  });

  var tocEntries = tocLinks.map(function (a) {
    var id = a.getAttribute("data-scroll-target");
    return { link: a, target: document.getElementById(id) };
  });

  // Smooth scroll on click (no heavy deps; honor scroll-margin-top on anchors).
  tocNav.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-scroll-target]");
    if (!a) return;
    e.preventDefault();

    var id = a.getAttribute("data-scroll-target");
    var target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (history && history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
  });

  // Active highlight as role headings cross a threshold line.
  var roleElsAll = Array.prototype.slice.call(
    resume.querySelectorAll("[data-resume-role]")
  );
  var activeSet = new Set();
  var activeRoleId = null;
  var activeCompanyId = null;

  function clearActive(link) {
    if (!link) return;
    link.classList.remove("is-active");
  }

  function setActiveRole(roleId) {
    if (!roleId || roleId === activeRoleId) return;

    clearActive(linkByTarget.get(activeRoleId));
    clearActive(linkByTarget.get(activeCompanyId));

    activeRoleId = roleId;
    activeCompanyId = roleToCompanyId.get(roleId) || null;

    var roleLink = linkByTarget.get(activeRoleId);
    var companyLink = linkByTarget.get(activeCompanyId);
    if (roleLink) roleLink.classList.add("is-active");
    if (companyLink) companyLink.classList.add("is-active");
  }

  var activeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry || !entry.target || !entry.target.id) return;
        if (entry.isIntersecting) activeSet.add(entry.target);
        else activeSet.delete(entry.target);
      });

      if (!activeSet.size) return;

      // Pick the role closest to the top of the viewport (within our rootMargin).
      var candidates = Array.from(activeSet);
      candidates.sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });
      setActiveRole(candidates[0].id);
    },
    {
      threshold: 0,
      // Trigger as headings cross ~40% from the top; keeps the active state stable.
      rootMargin: "-40% 0px -55% 0px",
    }
  );

  roleElsAll.forEach(function (el) {
    if (el && el.id) activeObserver.observe(el);
  });

  // TOC y-position is bounded to role-content lines (not section/card padding).
  var STICKY_TOP = 176;
  var BOUNDARY_MARGIN = 10;
  var VIEWPORT_BOTTOM_OFFSET = 24;
  var CONTAINER_FADE_BAND = 92;
  var LINE_BAND = 26;
  var raf = 0;
  var lastScrollY =
    window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

  function updateTocMotion() {
    if (!mqDesktop.matches) {
      resume.classList.remove("resume-toc-visible");
      tocAside.style.top = "";
      tocLinks.forEach(function (a) {
        a.style.setProperty("--toc-hidden", "1");
        a.style.setProperty("--toc-shift-sign", "-1");
      });
      return;
    }

    var firstRole = roleElsAll[0];
    var lastCompany = companyEls[companyEls.length - 1];
    if (!firstRole || !lastCompany) return;

    var firstRoleRect = firstRole.getBoundingClientRect();
    var lastCompanyRect = lastCompany.getBoundingClientRect();
    var viewportHeight = window.innerHeight || 1;
    var scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    var scrollingDown = scrollY >= lastScrollY;
    lastScrollY = scrollY;
    var viewportTopBoundary = STICKY_TOP;
    var viewportBottomBoundary = viewportHeight - VIEWPORT_BOTTOM_OFFSET;
    var contentTop = firstRoleRect.top;
    var contentBottom = lastCompanyRect.bottom;
    var inWindow =
      contentBottom > viewportTopBoundary && contentTop < viewportBottomBoundary;

    // Keep top guide line stable; bottom guide line becomes content-bound only
    // near exit so rows can transition out one-by-one at the bottom edge.
    var topBoundary = viewportTopBoundary;
    var bottomBoundary = viewportBottomBoundary;
    if (contentBottom < viewportBottomBoundary) {
      bottomBoundary = Math.max(
        topBoundary + 16,
        contentBottom - BOUNDARY_MARGIN
      );
    }

    // Container fades based on the same content boundaries.
    var enterFromBelow = clamp01(
      (bottomBoundary - contentTop) / CONTAINER_FADE_BAND
    );
    var leaveFromAbove = clamp01(
      (contentBottom - topBoundary) / CONTAINER_FADE_BAND
    );
    var containerVisible = inWindow ? Math.min(enterFromBelow, leaveFromAbove) : 0;
    resume.classList.toggle("resume-toc-visible", containerVisible > 0.02);

    // Keep TOC inside role-content bounds; sticky in middle, then bottom-lock
    // so TOC bottom aligns to content bottom near the section exit.
    var tocHeight = tocShell.offsetHeight || 0;
    var minTop = STICKY_TOP;
    var maxTop = Math.min(
      bottomBoundary - tocHeight,
      contentBottom - BOUNDARY_MARGIN - tocHeight
    );
    var desiredTop =
      maxTop < minTop
        ? maxTop
        : Math.max(minTop, Math.min(STICKY_TOP, maxTop));
    desiredTop = Math.max(8, desiredTop);
    if (!inWindow) {
      tocAside.style.top = STICKY_TOP + "px";
    } else {
      tocAside.style.top = desiredTop.toFixed(1) + "px";
    }

    // Line-by-line visibility is driven by each TOC row position crossing the
    // same top/bottom bounds, so rows enter/exit at those exact guide lines.
    var tocRect = tocShell.getBoundingClientRect();
    var topEdgeActive = contentTop > viewportTopBoundary;
    var bottomEdgeActive = contentBottom < viewportBottomBoundary;
    var topShift = Math.max(0, contentTop - viewportTopBoundary);
    var mirrorAxis = tocRect.top + tocRect.bottom;

    function metricForTopEdge(y) {
      if (!topEdgeActive) return y;
      // Entering from above (scrolling down): reveal top->bottom.
      if (scrollingDown) return mirrorAxis - y - topShift;
      // Leaving above (scrolling up): hide top->bottom.
      return y - topShift;
    }

    var titleCenter = tocRect.top + 8;
    var titleTopHidden = topEdgeActive
      ? hiddenFromTop(metricForTopEdge(titleCenter), topBoundary, LINE_BAND)
      : 0;
    var titleBottomHidden = bottomEdgeActive
      ? hiddenFromBottom(titleCenter, bottomBoundary, LINE_BAND)
      : 0;
    tocTitle.style.setProperty(
      "--toc-title-hidden",
      Math.max(titleTopHidden, titleBottomHidden).toFixed(3)
    );

    tocEntries.forEach(function (entry) {
      if (!entry || !entry.link || !entry.target) return;
      var rowRect = entry.link.getBoundingClientRect();
      var rowCenter = rowRect.top + rowRect.height * 0.5;
      var topHidden = topEdgeActive
        ? hiddenFromTop(metricForTopEdge(rowCenter), topBoundary, LINE_BAND)
        : 0;
      var bottomHidden = bottomEdgeActive
        ? hiddenFromBottom(rowCenter, bottomBoundary, LINE_BAND)
        : 0;
      var hidden = Math.max(topHidden, bottomHidden);
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
  // If the user resizes across the desktop breakpoint, update visibility/parallax.
  if (mqDesktop && mqDesktop.addEventListener) {
    mqDesktop.addEventListener("change", function () {
      updateTocMotion();
    });
  }

  // Initial paint
  updateTocMotion();
})();
