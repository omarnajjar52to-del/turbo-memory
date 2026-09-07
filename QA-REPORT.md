# QA report — 7 September 2026

## Performed
- Rendered the site in Chrome through its local supervised preview.
- Inspected layout at nominal viewport widths 1440, 1024, 768 and 390 pixels (900px frame height; 15px scrollbar reduces content width).
- Checked document width versus scroll width: no horizontal overflow in tested widths.
- Corrected tablet headline/product overlap by reducing tablet display type.
- Corrected photograph masking proportions and increased chapter controls to 44×44px.
- Inspected the centered final hero and corrected spacing at the responsive heading line break.
- Used chapter controls for forward navigation to the line-art chapter and reverse navigation to dial. Observed the aligned traced watch and reversed chapter state.
- Opened the mobile menu, verified links and navigated to Collection.
- Opened the gallery, advanced it with ArrowRight, closed with Escape, and verified focus returned to the originating image button.
- Played the actual mobile film in the native dialog: duration 12 seconds, muted, visible native controls, no media error. Verified paused state after Escape.
- Opened the case specification accordion.
- Enabled Static reading mode and verified an unpinned stage with all seven chapter images in reading order.
- Observed intro bypass on subsequent page loads. A separate automated attempt to click Skip intro did not catch its short visibility window; do not interpret this as a successful timed Skip click test.
- Checked captured browser logs: no application console errors observed. A browser extension emitted an unrelated metadata error.
- Parsed every local HTML/CSS asset reference and anchor: no missing files, missing fragment targets or duplicate IDs.
- Ran Node syntax validation on production inline JavaScript successfully.
- Used FFprobe to verify both final encodes: exactly 12.000 seconds, H.264, 24fps, 1280×720 desktop and 540×960 mobile, no audio stream.
- A malformed intermediate desktop segment was detected, re-encoded and the desktop movie concatenated again; only the verified final movie is packaged.

## Measured bytes
See `ASSET-MANIFEST.json` for exact final byte counts. At validation, HTML plus both fonts and **all** WebP images were 725,739 bytes (an upper bound exceeding the actual hero-critical subset). Both MP4s together: 5,280,949 bytes. Video is deferred until the film dialog is opened. No Lighthouse or fabricated FPS/performance score is claimed.

## Limits / not fully tested
- No Safari, Firefox, physical mobile device or assistive-technology session was available.
- OS-level reduced-motion emulation was not exposed by this browser interface. Its shared static-rendering branch was exercised using the visible Static reading mode control; CSS preference handling was source-reviewed.
- Forced autoplay rejection, deliberate failed-media networking, storage-denial mode and no-JavaScript browser mode were source-reviewed, not fault-injected. A rejected play promise leaves the real controls visible. Failed chapter media restores the hero. Baseline markup remains readable without enhancement.
- The complete 3.8-second intro was not recorded frame by frame, and all intermediate scroll positions were not exhaustively sampled. Visual rendering and representative forward/reverse chapters were inspected.
- Source consistency is constrained by the supplied AI-looking campaign artwork/footage: some tiny dial lettering and product details vary. Original sources were preserved instead of presenting a generated replacement as exact. Hero is a masked RGB photograph, not a genuine alpha cutout. No engineering or real product specification verification was performed.
