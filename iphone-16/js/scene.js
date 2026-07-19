import * as THREE from "three";
import {
  createPhoneModel,
  createChipModel,
  createCameraMacroModel,
  createButtonMacroModel,
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

  // Models
  const phone = createPhoneModel("ultramarine");
  scene.add(phone);

  const chip = createChipModel();
  chip.visible = false;
  scene.add(chip);

  const cameraMacro = createCameraMacroModel("ultramarine");
  cameraMacro.visible = false;
  scene.add(cameraMacro);

  const buttonMacro = createButtonMacroModel("ultramarine");
  buttonMacro.visible = false;
  scene.add(buttonMacro);

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
    if (buttonMacro.userData.scan) {
      buttonMacro.userData.scan.material.opacity = 0.3 + Math.sin(t * 3) * 0.2;
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
    [phone, chip, cameraMacro, buttonMacro].forEach((g) => g.userData.dispose?.());
    renderer.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    models: { phone, chip, cameraMacro, buttonMacro },
    start,
    stop,
    dispose,
  };
}
