# Shared publication checks

After changing a page or running a metadata generator, run:

```sh
node tools/prepare-site.mjs
```

The existing tour builders run this step automatically. It supplies consistent sharing metadata, favicon links, responsive image markup, keyboard skip links, citation guidance and the shared privacy/reuse navigation. Existing DOI targets, paper titles and source records remain authoritative in `papers.json`. A fixed Zenodo record is distinct from an all-versions DOI. When known, keep a manuscript date separate from its publication date.

The responsive WebP files are reading-size derivatives of the existing artwork. Keep the original atlas image for the explicit 8K viewer and download. Social previews are 1200 by 630 JPEGs in `assets/social/`.

Before publishing, check internal file and fragment links; confirm each content page has a title, description, viewport, icon and social image; check sitemap entries and the root 404 page. Review the homepage and all nine tours at narrow, tablet and desktop widths, keyboard focus and reduced-motion settings. Exercise the atlas load failure, retry, zoom, arrow-key pan and Escape behavior. Do not treat a DOI timeout or bot block as evidence that a paper link is dead.

Serve the repository root when previewing locally: navigation and shared assets intentionally use root-relative URLs, including on the custom 404 page. GitHub Pages serves `404.html` with a 404 status for missing paths.

The neutrino tour is maintained directly in `neutrinos/`. Check its pure teaching models with:

```sh
node tools/check-neutrino-model.cjs
node tools/check-neutrino-detector.cjs
```

The vectorlike exhibit uses `vectorlike.css` and `vectorlike.js`. The detector interaction uses `detector.css`, `detector-model.js` and `detector-tour.js`; load the model before its controller. After edits, check every step and detector layer with the keyboard, change trigger/reconstruction/analysis settings, and verify the narrow layout and reduced-motion behavior. With JavaScript disabled, both exhibits must retain their complete static explanations and hide inactive controls. Their readiness classes must appear only after initialization. The detector fixture is an invented teaching sample, not a prediction of experimental efficiency or event losses; keep its source notes beside the implementation.

Run the shared preparation step after edits. The compact card and sharing artwork are built by `node tools/build-neutrino-assets.cjs` with Sharp available.
