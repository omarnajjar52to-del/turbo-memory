# Animation storyboard — Implemented edition

## Architecture
Native document scrolling; one sticky stage; one normalized progress value `clamp(-storyRect.top / (storyHeight - viewportHeight), 0, 1)`. Desktop narrative: 760vh. Mobile: 390svh. Tablet retains pinning with reduced horizontal travel. No GSAP, smoothing library, runtime CDN or build dependency.

`requestAnimationFrame` is scheduled only after scroll, resize, media/font loading and observed stage-size changes. Product transforms have one owner: the drawing function. Position interpolation uses smoothstep `t*t*(3-2*t)` between center keyframes. This is a 2D travel path with changing direction; photographs are never stretched into articulated or unseen 3D views.

## Opening — 3.8 seconds maximum
- 0.00–0.60: editorial monogram/wordmark appears; the page shell and product poster already exist.
- 0.00–1.62: brightness rises from 0.05 to 0.35, revealing the steel. This is a lighting/brightness treatment of the supplied still, not a physically simulated moving softbox.
- 1.62–2.88: watch brightness resolves to full; it remains in the exact scroll-stage hero position.
- 2.34–3.60: clipped headline and supporting copy reveal.
- 3.00–3.60: navigation fades in.
- 3.80: intro class removed, controls settled, session flag stored.

Skip or any scrolling immediately ends the opening. A 1.2-second image-load guard bypasses it if the poster remains unavailable. It is bypassed when initialization is slow (>1.8 seconds), Save-Data is enabled, a hash is present, the page is already scrolled, the session flag exists or reduced motion is requested. No scroll lock. No intro video dependency.

## Scroll map
Coordinates are percentages of the visible stage; scale is relative to the product box. Text chapter boundaries and transform center keyframes are independent so media can travel during handoffs.

| Progress band | Chapter | Transform center keyframe (p, x, y, scale, screen angle) | Media/content |
|---|---|---|---|
| 0–.12 | Hero | (0, 64, 52, 1, -8°) | Hero right, editorial title left; emerald light |
| .12–.28 | Dial | (.20, 34, 50, 1.12, 0°) | Aligned-container crossfade to actual dial crop; copy right |
| .28–.44 | Case | (.36, 68, 51, 1.12, 4°) | Supplied side/crown detail; small surface labels |
| .44–.60 | Bracelet | (.52, 56, 48, 1.10, -4°) | Bracelet crop revealed by vertical clip mask; no fake articulation |
| .60–.76 | Technical | (.68, 53, 49, 1, 0°) | Source-aligned SVG contours; stroke draw progresses .60–.72 |
| .76–.89 | Lifestyle | (.82, 66, 50, 1.48, 0°) | Actual wrist frame; background moves to warm brown-green |
| .89–1 | Final | (1, 50, 40, .90, -5°) | Centered hero; final title/CTA below; final state remains stable at sticky release |

Media crossfades occupy .025 normalized progress after chapter boundaries. Bracelet also uses an inset mask. Technical transformation is a controlled opacity/edge reveal, **not a true geometric morph**. Its outline uses the same 499×469 source coordinates as the hero. Dial and alternate views share an aligned image container; perfect physical feature registration is limited by the independently composed supplied images.

Text switches by active chapter, with a 14px progress-driven vertical entrance. Inactive chapters are inert and aria-hidden only while enhancement is active. Small UI transitions are 220ms, gallery image hover 800ms. All scroll motion is reversible. Chapter buttons land at the chapter center rather than the start of its crossfade.

## Responsive behavior
- >=1024: full asymmetric travel, headline up to 150px, product box capped to viewport height.
- 768–1023: horizontal offset from center reduced by 20%; responsive 64–90px hero type; detail labels omitted.
- <768: product centered above copy at x50/y34, minimal angle changes, scale 1 (1.07 on wrist), 390svh narrative. Horizontal chapter controls use 44×44px hit targets. Navigation becomes a real toggle menu. Gallery reflows to one lead image plus two details. Film selects a separately reframed 9:16 encode.
- Short phones <=700px tall: smaller type/product and earlier copy position.
- Reduced motion / Static reading mode: unpinned chapters, all images/copy in order, no intro, no transform animation.

## Continuity and cleanup
A ResizeObserver, viewport resize events, document.fonts.ready and media load events recalculate the stage. Intro state is independent of scroll progress. A media failure restores the full hero for that chapter. No video scrubbing occurs. Dialog close/page hiding pauses video; visibility change pauses background playback. Pagehide cancels work and disconnects the observer; bfcache pageshow restores it.

## Known differences from requested ideal
No verified 3D camera arc, high-resolution alpha cutout, true geometric morph or new generated motion footage. Original low-resolution source art, feathered masks, supplied alternate views and edited footage are the implemented alternatives. Source reference date 28 replaces fictional date 18.
