# Shared publication checks

After changing a page or running a metadata generator, run:

```sh
node tools/prepare-site.mjs
```

The eight tour builders run this step automatically. It supplies consistent sharing metadata, favicon links, responsive image markup, keyboard skip links, citation guidance and the shared privacy/reuse navigation. Existing DOI targets, paper titles and source records remain authoritative in `papers.json`. A fixed Zenodo record is distinct from an all-versions DOI. When known, keep a manuscript date separate from its publication date.

The responsive WebP files are reading-size derivatives of the existing artwork. Keep the original atlas image for the explicit 8K viewer and download. Social previews are 1200 by 630 JPEGs in `assets/social/`.

Before publishing, check internal file and fragment links; confirm each content page has a title, description, viewport, icon and social image; check sitemap entries and the root 404 page. Review the homepage and all eight tours at narrow, tablet and desktop widths, keyboard focus and reduced-motion settings. Exercise the atlas load failure, retry, zoom, arrow-key pan and Escape behavior. Do not treat a DOI timeout or bot block as evidence that a paper link is dead.

Serve the repository root when previewing locally: navigation and shared assets intentionally use root-relative URLs, including on the custom 404 page. GitHub Pages serves `404.html` with a 404 status for missing paths.
