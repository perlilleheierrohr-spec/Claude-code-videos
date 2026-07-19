# iPhone 5s — a retrospective

A single-page retrospective site for the iPhone 5s (2013), built to explore
the skills added to this repo: real-time 3D (Three.js) driven by
scroll (GSAP + ScrollTrigger), styled with the **sleek** and
**perspective** design skills, guided by **ui-ux-pro-max**.

The full phone model is a licensed external asset (see Credits below).
The chip, camera macro, and Touch ID macro models are procedural geometry
built for this page. Three.js and GSAP are vendored locally under
`vendor/` (no CDN dependency, no build step).

## Run locally

```bash
cd iphone-5s
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

- `index.html` — page sections + import map for `three`
- `css/styles.css` — dark, cinematic theme (design tokens from the
  `sleek` skill)
- `js/phone.js` — loads the iPhone 5s glTF model; builds the procedural
  chip/camera/Touch ID 3D models
- `js/scene.js` — Three.js renderer, camera, lighting, render loop
- `js/main.js` — GSAP ScrollTrigger camera choreography, drag-to-rotate,
  and the color-swatch picker
- `vendor/` — self-hosted `three` (+ GLTFLoader) and `gsap` builds
- `assets/iphone-5s-model/` — the licensed glTF model + textures

## Credits

Phone model: this work is based on
["IPhone 5s"](https://sketchfab.com/3d-models/iphone-5s-2a8b3bd5333d4f1899a67d5dca6b24ab)
by [Eternal Realm](https://sketchfab.com/EternalRealm), licensed under
[CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). See
`assets/iphone-5s-model/license.txt` for the original license text.

This is a fan-made retrospective for practicing 3D web techniques — not
an official Apple product, site, or active product listing.
