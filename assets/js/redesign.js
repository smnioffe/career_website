/* Behaviour for simonioffe.com (index.html): the network graphics and
   their motion, the portfolio sets, the resume table of contents, scroll
   reveal and the progress bar. */
(function () {
  "use strict";

  var SCROLL_REVEAL = true;

  /* Generative lines-and-dots networks on every canvas[data-net].

     Each canvas is a "field": a seeded hub-and-spoke network of dots and
     links, drawn in the section's palette and kept clear of the text around
     it. The fields are animated from one loop by a slow sweep (see `sweep`
     below). With motion off — prefers-reduced-motion — every field is drawn
     once at rest.

     Scrolling lifts the networks: the faster the page moves, the faster the
     animation clock runs (SPEED at rest, up to SCROLL_SPEED for a fast
     scroll) and the slightly wider each dot's drift. When the scroll stops,
     both ease back to rest over about a second rather than snapping. */
  function initNetworks() {
    const canvases = Array.prototype.slice.call(document.querySelectorAll("canvas[data-net]"));
    if (!canvases.length) return;

    const SPEED = 1.25;        // resting time scale
    const SCROLL_SPEED = 4.5;  // time scale at FAST_SCROLL and above
    const DRIFT_LIFT = .3;     // extra drift width at a fast scroll (+30%)
    /* How the lift follows the scroll. It starts on the very first frame the
       page moves: the page's speed is only lightly smoothed (over JITTER
       seconds, to steady frame-to-frame noise) and the lift jumps straight up
       to match it -- an earlier version averaged first and read as a delayed
       start. On the way down it coasts, easing back over SETTLE, so the
       motion carries on a little past the end of the scroll. The speed maps
       to a 0..1 lift on a curve that rises quickly at first: a gentle scroll
       gets a noticeable part of the lift, a fast one all of it. */
    const FAST_SCROLL = 1800;  // px/s of page movement that gives the full lift
    const LIFT_CURVE = .7;     // <1 favours gentle scrolls
    const JITTER = .03;        // s, smoothing of the page's per-frame speed
    const SETTLE = .4;         // s, time constant coasting back after a scroll
    const WIDEN = .07;         // s, easing of the drift's width, so it never jumps
    const CYCLE = 25;          // seconds of animation time per sweep pass
    /* The cursor nudge, on fields marked data-net-repel. Dots within REPEL_R
       of a mouse or pen pointer drift away from it, by up to REPEL_PUSH at the
       centre and nothing at the rim, and settle home once it moves on. It runs
       on real time, not the animation clock, so scrolling does not quicken it. */
    const REPEL_R = 140;       // px, reach of the cursor's influence
    const REPEL_PUSH = 19;     // px, largest displacement, right under it
    const REPEL_IN = .14;      // s, time constant moving away
    const REPEL_OUT = .5;      // s, time constant settling back

    /* Ink, warm greys, and an orange, blue and green spread around the colour
       wheel -- the site's rust, slate and moss, a touch brighter. The dark set
       is the same family lifted for the Contact section's near-black. */
    const PAL = {
      light: { nodes: [["#1f1d1a", .22], ["#4b4641", .12], ["#a39a8f", .15], ["#c65d2a", .19], ["#336ea9", .16], ["#68834a", .16]], ink: [42, 39, 35], accent: [198, 93, 42] },
      dark: { nodes: [["#f2ece2", .3], ["#a89e93", .2], ["#8b8177", .08], ["#d4733d", .18], ["#6b95c9", .13], ["#8fa86a", .11]], ink: [242, 236, 226], accent: [214, 125, 70] }
    };
    Object.keys(PAL).forEach((m) => {
      PAL[m].rgb = {};
      PAL[m].nodes.forEach((c) => { const v = parseInt(c[0].slice(1), 16); PAL[m].rgb[c[0]] = [v >> 16, (v >> 8) & 255, v & 255]; });
    });
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
       chosen from seven candidates; its maths is unchanged, except that the
       drift is scaled by driftAmp, which is 1 at rest and widens a little
       while the page scrolls. */
    let driftAmp = 1;
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
          const driftX = Math.sin(t * 0.3 + n.p[1] * Math.PI * 2) * 8 * driftAmp;
          const driftY = Math.cos(t * 0.4 + n.p[2] * Math.PI * 2) * 8 * driftAmp;
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
      this.band = parseFloat(cv.getAttribute("data-net-band") || (this.anchor === "top-right" ? ".42" : ".5"));
      /* Motion is authored in px for the hero. Smaller fields declare a
         shorter link reach, and k scales displacement to match, so a 300px
         column does not get a 1440px hero's amplitude. */
      this.k = Math.max(.5, Math.min(1, this.linkMax / 150));
      this.repel = cv.hasAttribute("data-net-repel");
      this.S = { w: 0, h: 0, nodes: [], links: [], store: {} };
    }

    /* The layout: a structured, hub-and-spoke network rather than a mesh.
       A few large hubs, spaced evenly, each fan straight spokes out to smaller
       dots -- mostly downward on the fields that hang from the top -- and some
       of those dots branch again, so the shape reads as a tree. Hubs join
       their nearest hubs with slightly darker lines, a few dots bridge to a
       neighbouring cluster, and fields that hang from the top also get rays
       entering from just above the frame and a faint scatter below the band.
       Dots are kept a little apart so none sit on top of each other.

       The seeded sequence is load-bearing: it is what makes the graphic the
       same on every visit. Per-node extras (p) come from a second generator
       so they cannot disturb it. */
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
      /* Every field is built hanging from an edge: the hero and Contact from
         the top, and the column fills from the bottom -- they are built the
         same way and flipped, so they rise under the text instead of
         crossing it. */
      const fill = this.anchor === "fill";
      let right = this.anchor === "top-right";
      /* u scales every length to the field: 1 for the hero, about .6 for a
         narrow column, so a small field is a smaller network, not a crowd. */
      const u = Math.max(.55, Math.min(1, Math.sqrt(w * h) / 900));
      const pad = fill ? Math.min(22, Math.min(w, h) * .07) : 0;
      /* A column fill keeps below the column's text: it measures where the
         last text block ends and builds only in the space under it. */
      let free = h;
      if (fill && cv.parentElement) {
        const box = cv.getBoundingClientRect();
        let bottom = box.top;
        Array.prototype.forEach.call(cv.parentElement.children, (el) => {
          if (el !== cv) bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
        });
        free = Math.max(h * .2, box.bottom - bottom - 24);
      }
      /* Text to keep clear of, in canvas px: every line of text in the
         field's section or column, padded by M -- about as far as the motion
         (drift, sweep and cursor push together) can carry a dot. No dot is
         placed on these and no line crosses them. When a line of text runs
         across the middle of a top field (a phone), the network spreads over
         the full width and down through the gaps beside the text. */
      const keep = [], M = 22, box = cv.getBoundingClientRect();
      let wide = false;
      const scope = fill ? cv.parentElement : this.section;
      if (scope && document.createRange && window.NodeFilter) {
        const walk = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT), range = document.createRange();
        for (let t = walk.nextNode(); t; t = walk.nextNode()) {
          if (!t.nodeValue.trim()) continue;
          range.selectNodeContents(t);
          const rs = range.getClientRects();
          for (let i = 0; i < rs.length; i++) {
            const r = rs[i];
            if (!r.width || !r.height) continue;
            const k = [r.left - box.left - M, r.top - box.top - M, r.right - box.left + M, r.bottom - box.top + M];
            if (k[2] < 0 || k[3] < 0 || k[0] > w || k[1] > h) continue;
            /* Column fills are built upside down and flipped at the end. */
            keep.push(fill ? [k[0], h - k[3], k[2], h - k[1]] : k);
            if (k[0] < w * .4 && k[2] > w * .6) wide = true;   // a line across the middle
          }
        }
      }
      if (!fill && wide) right = false;
      const tailCap = fill ? free - 8 : h * (wide ? .8 : .66);
      /* On a narrow screen the band reaches further down, through the gaps
         beside the text, so the network is not all piled along the top. */
      const BH = fill ? free * .6 : wide ? tailCap * .78 : Math.min(h * this.band, tailCap * .7);
      const tailMax = fill ? tailCap : Math.min(BH * 1.95, tailCap);
      const onText = (x, y, r) => {
        for (let i = 0; i < keep.length; i++) {
          const k = keep[i];
          if (x + r > k[0] && x - r < k[2] && y + r > k[1] && y - r < k[3]) return true;
        }
        return false;
      };
      /* Whether the segment p-q passes through any kept-clear box (slab test). */
      const crossesText = (px, py, qx, qy) => {
        for (let i = 0; i < keep.length; i++) {
          const k = keep[i];
          let t0 = 0, t1 = 1;
          const dx = qx - px, dy = qy - py;
          const edges = [[-dx, px - k[0]], [dx, k[2] - px], [-dy, py - k[1]], [dy, k[3] - py]];
          let hit = true;
          for (let e = 0; e < 4 && hit; e++) {
            const a = edges[e][0], b = edges[e][1];
            if (a === 0) { if (b < 0) hit = false; }
            else {
              const t = b / a;
              if (a < 0) { if (t > t1) hit = false; else if (t > t0) t0 = t; }
              else { if (t < t0) hit = false; else if (t < t1) t1 = t; }
            }
          }
          if (hit) return true;
        }
        return false;
      };
      const nodes = [], links = [], seen = {};
      /* The hero keeps to the right of the headline and fades toward it. */
      const xAt = () => right ? w * 1.02 - Math.pow(rnd(), 1.75) * w * .72 : -w * .02 + rnd() * w * 1.04;
      const clampX = (x) => fill ? Math.max(pad, Math.min(w - pad, x)) : x;
      const clampY = (y) => Math.max(fill ? pad : -6, Math.min(tailMax, y));
      const alphaAt = (x, y) => Math.max(.1, Math.min(1, 1 - Math.max(0, y / BH - .55) * .62)) *
        (right ? Math.max(.08, Math.min(1, (x / w - .3) / .32)) : 1);
      const reach = (n) => n.r + (n.kind === "target" ? 3 * u : n.kind === "open" ? 1.5 * u : 0);
      const clear = (x, y, r) => {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (n.kind !== "hidden" && Math.hypot(n.hx - x, n.hy - y) < reach(n) + r + 5 * u) return false;
        }
        return true;
      };
      const add = (x, y, r, kind, c) => {
        const d = Math.max(0, Math.min(1, y / (BH * 1.9)));
        nodes.push({
          hx: x, hy: y, x: x, y: y, r: r * u * (1 - .38 * d), kind: kind, c: c, a: alphaAt(x, y),
          p: [extra(), extra(), extra(), extra()],
          glow: 0, scale: 1, am: 1, ox: 0, oy: 0
        });
        return nodes.length - 1;
      };
      /* Tries a few spots for a new dot and keeps the first that is clear of
         every dot so far; gives up (returns -1) rather than overlap. */
      const place = (spot, r, kind, c) => {
        for (let t = 0; t < 6; t++) {
          const xy = spot();
          /* A spot past the band's edge (or a column's) is skipped, not pushed
             onto the edge -- pushing lines dots up in a row along it. */
          if (xy[1] > tailMax || (fill && (xy[0] < pad || xy[0] > w - pad || xy[1] < pad * 1.5))) continue;
          const x = clampX(xy[0]), y = clampY(xy[1]), rr = r * u + (kind === "target" ? 3 * u : 0);
          if (!onText(x, y, rr) && clear(x, y, rr)) return add(x, y, r, kind, c);
        }
        return -1;
      };
      const STR = { spine: .5, ray: .27, spoke: .38, bridge: .2 };
      const link = (i, j, type) => {
        if (i < 0 || j < 0 || i === j) return;
        const key = i < j ? i + "_" + j : j + "_" + i;
        if (seen[key]) return;
        seen[key] = 1;
        const p = nodes[i], q = nodes[j], len = Math.hypot(p.hx - q.hx, p.hy - q.hy);
        if (keep.length && crossesText(p.hx, p.hy, q.hx, q.hy)) return;
        /* Weaving round text on a phone, a long line reads as a stray. */
        if (wide && len > 200 * u) return;
        const fall = type === "ray" ? 1 : Math.max(.45, 1 - len / (420 * u));
        /* A few spokes from blue and orange hubs take their hub's colour. */
        const tint = type === "spoke" && (p.c === colors[3][0] || p.c === colors[4][0]) && (i * 7 + j) % 5 === 0 ? this.pal.rgb[p.c] : null;
        links.push({ a: i, b: j, base: STR[type] * fall * Math.min(p.a, q.a), w: type === "spine" ? 1 : .8, tint: tint, am: 1, glow: 0 });
      };

      // 1) hubs, spaced by best-candidate sampling
      /* A short band (a phone, where the network keeps above the text) gets
         proportionally fewer hubs, so it reads as an airy strip, not a crowd. */
      const thin = fill ? 1 : Math.max(.6, Math.min(1, tailMax / 240));
      const nH = Math.max(3, Math.round(w / (fill ? 72 : 78) * this.density * (wide ? BH / 260 : thin)));
      const hubs = [];
      for (let k = 0; k < nH; k++) {
        let best = null, bd = -1;
        for (let t = 0; t < 14; t++) {
          const x = clampX(xAt()), y = BH * ((fill ? .16 : -.08) + Math.pow(rnd(), 1.15) * (fill ? .84 : 1));
          if (onText(x, y, 12 * u)) continue;
          let md = 1e9;
          for (let q = 0; q < hubs.length; q++) md = Math.min(md, Math.hypot((nodes[hubs[q]].hx - x) * .8, nodes[hubs[q]].hy - y));
          if (md > bd) { bd = md; best = [x, y]; }
        }
        const big = Math.pow(rnd(), 1.6);
        const kind = rnd() < .26 ? "target" : "dot", c = pick();
        if (best) hubs.push(add(best[0], best[1], 4.5 + big * 10.5, kind, c));
      }
      // 2) spokes out to satellites; some satellites branch again
      const sats = [];
      for (let q = 0; q < hubs.length; q++) {
        const hi = hubs[q], hn = nodes[hi], m = 4 + Math.floor(rnd() * 6);
        for (let k = 0; k < m; k++) {
          const kr = rnd(), kind = kr < .07 ? "target" : kr < .12 ? "open" : "dot";
          const r = 1.6 + Math.pow(rnd(), 2.2) * 4.8, c = pick();
          const si = place(() => {
            const ang = Math.PI / 2 + (rnd() - .5) * Math.PI * 1.7;
            const dist = (24 + Math.pow(rnd(), 1.5) * 135) * u;
            return [hn.hx + Math.cos(ang) * dist, hn.hy + Math.sin(ang) * dist * .9];
          }, r, kind, c);
          if (si < 0) continue;
          sats.push(si); link(hi, si, "spoke");
          if (rnd() < .2) {
            const sn = nodes[si];
            sn.r = Math.max(sn.r, (3 + rnd() * 2.8) * u);
            const mm = 2 + Math.floor(rnd() * 3);
            for (let z = 0; z < mm; z++) {
              const ci = place(() => {
                const a2 = Math.PI / 2 + (rnd() - .5) * Math.PI * 1.5;
                const d2 = (18 + rnd() * 60) * u;
                return [sn.hx + Math.cos(a2) * d2, sn.hy + Math.sin(a2) * d2 * .9];
              }, 1.6 + Math.pow(rnd(), 2.5) * 4, "dot", pick());
              link(si, ci, "spoke");
            }
          }
        }
      }
      // 3) the backbone: each hub to its two nearest hubs, sometimes a long ray
      for (let q = 0; q < hubs.length; q++) {
        const hi = hubs[q];
        const near = hubs.filter((o) => o !== hi)
          .map((o) => [Math.hypot(nodes[o].hx - nodes[hi].hx, nodes[o].hy - nodes[hi].hy), o])
          .sort((x, y) => x[0] - y[0]);
        for (let k = 0; k < Math.min(2, near.length); k++) link(hi, near[k][1], "spine");
        if (rnd() < .35 && near[3]) link(hi, near[3][1], "ray");
      }
      // 4) a few satellites bridge to a neighbouring cluster
      for (let q = 0; q < sats.length; q++) {
        if (rnd() > .38) continue;
        const si = sats[q];
        let best = -1, bd = 95 * u;
        for (let o = 0; o < sats.length; o++) {
          if (o === q) continue;
          const d = Math.hypot(nodes[sats[o]].hx - nodes[si].hx, nodes[sats[o]].hy - nodes[si].hy);
          if (d < bd && d > 14 * u) { bd = d; best = sats[o]; }
        }
        link(si, best, "bridge");
      }
      {
        // 5) unseen sources just above the frame, so rays enter from off-canvas
        const nSrc = fill ? 0 : Math.max(1, Math.round(w / 260));
        for (let k = 0; k < nSrc; k++) {
          const src = add(xAt(), -(24 + rnd() * 40) * u, 3, "hidden", colors[0][0]);
          const near = [];
          for (let j = 0; j < nodes.length; j++) {
            if (j === src || nodes[j].hy <= 0 || nodes[j].kind === "hidden") continue;
            const d = Math.hypot(nodes[j].hx - nodes[src].hx, nodes[j].hy - nodes[src].hy);
            if (d < 260 * u) near.push([d, j]);
          }
          near.sort((x, y) => x[0] - y[0]);
          const m = 3 + Math.floor(rnd() * 3);
          for (let z = 0; z < Math.min(m, near.length); z++) link(src, near[z][1], "ray");
        }
        // 6) a faint scatter below the band, loosely tied in
        const nTail = Math.round(w / 55 * this.density * (fill ? .5 : thin));
        for (let k = 0; k < nTail; k++) {
          const kr = rnd(), kind = kr < .1 ? "open" : kr < .17 ? "target" : "dot";
          const ti = place(() => [xAt(), BH * .75 + Math.pow(rnd(), 1.1) * (tailMax - BH * .75)], 1.6 + Math.pow(rnd(), 2) * 5.5, kind, pick());
          if (ti < 0 || rnd() >= .7) continue;
          let best = -1, bd = 170 * u;
          for (let j = 0; j < nodes.length; j++) {
            const n = nodes[j];
            if (j === ti || n.kind === "hidden" || n.hy > nodes[ti].hy) continue;
            const d = Math.hypot(n.hx - nodes[ti].hx, n.hy - nodes[ti].hy);
            if (d < bd && d > 12 * u) { bd = d; best = j; }
          }
          link(best, ti, "spoke");
        }
      }
      if (fill) nodes.forEach((n) => { n.hy = n.y = h - n.hy; });
      S.nodes = nodes; S.links = links; S.store = {}; S.u = u;
      /* Small dots first, so a hub is never drawn under its own spokes' ends. */
      S.order = nodes.map((n, i) => i).sort((x, y) => nodes[x].r - nodes[y].r);
      sweep.init(S);
    };

    Field.prototype.render = function () {
      const S = this.S, g = this.g, nodes = S.nodes, links = S.links, u = S.u;
      const ink = this.pal.ink, ac = this.pal.accent, acs = ac.join(",");
      if (!S.w) return;
      g.clearRect(0, 0, S.w, S.h);
      g.lineCap = "round";

      for (let k = 0; k < links.length; k++) {
        const L = links[k], p = nodes[L.a], q = nodes[L.b];
        const alpha = L.base * L.am;
        if (alpha <= .01) continue;
        const c = L.tint || ink;
        if (L.glow > 0) {
          const t = Math.min(1, L.glow);
          g.strokeStyle = "rgba(" + mix(c[0], ac[0], t) + "," + mix(c[1], ac[1], t) + "," + mix(c[2], ac[2], t) + "," + Math.min(1, alpha * (1 + t * 1.4)).toFixed(3) + ")";
          g.lineWidth = L.w + t * .5;
        } else {
          g.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha.toFixed(3) + ")";
          g.lineWidth = L.w;
        }
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      }

      for (let o = 0; o < S.order.length; o++) {
        const n = nodes[S.order[o]], r = n.r * n.scale;
        if (n.kind === "hidden") continue;
        if (n.glow > .01) {
          const gr = r * 2.6 + 7;
          const grad = g.createRadialGradient(n.x, n.y, r * .5, n.x, n.y, gr);
          grad.addColorStop(0, "rgba(" + acs + "," + (n.glow * .5 * Math.min(1, n.a + .25)).toFixed(3) + ")");
          grad.addColorStop(1, "rgba(" + acs + ",0)");
          g.globalAlpha = 1; g.fillStyle = grad;
          g.beginPath(); g.arc(n.x, n.y, gr, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = Math.max(0, Math.min(1, n.a * n.am + n.glow * .3));
        g.fillStyle = n.c; g.strokeStyle = n.c;
        if (n.kind === "target") {
          /* A ring with a solid core. */
          g.lineWidth = Math.max(1.3, r * .2);
          g.beginPath(); g.arc(n.x, n.y, r + 3 * u, 0, Math.PI * 2); g.stroke();
          g.beginPath(); g.arc(n.x, n.y, Math.max(1.4, r * .5), 0, Math.PI * 2); g.fill();
        } else if (n.kind === "open") {
          g.lineWidth = Math.max(1.4, r * .3);
          g.beginPath(); g.arc(n.x, n.y, r + 1.5 * u, 0, Math.PI * 2); g.stroke();
        } else {
          g.beginPath(); g.arc(n.x, n.y, r, 0, Math.PI * 2); g.fill();
        }
      }
      g.globalAlpha = 1;
    };

    Field.prototype.step = function (t, dt) {
      const nodes = this.S.nodes, k = this.k;
      sweep.update(this.S, t);
      if (k !== 1) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x = n.hx + (n.x - n.hx) * k; n.y = n.hy + (n.y - n.hy) * k;
        }
      }
      if (this.repel) this.nudge(dt);
      this.render();
    };

    /* Pushes each dot away from the pointer, measured from where the sweep has
       put it this frame. The push is eased per dot, so the field parts softly
       instead of snapping, and with no pointer every offset eases back to 0. */
    Field.prototype.nudge = function (dt) {
      const nodes = this.S.nodes, k = this.k, R = REPEL_R * k, R2 = R * R, push = REPEL_PUSH * k;
      let px = 0, py = 0;
      const on = pointer.on;
      if (on) {
        const box = this.cv.getBoundingClientRect();
        px = pointer.x - box.left; py = pointer.y - box.top;
      }
      const eIn = 1 - Math.exp(-dt / REPEL_IN), eOut = 1 - Math.exp(-dt / REPEL_OUT);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let tx = 0, ty = 0;
        if (on) {
          const dx = n.x - px, dy = n.y - py, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > .01) {
            const f = 1 - d2 / R2, d = Math.sqrt(d2);
            tx = dx / d * f * f * push; ty = dy / d * f * f * push;
          }
        }
        const e = tx * tx + ty * ty > n.ox * n.ox + n.oy * n.oy ? eIn : eOut;
        n.ox += (tx - n.ox) * e; n.oy += (ty - n.oy) * e;
        n.x += n.ox; n.y += n.oy;
      }
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

    /* The pointer, in viewport px. Mouse and pen only: a finger on a phone is
       scrolling, and dots jumping out from under it would read as a glitch. */
    const pointer = { x: 0, y: 0, on: false };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") { pointer.on = false; return; }
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true;
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { pointer.on = false; });
    window.addEventListener("blur", () => { pointer.on = false; });

    const fields = canvases.map((cv) => new Field(cv));
    let running = false, raf = 0, last = 0, T = 0, avg = 0, vel = 0, lastY = 0;

    function frame(now) {
      raf = 0;
      if (!running) return;
      const raw = Math.min(.05, Math.max(0, (now - last) / 1000));
      last = now;
      /* The page's speed this frame, capped so a jump to an anchor reads as
         a fast scroll rather than an enormous one, averaged, then followed. */
      const y = window.scrollY || 0;
      const v = raw > 0 ? Math.min(6000, Math.abs(y - lastY) / raw) : 0;
      lastY = y;
      avg += (v - avg) * (1 - Math.exp(-raw / JITTER));
      if (avg > vel) vel = avg;
      else vel += (avg - vel) * (1 - Math.exp(-raw / SETTLE));
      if (vel < 2) vel = 0;
      const lift = Math.pow(Math.min(1, vel / FAST_SCROLL), LIFT_CURVE);
      driftAmp += (1 + DRIFT_LIFT * lift - driftAmp) * (1 - Math.exp(-raw / WIDEN));
      if (Math.abs(driftAmp - 1) < .001 && !lift) driftAmp = 1;
      T += raw * (SPEED + (SCROLL_SPEED - SPEED) * lift);
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        if (f.visible && f.S.w) f.step(T, raw);
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
        running = true; last = performance.now(); lastY = window.scrollY || 0; avg = 0; vel = 0; driftAmp = 1;
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
    /* Web fonts can rewrap text without resizing a canvas, and every field
       is built to keep clear of the text around it. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => fields.forEach((f) => { f.build(); if (!running) f.render(); }));
    }
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

  /* Years of experience, counted from the year in data-years-since: 2012
     gives 14 in 2026 and 15 from 1 January 2027 (the visitor's local date).
     data-years-format="word" spells it out, capitalised if the HTML's own
     fallback text is; otherwise it is a numeral. The fallback text in the
     HTML is what crawlers and no-JS visitors read, so refresh it now and then. */
  function initYears() {
    const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
      "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const words = (n) => n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    const now = new Date().getFullYear();
    document.querySelectorAll("[data-years-since]").forEach(function (el) {
      const n = now - parseInt(el.getAttribute("data-years-since"), 10);
      if (!(n > 0 && n < 100)) return;
      if (el.getAttribute("data-years-format") === "word") {
        const w = words(n), cap = /^[A-Z]/.test(el.textContent);
        el.textContent = cap ? w.charAt(0).toUpperCase() + w.slice(1) : w;
      } else {
        el.textContent = String(n);
      }
    });
  }

  function boot() {
    initYears();
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
