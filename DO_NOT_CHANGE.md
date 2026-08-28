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

## 6) Rollback
The previous site is recoverable in one command:

```
git checkout pre-redesign-2026-08-28 -- index.html && git commit
```

It also remains viewable at `simonioffe.com/legacy.html` (noindexed, not
linked from the site). Do not delete `legacy.html` or the tag without
confirming the redesign is settled.
