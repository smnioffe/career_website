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

## 6) Network Graphics and Motion
- Every `canvas[data-net]` is drawn and animated by `initNetworks()` in
  `assets/js/redesign.js`. There is one renderer; do not add a second "static"
  one beside it, or the two will drift.
- The layout comes from a seeded sequence (`data-net-seed`). The order of the
  random draws in `build()` is load-bearing: change it and the graphic changes
  on every canvas. At rest, the About, Résumé and Contact fields are
  pixel-identical to the pre-motion site — keep it that way.
- The motion is the diagonal sweep at `SPEED = 1.25`, and scrolling briefly
  adds to it (`SCROLL_BOOST`). Both were tuned by Simon; do not retune them
  without being asked.
- The animation clock does not start at zero. `sweepStart()` starts it just
  before the band reaches the visible top-right of the hero, so the sweep is
  the first thing a visitor sees. Started from zero, the band spends its first
  ~11 seconds under the hero's mask and the page appears to show only drift.
- Visitors with `prefers-reduced-motion` get the resting frame and no loop.
  Fields animate only while their section is on screen and the tab is visible.
- The hero network is pinned: `.net-hero` is `position:fixed` and `#home`
  carries `clip-path:inset(0)`, which is what confines it to the hero and lets
  the About section wipe it away. Remove either half and it breaks — the
  canvas either scrolls away or covers the whole page.
- The hero canvas's box (position, size, opacity) lives in `redesign.css`, not
  inline on the element, for the reason in section 3.

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
