# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server
npm run typecheck  # vue-tsc --build — the primary correctness gate
npm run build      # typecheck, then production build to dist/
npm run preview    # serve dist/ (needed to exercise the service worker)
npm run screenshots # re-shoot the PWA install screenshots (needs a build first)
```

There is no test runner and no linter installed. `npm run typecheck` is the fastest
verification for a change; `npm run build` additionally proves the PWA manifest and
precache still generate. Do not add a test/lint toolchain unless asked.

## Architecture

A single-screen Vue 3 + Vite PWA that shows where a note sits on a musical staff.

**All domain logic lives in one pure function.** `staffLayout(letter, octave)` in
`src/lib/note-position.ts` returns a `StaffLayout` containing everything needed to
draw the screen: resolved clef, the prose sentence, and every SVG coordinate
(line positions, ledger lines, note position, clef glyph placement). Components are
dumb renderers — `staff-view.vue` binds layout fields straight onto SVG attributes and
computes nothing. New staff behaviour belongs in `note-position.ts`, not in a template.

Key model details in that file:

- Pitch is a **diatonic index**: 7 steps per octave, C0 = 0, so `MIDDLE_C = 28`. Accidentals
  do not exist in this model. `BOTTOM_LINE` gives each clef's bottom staff line in the
  same index space, and `offset = index - BOTTOM_LINE[clef]` drives both the geometry
  and the `describe()` prose (even offset = line, odd = space).
- **Clef is derived, never chosen.** `clefFor()` picks bass below middle C, treble at or
  above. A user-facing clef selector was deliberately removed; don't reintroduce one.
- High notes **slide the whole staff down** rather than overflowing: `shift` keeps the
  topmost ledger line below `TOP_MARGIN`, and `height` grows for low notes. The SVG
  `viewBox` height is therefore per-layout, not constant.

**Colors come from Tailwind v4 theme tokens, never literal hex.** `src/style.css` defines
`--color-ink`, `--color-paper`, `--color-rule`, `--color-quiet`, `--color-accent`,
`--color-accent-soft`, `--color-mark` in an `@theme` block; utilities like `text-ink`,
`fill-ink`, `bg-accent-soft` compile to those vars. Dark mode works by **re-declaring the
same variables** in an unlayered `prefers-color-scheme` block, so `dark:` variants are not
used anywhere. There is no `tailwind.config` — Tailwind v4 is configured entirely in CSS
via the `@tailwindcss/vite` plugin.

Clef glyphs are Unicode musical symbols rendered in the `font-music` family (Google Fonts
"Noto Music"), which is why `vite.config.ts` gives Google Fonts its own workbox runtime
cache — without it the glyphs vanish offline.

## Conventions

- Components are kebab-case single-file components under `src/components/`; `App.vue` owns
  all state (two `ref`s) and passes a computed layout down.
- Choice controls use `aria-pressed` buttons driven by Tailwind's `aria-pressed:` variant,
  not radio inputs. `choice-row.vue` is generic over `string | number` — reuse it rather
  than writing another picker.
- Adding a static asset to `public/` only needs its extension present in the workbox
  `globPatterns` in `vite.config.ts`, or it will not be precached. Three settings there exist
  to stop the same file being precached twice, since every duplicate pair had identical
  revisions and only inflated the entry count: there is deliberately no `includeAssets` list
  (everything in `public/` is copied into the build output, where `globPatterns` already
  matches it), `includeManifestIcons` is `false` (the icons are `public/` files too), and
  `webmanifest` is absent from `globPatterns` (the plugin always precaches the manifest it
  generates). `npm run build` prints the entry count — it should equal the number of files.
- `favicon.svg` and the `theme-color` meta tags in `index.html` duplicate the palette hex
  values because neither an SVG favicon nor a meta tag can read the app's stylesheet. If the
  palette changes in `src/style.css`, update both, and regenerate `favicon.ico` from the SVG.
  The two `theme-color` tags are `media`-gated so browser chrome follows the light and dark
  palettes; the manifest's single `theme_color` cannot vary and stays light.
- After a visible UI change, re-run `npm run screenshots`. The manifest's `screenshots`
  entries declare exact pixel `sizes`, and Chrome silently ignores any entry whose
  dimensions disagree with the file. The script forces the light colour scheme because
  headless Chrome otherwise reports a dark `prefers-color-scheme`, which would clash with
  the manifest's light `background_color`.
