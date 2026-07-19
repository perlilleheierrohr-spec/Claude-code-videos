import { createScene } from "./scene.js";
import { IPHONE_COLORS } from "./phone.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.getElementById("webgl");
const scene = createScene(canvas);
scene.start();

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------------
   Text reveal — independent of the 3D scene, so it can run immediately.
   --------------------------------------------------------------------- */

if (prefersReducedMotion) {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
}

/* Pause the render loop when the tab is hidden. */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) scene.stop();
  else scene.start();
});

/* ---------------------------------------------------------------------
   Everything below depends on the licensed iPhone 5s model finishing
   its (async) load, so it's wired up once scene.ready resolves.
   --------------------------------------------------------------------- */

scene.ready.then(() => {
  const { phone, chip, cameraMacro, touchIdMacro } = scene.models;
  const groups = { phone, chip, cameraMacro, touchIdMacro };
  let activeGroupName = "phone";

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* -------------------------------------------------------------------
     Scroll-driven camera choreography. Each section owns a ScrollTrigger
     that (a) shows/hides its 3D model group via onToggle and (b) scrubs a
     camera + rotation interpolation via onUpdate. Only the hero is
     pinned, per GSAP guidance on not over-pinning a scroll page.
     ------------------------------------------------------------------- */

  const sectionConfigs = [
    {
      id: "top",
      group: "phone",
      pin: true,
      from: { camPos: [0, 0, 6.4], rotY: -0.6, explode: 1 },
      to: { camPos: [0, 0, 4.6], rotY: 0.35, explode: 0 },
    },
    {
      id: "design",
      group: "phone",
      from: { camPos: [1.9, 0.2, 4.5], rotY: 0.35, explode: 0 },
      to: { camPos: [-1.7, 0.15, 4.1], rotY: 4.4, explode: 0.85 },
    },
    {
      id: "camera",
      group: "cameraMacro",
      from: { camPos: [0, 0, 4.4], rotY: -0.7 },
      to: { camPos: [0, 0, 2.5], rotY: 0.9 },
    },
    {
      id: "chip",
      group: "chip",
      from: { camPos: [0, 0.35, 3.6], rotY: -0.8, rotX: 0.55 },
      to: { camPos: [0, 0, 2.2], rotY: 1.1, rotX: 0.12 },
    },
    {
      id: "touchid",
      group: "touchIdMacro",
      from: { camPos: [1.4, 0, 3.4], rotY: -0.4 },
      to: { camPos: [0, 0, 2.0], rotY: 0.15 },
    },
    {
      id: "colors",
      group: "phone",
      from: { camPos: [0, 0, 7.2], rotY: 0, explode: 0 },
      to: { camPos: [0, 0, 6.2], rotY: 2.5, explode: 0 },
    },
  ];

  function setActiveGroup(name) {
    if (activeGroupName === name) return;
    activeGroupName = name;
    Object.entries(groups).forEach(([key, g]) => {
      g.visible = key === name;
    });
  }

  function applyFrame(cfg, progress) {
    const g = groups[cfg.group];
    scene.camera.position.set(
      lerp(cfg.from.camPos[0], cfg.to.camPos[0], progress),
      lerp(cfg.from.camPos[1], cfg.to.camPos[1], progress),
      lerp(cfg.from.camPos[2], cfg.to.camPos[2], progress)
    );
    scene.camera.lookAt(0, 0, 0);

    if (cfg.from.rotY !== undefined) {
      g.rotation.y = lerp(cfg.from.rotY, cfg.to.rotY, progress);
    }
    if (cfg.from.rotX !== undefined) {
      g.rotation.x = lerp(cfg.from.rotX, cfg.to.rotX, progress);
    }
    if (cfg.from.explode !== undefined && g.userData.setExplode) {
      g.userData.setExplode(lerp(cfg.from.explode, cfg.to.explode, progress));
    }
  }

  sectionConfigs.forEach((cfg, i) => {
    const el = document.getElementById(cfg.id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: cfg.pin ? "top top" : "top 78%",
      end: cfg.pin ? "+=100%" : "bottom 22%",
      pin: !!cfg.pin && !prefersReducedMotion,
      scrub: prefersReducedMotion ? false : 1,
      refreshPriority: -i,
      onToggle: (self) => {
        if (self.isActive) setActiveGroup(cfg.group);
      },
      onUpdate: (self) => {
        applyFrame(cfg, self.progress);
      },
      onEnter: () => applyFrame(cfg, prefersReducedMotion ? 1 : 0),
    });
  });

  // Keep the deep-black canvas from visually fighting the specs/CTA content.
  ScrollTrigger.create({
    trigger: "#specs",
    start: "top 60%",
    end: "top 20%",
    scrub: prefersReducedMotion ? false : 1,
    onUpdate: (self) => {
      canvas.style.opacity = String(lerp(1, 0.25, self.progress));
    },
  });
  ScrollTrigger.create({
    trigger: "#colors",
    start: "bottom 80%",
    end: "bottom 40%",
    onLeaveBack: () => {
      canvas.style.opacity = "1";
    },
  });

  ScrollTrigger.refresh();

  /* -------------------------------------------------------------------
     Pointer drag: rotate whichever model is currently in focus.
     ------------------------------------------------------------------- */

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.style.pointerEvents = "auto";
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    const g = groups[activeGroupName];
    g.rotation.y += dx * 0.006;
    g.rotation.x = Math.max(-0.6, Math.min(0.6, g.rotation.x + dy * 0.004));
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  /* -------------------------------------------------------------------
     Color swatches
     ------------------------------------------------------------------- */

  const swatchWrap = document.querySelector(".swatches");
  const colorNameEl = document.querySelector("[data-color-name]");
  let currentColor = "silver";

  function setAccentVars(hex) {
    document.documentElement.style.setProperty("--accent", hex);
  }

  function selectColor(id) {
    const c = IPHONE_COLORS.find((x) => x.id === id);
    if (!c) return;
    currentColor = id;
    phone.userData.setColor(id);
    cameraMacro.userData.setColor(id);
    touchIdMacro.userData.setColor(id);
    setAccentVars(c.ui);
    if (colorNameEl) colorNameEl.textContent = c.name;
    swatchWrap?.querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.color === id));
    });
  }

  if (swatchWrap) {
    IPHONE_COLORS.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.style.background = `#${c.body.toString(16).padStart(6, "0")}`;
      btn.dataset.color = c.id;
      btn.setAttribute("aria-label", c.name);
      btn.setAttribute("aria-pressed", String(c.id === currentColor));
      btn.addEventListener("click", () => selectColor(c.id));
      swatchWrap.appendChild(btn);
    });
  }
  selectColor(currentColor);
});
