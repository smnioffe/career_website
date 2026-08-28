# resume-personalsite

Static portfolio site for `simonioffe.com`, deployed by GitHub Pages from
`master` (root path).

## Structure

- `index.html` — the site. A single self-contained page, edited directly.
- `assets/css/redesign.css` — shared styles, states and media queries.
- `assets/js/redesign.js` — nav, portfolio, resume TOC, scroll reveal and the
  generative network graphics.
- `legacy.html` — archived copy of the pre-2026 site, kept for rollback and
  comparison. Noindexed and not linked from the live site.

`index.html` is no longer generated from `src/templates`. That pipeline was
retired when the redesign shipped — see `DO_NOT_CHANGE.md`.

## Local preview

```
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`. Check responsive behavior at a real viewport
width, not in a scaled preview pane.

## Rollback

The site as it stood before the redesign is tagged `pre-redesign-2026-08-28`:

```
git checkout pre-redesign-2026-08-28 -- index.html && git commit
```
