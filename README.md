# TIME / REVEALED — Complete watch website

An English-language, independent luxury-watch design study built from the supplied Rolex image sheet and video. The real reference overrides the fictional AUREN/VERDANT 01 brief. This is not an official brand site or a store.

## View locally
1. Extract the entire ZIP.
2. Open `index.html` in a current browser. Keep the `assets` folder beside it.
3. Scroll, explore the gallery and select Play the Film. No account, API key, installation or build is needed.

If a browser restricts local media, open a terminal in the extracted folder and run `python -m http.server 8000`, then visit `http://localhost:8000`. The HTTP server is optional, not a dependency of the animation. To use GitHub Pages, upload this folder's contents to the publishing folder. All production links are relative and support a repository subdirectory.

## Included
- `index.html`: all custom CSS, JavaScript, accessible markup, inline product data and aligned technical outline.
- `assets/images`: optimized source crops, wrist footage frames and representative film posters.
- `assets/vector`: editable identity monogram, favicon and source-aligned contour study.
- `assets/fonts`: locally bundled subset WOFF fonts and their license notices.
- `assets/video`: actual silent 12-second H.264 desktop and mobile edits.
- `ANIMATION-STORYBOARD.md`, `VIDEO-BRIEF.md`, `ASSET-MANIFEST.json`, `LICENSES.md`, `QA-REPORT.md`.

## Edit
Search `product-data` in `index.html` for editable appearance notes. No price or unverified technical performance specifications are displayed. Chapter copy is ordinary HTML. The `starts`, `centers` and `positions` arrays control the motion. Gallery items are in `galleryItems`. Replace image files with the same filenames or edit their relative paths.

## Actual asset status and limitations
The approved working source is the supplied sheet's final hero panel, not a newly invented watch. Each cropped still is around 500 pixels wide. They have not been enlarged and labeled native high resolution. Fine dial lettering and identity variations already present in the supplied artwork/footage remain. No claim of verified product accuracy is made.

Two image-generation attempts were rejected because they altered microtext and returned a baked checkerboard instead of true transparency. The live site uses the original photograph with a feathered CSS mask. `watch-hero.webp` is **not alpha-transparent**. There is no 3D model or unseen camera rotation; all tilts are explicitly two-dimensional.

The SVG is an aligned visible-surface contour extraction, not an engineering drawing, exploded mechanism or geometric morph. The film is an edited combination of real supplied footage and still images, not newly generated live-action footage. The inaccurate baked-in model title at the end of the supplied video was excluded. The input video was 8 seconds at 3840×2160; delivery films are 12 seconds at 1280×720 and 540×960, 24fps, with no audio stream. See the manifest for per-file provenance.

## Accessibility and fallbacks
Skip intro, native anchor links, visible keyboard focus, mobile menu, image dialog with arrow-key controls, native film controls and Escape-to-close dialogs. A footer Static reading mode control makes all seven chapters available in order. System reduced motion selects the same unpinned layout automatically. Core content and images remain readable without JavaScript; dialogs require JavaScript. No purchase, reservation or delivery service is simulated.
