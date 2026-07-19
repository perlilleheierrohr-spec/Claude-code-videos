import * as THREE from "three";
import {
  loadPhoneModel,
  createChipModel,
  createCameraMacroModel,
  createTouchIdMacroModel,
} from "./phone.js";

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    32,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 8);

  // Lighting — MeshStandardMaterial/MeshPhysicalMaterial require ambient + directional
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 5, 6);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8fa4ff, 0.9);
  rim.position.set(-5, -2, -4);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-3, 2, 3);
  scene.add(fill);

  // Procedural models are ready immediately
  const chip = createChipModel();
  chip.visible = false;
  scene.add(chip);

  const cameraMacro = createCameraMacroModel("silver");
  cameraMacro.visible = false;
  scene.add(cameraMacro);

  const touchIdMacro = createTouchIdMacroModel("silver");
  touchIdMacro.visible = false;
  scene.add(touchIdMacro);

  const models = { phone: null, chip, cameraMacro, touchIdMacro };

  const ready = loadPhoneModel("silver").then((phone) => {
    scene.add(phone);
    models.phone = phone;
    return phone;
  });

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", resize);

  let raf = null;
  const clock = new THREE.Clock();

  function render() {
    const t = clock.getElapsedTime();
    chip.userData.emissiveMat &&
      (chip.userData.emissiveMat.opacity = 0.55 + Math.sin(t * 2) * 0.3);
    if (cameraMacro.userData.halo) {
      cameraMacro.userData.halo.material.opacity = 0.25 + Math.sin(t * 1.5) * 0.12;
      cameraMacro.userData.halo.rotation.z = t * 0.15;
    }
    if (touchIdMacro.userData.grooves) {
      touchIdMacro.userData.grooves.forEach((g, i) => {
        g.material.opacity = 0.2 + Math.sin(t * 1.4 + i * 0.6) * 0.15;
      });
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  }

  function start() {
    if (!raf) render();
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function dispose() {
    stop();
    window.removeEventListener("resize", resize);
    [models.phone, chip, cameraMacro, touchIdMacro].forEach((g) => g?.userData.dispose?.());
    renderer.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    models,
    ready,
    start,
    stop,
    dispose,
  };
}
