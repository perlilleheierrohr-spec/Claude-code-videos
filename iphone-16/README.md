# iPhone 16 — concept product page

A single-page concept site for the iPhone 16 base model, built to explore
the skills added to this repo: real-time 3D (Three.js) driven by
scroll (GSAP + ScrollTrigger), styled with the **sleek** and
**perspective** design skills, guided by **ui-ux-pro-max**.

Every phone, chip, camera, and button you see is a procedurally generated
3D model built from primitives — there are no downloaded assets or
Apple 3D files. Three.js and GSAP are vendored locally under `vendor/`
(no CDN dependency, no build step).

## Run locally

```bash
cd iphone-16
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

- `index.html` — page sections + import map for `three`
- `css/styles.css` — dark, cinematic theme (design tokens from the
  `sleek` skill)
- `js/phone.js` — procedural iPhone/chip/camera/button 3D models
- `js/scene.js` — Three.js renderer, camera, lighting, render loop
- `js/main.js` — GSAP ScrollTrigger camera choreography, drag-to-rotate,
  and the color-swatch picker
- `vendor/` — self-hosted `three` and `gsap` builds

This is a fan-made demo for practicing 3D web techniques — not an
official Apple product or site.
