# Dradel project instructions

## Which Dradel folder is live

The game served at <https://simonioffe.com/dradel/> lives in:

`/Users/sioffe/Projects/personal/resume-personalsite/dradel`

This directory is the deployment source of truth. It belongs to the GitHub Pages
repository for `simonioffe.com`.

The other folder:

`/Users/sioffe/Projects/personal/game/dradel`

is the separate original game project. Its `dradel.jsx` is not what the public URL
serves. Do not assume edits there are deployed. If that original is used as a
reference or edited, deliberately copy the intended changes into this live folder.

## Current file roles

- `src/Dradel.jsx` contains the game component, roster, comparison logic, UI, and animations.
- `src/index.jsx` is the production entry point. It mounts `<Dradel />` into `#root`.
- `app.js` is the generated browser bundle served by the live page.
- `index.html` is the page at `/dradel/` and loads `app.js` with a cache-busting query.
- `entry.jsx` is an older entry file. Build from `src/index.jsx`, not directly from
  `src/Dradel.jsx`; bundling only the component causes a blank live page because
  nothing mounts it.

## Product requirements accumulated from Simon

- The public URL must remain <https://simonioffe.com/dradel/>.
- Keep the game isolated under `/dradel/`; do not alter the main portfolio site's
  visible content or layout when making Dradel changes.
- Optimize for phones first, including genuinely small screens. The game must not
  look like a zoomed-out desktop page on mobile.
- Use a correct mobile viewport, fluid widths, readable type, touch-sized controls,
  safe-area spacing, compact layouts, and no horizontal overflow.
- Keep improving the UI while preserving the dark navy, brass, parchment, and
  tekhelet visual identity.
- Keep “Made by Simon Ioffe” prominent and linked back to the portfolio home page.
- Keep the dreidel animation.
- Every submitted guess must trigger the dramatic full-screen dreidel reveal:
  expand over the game, spin suspensefully, land after roughly one to two seconds,
  and clearly show whether the guess is right. Preserve tap/keyboard skipping and
  reduced-motion behavior.
- Prefer recognizable people that most players under 50 are likely to know. Avoid
  overloading the answer pool with obscure historical or “old-timey” figures.
- Maintain a large answerable pool. People imported from
  `new_answerable_jews.csv` and already marked answerable must remain eligible as
  mystery answers unless Simon explicitly says otherwise.
- Probe-only people are valid guesses for comparisons but must not become mystery
  answers merely because they are searchable.
- These requested people must remain available as guessable probes:
  Seth Green, Jason Biggs, Hank Azaria, David Duchovny, Julianna Margulies,
  B.J. Novak, Liev Schreiber, Maggie Gyllenhaal, Zach Braff, Maya Rudolph,
  Beanie Feldstein, Mayim Bialik, Alyson Hannigan, Ben Platt, Eric André,
  Tiffany Haddish, Doja Cat, Taika Waititi, Daveed Diggs, Jon Bernthal,
  Noah Schnapp, Troye Sivan, Zac Efron, Mac Miller, and Joaquin Phoenix.
- Do not restore the sentence “Many more names are guessable as probes.” The empty
  state should say only “The answer is someone widely known.” before the next line.

## Build and validation

Build the browser bundle from the mounting entry point:

```sh
esbuild dradel/src/index.jsx --bundle --minify --platform=browser --outfile=dradel/app.js
```

After source changes:

1. Rebuild `app.js` from `src/index.jsx`.
2. Change the cache-busting value on the `app.js` URL in `index.html`.
3. Test locally in a real browser at small mobile and normal mobile widths.
4. Confirm the game renders inside `#root`, has no console errors, and has no
   horizontal overflow.
5. Exercise a searchable probe, a submitted guess, the dramatic reveal, its skip
   control, and the resulting comparison row.
6. Check that the removed probe sentence is absent from both source and bundle.

## Deployment is part of completion

Always deploy after making Dradel changes unless Simon explicitly asks for a
local-only change. Stage only the intended Dradel files, commit them, push the
site's `master` branch, wait for GitHub Pages, and verify the actual public URL in
a browser. A local build or successful push alone is not completion.

Do not stage or overwrite unrelated changes elsewhere in the portfolio repository.
