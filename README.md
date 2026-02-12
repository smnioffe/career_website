# resume-personalsite

Static portfolio site for `simonioffe.com`.

## Refactored authoring workflow

The deployable site is still a static `index.html` + assets, but the Experience
section now has a maintainable source structure:

- `src/templates/index.template.html` - full page template
- `src/partials/experience-card-body.html` - Experience section source
- `scripts/build-site.mjs` - builds `index.html` from template + partials

## Commands

- Build page from source: `npm run build`
- Local preview (example): `python3 -m http.server 4173 --bind 127.0.0.1`

## Reference snapshot

A baseline copy of the working site is preserved in:

- `reference/current-working-2026-02-05/`
