# Shared publication checks

After changing a page or running a metadata generator, run:

```sh
node tools/prepare-site.mjs
```

The existing tour builders run this step automatically. It supplies consistent sharing metadata, favicon links, responsive image markup, keyboard skip links, citation guidance and the shared privacy/reuse navigation. Existing DOI targets, paper titles and source records remain authoritative in `papers.json`. A fixed Zenodo record is distinct from an all-versions DOI. When known, keep a manuscript date separate from its publication date.

The responsive WebP files are reading-size derivatives of the existing artwork. Keep the original atlas image for the explicit 8K viewer and download. Social previews are 1200 by 630 JPEGs in `assets/social/`.

Before publishing, check internal file and fragment links; confirm each content page has a title, description, viewport, icon and social image; check sitemap entries and the root 404 page. Review the homepage and all ten tours at narrow, tablet and desktop widths, keyboard focus and reduced-motion settings. Exercise the atlas load failure, retry, zoom, arrow-key pan and Escape behavior. Do not treat a DOI timeout or bot block as evidence that a paper link is dead.

Serve the repository root when previewing locally: navigation and shared assets intentionally use root-relative URLs, including on the custom 404 page. GitHub Pages serves `404.html` with a 404 status for missing paths.

The neutrino tour is maintained directly in `neutrinos/`. Check its pure teaching models with:

```sh
node tools/check-neutrino-model.cjs
node tools/check-neutrino-detector.cjs
```

The vectorlike exhibit uses `vectorlike.css` and `vectorlike.js`. The missing-weight and independent-symmetry exhibits use `response-lab.css` and `response-lab.js`, loaded after the shared neutrino model. Check their preset outcomes, shortfall/excess signs, independent sliders, mobile feedback and static fallback. The opening source comparison has three guided steps and optional fine adjustment; its unchanged oscillation curve is intentional. The detector interaction uses `detector.css`, `detector-model.js` and `detector-tour.js`; load the model before its controller. After edits, check every step and detector layer with the keyboard, change trigger/reconstruction/analysis settings, and verify the narrow layout and reduced-motion behavior. With JavaScript disabled, both exhibits must retain their complete static explanations and hide inactive controls. Their readiness classes must appear only after initialization. The detector fixture is an invented teaching sample, not a prediction of experimental efficiency or event losses; keep its source notes beside the implementation.

Run the shared preparation step after edits. The compact card and sharing artwork are built by `node tools/build-neutrino-assets.cjs` with Sharp available.

For foundations edits, check the Lorentz teaching model with:

```sh
node tools/check-foundation-frame.cjs
```

The origin tour follows the author's recalled questions, then introduces the formal results. `experience-lab.css` and `experience-lab.js` show lived moments, a spacetime history and Everett-style observer records. Inspection changes the highlighted record, never a physical outcome or a preferred observer. `frame-model.js` must load before `frame-lab.js`; the Lorentz exhibit preserves event identities, proper time and the spacetime interval while changing coordinates. Check presets, slider keyboard operation, reset, reciprocal boosts, and grid/readout consistency. The coordinate-hiding activity in `tour.js` retains the same identified watch events; hiding the display does not remove physical structure or demonstrate an equality-only regime. Check all views, record choices, nearby mobile feedback, source links, keyboard operation and reduced motion. With JavaScript disabled, complete static explanations remain readable and inactive controls are hidden. Keep the origin recollection distinct from the formal derivations, and retain the exact paper DOI targets.

The origin illustration is "assets/foundation-origin.svg". Rebuild its 1200 × 630 sharing image with "node tools/build-foundation-origin-assets.cjs" and Sharp available.

The physics overview is maintained directly in `physics-from-below/`. Read `tools/physics-recovery-source-notes.md` for the source map. Load `sr-model.js` before `sr-lab.js`; run `node tools/check-physics-recovery-model.cjs` after numerical changes. Review all five signal steps, four effect tabs, the observer/push distinction, and every recovery-map branch and stage. Preserve the General relativity branch name. Check the complete no-JavaScript explanations, keyboard operation, narrow layouts and the homepage card immediately after Foundations. Build its 1200 × 630 sharing image with `node tools/build-physics-recovery-assets.cjs` and Sharp available.

The overview now opens with `premetric.js` / `premetric.css`: verify both physical-relations layouts, the calibrated metric view, retained event identities, disabled rearrangement in the metric view, keyboard controls, and complete static fallback. The relation diagram illustrates a richer premetric physical construction; its layout is never a distance scale. Every branch of the recovery map starts at the premetric foundation. Check that navigation order matches the foundation, common source, branch map, SR example and effects.
