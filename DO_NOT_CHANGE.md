# Hard Constraints (Do Not Break)

These are non-negotiable guardrails for future edits to this site.

Updated 2026-08-28, when the redesign replaced the previous site. The prior
version is preserved two ways: the `pre-redesign-2026-08-28` git tag, and a
live archived copy at `legacy.html`. See "Rollback" below.

## 1) Deployment Model
- Site must remain fully static and deployable via GitHub Pages.
- Pages is configured as: source `master`, path `/`, custom domain
  `simonioffe.com` (CNAME file at the repo root — do not delete it).
- No framework migration, no backend dependency, no build step required to
  deploy. What is committed at the root is what ships.

## 2) Safe Editing Workflow
- `index.html` is edited **directly**. It is no longer generated.
  The old `npm run build` / `src/templates` pipeline was retired with the
  redesign; the page is a single self-contained file with no partials to
  assemble. Do not reintroduce a generator that writes over `index.html`.
- Page-level styling lives inline on elements, as it did in the design source.
  Shared behavior and anything needing a media query lives in
  `assets/css/redesign.css`. Interaction lives in `assets/js/redesign.js`.
- Validate on `http://127.0.0.1:4173` before considering changes done.
- If uncertain, prefer no-op over risky changes.

## 3) Inline Styles Beat Stylesheet Rules
- An inline `style="..."` outranks any rule in the stylesheet, so a `:hover`,
  `:focus` or `@media` rule targeting a property that is also set inline will
  silently never apply. This has caused real bugs here twice (the portfolio
  hover reveal, and the network fills on touch devices).
- If a property needs to change under any state or breakpoint, move it out of
  the inline style and into the stylesheet.

## 4) Responsive Behavior
- The page must reach 0px horizontal overflow from 320px upward. Verify with a
  real viewport, not a scaled preview pane — a scaled pane reports the wrong
  width and will hide breakpoint bugs entirely.
- The nav collapses to two rows at ≤820px (brand + résumé button, then the
  section links). The résumé PDF button must stay reachable on mobile.
- The résumé table of contents is desktop-only. It hides below 900px — and the
  left gutter reserved for it **must** be released at the same breakpoint, or
  the whole résumé section is pushed off-screen.
- Sections carry `scroll-margin-top` so anchor jumps clear the sticky nav. The
  mobile value is larger because the nav is taller once it wraps.

## 5) Portfolio Behavior
- Images render at their **natural aspect ratio**. Do not crop them to a fixed
  ratio — one of the pieces is a portrait poster and cropping destroys it.
- Keep `width`/`height` attributes on the images so each set reserves correct
  space before its images load.
- Keep the hover/focus reveal that shows the project write-up, and keep the
  touch fallback that prints the write-up in place where hover cannot fire.
- The flanking arrows are anchored to a fixed offset, not vertically centered.
  Centering re-positions them on every set, since the sets differ in height.

- The 02 Expertise rows (`.xp-row` in `.xp-list`) and 04 Areas of Focus
  cards (`.focus-card`) have a hover state in `redesign.css`: a warm shade
  fades in, an accent rule draws under the title, the icon lifts (Expertise
  also dims the other rows). It is built only from pseudo-elements,
  transforms and opacity, because the rows' backgrounds and colours are
  inline (section 3). It applies only to mouse/pen (`hover:hover` and
  `pointer:fine`), and the pseudo-elements exist only there, so they can't
  cause phone overflow.

## 6) Network Graphics and Motion
- Every `canvas[data-net]` is drawn and animated by `initNetworks()` in
  `assets/js/redesign.js`. There is one renderer; do not add a second "static"
  one beside it, or the two will drift.
- The design (2026-11-12, at Simon's request, modelled on a reference banner
  he supplied) is a structured hub-and-spoke network, not a mesh: evenly
  spaced large hubs fan straight spokes to smaller dots, some of which branch
  again; hubs join their nearest hubs with darker lines; target rings (ring +
  core) and open rings are mixed in. The palette is ink, warm greys and a
  slightly brighter orange `#c65d2a`, blue `#336ea9` and green `#68834a` (a
  lifted set on Contact's near-black). The hero and Contact hang from the top
  edge, with rays entering from above the frame and a faint scatter below;
  the About and Résumé column fills are built the same way, flipped, and rise
  from the bottom of their column.
- Every field keeps clear of text. `build()` measures each line of text in
  the field's section or column (padded by 22px, about as far as the motion
  can carry a dot), places no dot on it, and drops any line that would cross
  it. Column fills build only in the space under their text. When a line of
  text runs across the middle of a top field (phones), the network spreads
  over the full width and down through the gaps beside the text, with fewer
  long lines -- Simon found a strip along the top alone "too compact". It
  must read as ONE network, not separate clusters: after the layout, groups
  cut apart by the text are joined back to the main network through a gap
  (adding a small routing dot when no straight line clears the text), and any
  group that still cannot be reached is dropped. Lines clear text by 8px,
  dots by 22px, and no dot sits half off a phone's edge. For
  this the hero drops its top-right fade at ≤600px, Contact's canvas
  (`.net-contact`) is 600px tall at ≤600px, and `.hero-inner` (≤820px) and
  `.contact-inner` (≤600px) get 150px of top padding. That padding and
  Contact's canvas box live in `redesign.css`, not inline, for the reason in
  section 3. Fields rebuild when web fonts load.
- Keep it quiet. Simon found the first version of this design too loud; it
  was toned down to hubs of at most ~15px radius, lighter lines, and canvas
  opacities of .46 (hero), .6 (column fills) and .5 (Contact).
- The layout comes from a seeded sequence (`data-net-seed`). The order of the
  random draws in `build()` is load-bearing: change it and the graphic changes
  on every canvas.
- The motion is the diagonal sweep at `SPEED = 1.25`. Scrolling lifts it in
  proportion to how fast the page moves: up to `SCROLL_SPEED = 4.5` at
  `FAST_SCROLL = 1800`px/s (raised from 3 at Simon's request), on a curve
  that gives a gentle scroll a visible part of it (about 2.2 at 300px/s,
  3.25 at 900px/s), plus a slightly wider
  drift (`DRIFT_LIFT = .3`, so +30% at most). The lift starts on the first
  frame the page moves -- the page speed is only lightly smoothed (`JITTER`,
  0.03s) and the lift jumps straight up to it; an earlier version averaged
  first and Simon read it as a delayed start. When the scroll stops it
  coasts back over about a second (`SETTLE = .4`s) instead of snapping. Do
  not retune any of this without being asked. At rest the drift factor is
  exactly 1.
- The page opens with NO glow (Simon's request, phones first, then desktop),
  but the sweep must still arrive within a few seconds. The animation clock
  does not start at zero: started from zero, the band spends its first ~11
  seconds under the hero's mask and the page appears to show only drift.
  `sweepStart()` finds where the band lights the most visible hero dots, backs
  off to where it first lights any (2% of that peak), and starts `LEAD = 2`s
  before that, so the glow builds in from about the second second. Phones
  (≤600px), where the network sits beside the text, start the clock at -5
  (no glow for ~4s) and keep the glow at 40% strength (`glowK = .4`) with a
  gentler swell (`swellK = .6`).
- Fields marked `data-net-repel` (the hero and the Contact field) push dots
  softly away from a mouse or pen pointer: up to `REPEL_PUSH = 19`px within
  `REPEL_R = 140`px, easing back when it moves on. Simon had it toned down
  from 22/150 to this; keep it subtle. Touch is ignored on
  purpose -- a finger is scrolling. It runs on real time, so scrolling does
  not speed it up, and it does not touch the seeded layout.
- Visitors with `prefers-reduced-motion` get the resting frame and no loop.
  Fields animate only while their section is on screen and the tab is visible.
- The hero network is pinned: `.net-hero` is `position:fixed` and `#home`
  carries `clip-path:inset(0)`, which is what confines it to the hero and lets
  the About section wipe it away. Remove either half and it breaks — the
  canvas either scrolls away or covers the whole page.
- The hero canvas's box (position, size, opacity) lives in `redesign.css`, not
  inline on the element, for the reason in section 3.
- The résumé PDF is always `assets/resume/simon-ioffe-resume.pdf`, and both
  links to it (nav button, About "Download PDF") carry `?v=` set to the first
  8 hex characters of the PDF's sha256. Update it whenever the PDF is
  replaced: the URL is otherwise unchanged, so browsers keep showing the copy
  they already saved, and the new résumé looks like it never went live.
- `index.html` loads `redesign.css` and `redesign.js` with a `?v=` stamp.
  Bump it whenever either file changes: browsers otherwise reuse a cached copy
  without asking, and a new page runs against the old script.

## 7) Rollback
The previous site is recoverable in one command:

```
git checkout pre-redesign-2026-08-28 -- index.html && git commit
```

It also remains viewable at `simonioffe.com/legacy.html` (noindexed, not
linked from the site). Do not delete `legacy.html` or the tag without
confirming the redesign is settled.

To undo only the network motion and pinning (added 2026-10-02) and keep the
redesign, revert that one commit; `git log --oneline -- assets/js/redesign.js`
finds it.
