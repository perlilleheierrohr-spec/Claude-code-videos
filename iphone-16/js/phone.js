// Procedural iPhone-16-inspired 3D models built from Three.js primitives.
// No external model files or Apple assets are used — every mesh here is
// generated geometry, styled to evoke the real product's proportions.

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const IPHONE_COLORS = [
  { id: "black", name: "Black", frame: 0x3a3b3e, back: 0x26272a, ui: "#b9bbc0" },
  { id: "white", name: "White", frame: 0xefece0, back: 0xe6e2d4, ui: "#f2f0e6" },
  { id: "pink", name: "Pink", frame: 0xf3d8dd, back: 0xf6dfe4, ui: "#f6b8c4" },
  { id: "teal", name: "Teal", frame: 0x9fc0ba, back: 0xaecdc7, ui: "#7fd6c9" },
  { id: "ultramarine", name: "Ultramarine", frame: 0x6c80d6, back: 0x7c8fdc, ui: "#7e90ee" },
];

const BODY = { w: 1.48, h: 3.0, d: 0.17, r: 0.17 };

function disc(radius, segments = 32) {
  return new THREE.CircleGeometry(radius, segments);
}

/** Shared geometries reused across every model instance to keep GPU buffer count low. */
const shared = {
  lensRing: new THREE.TorusGeometry(0.1, 0.014, 12, 28),
  lensGlass: disc(0.086, 28),
  dot: new THREE.CircleGeometry(0.02, 16),
  grille: new THREE.CapsuleGeometry(0.012, 0.02, 4, 8),
};

function metalMaterial(hex) {
  return new THREE.MeshStandardMaterial({ color: hex, metalness: 0.75, roughness: 0.35 });
}

function glassMaterial(hex, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness: 0.1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    ...opts,
  });
}

function screenMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x050506,
    metalness: 0.2,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: 0x1a2340,
    emissiveIntensity: 0.5,
  });
}

function darkGlassMaterial() {
  return new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.4, roughness: 0.25 });
}

/**
 * Builds the vertical dual-camera module used both on the phone body and,
 * at larger scale, as the standalone "camera macro" model.
 */
function buildCameraBump({ tint, lensAccent = 0x8fa4ff } = {}) {
  const group = new THREE.Group();
  group.name = "cameraBump";

  const housing = new RoundedBoxGeometry(0.64, 0.94, 0.08, 4, 0.14);
  const housingMesh = new THREE.Mesh(housing, metalMaterial(tint));
  housingMesh.castShadow = true;
  group.add(housingMesh);

  const lensPositions = [0.24, -0.24];
  lensPositions.forEach((y, i) => {
    const ring = new THREE.Mesh(shared.lensRing, metalMaterial(0x1c1d20));
    ring.position.set(0, y, 0.045);
    group.add(ring);

    const glass = new THREE.Mesh(shared.lensGlass, darkGlassMaterial());
    glass.position.set(0, y, 0.05);
    group.add(glass);

    const accentRing = new THREE.Mesh(
      new THREE.RingGeometry(0.03, 0.037, 24),
      new THREE.MeshBasicMaterial({ color: lensAccent, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    accentRing.position.set(0, y, 0.051);
    group.add(accentRing);

    group.userData[`lens${i}`] = { ring, glass };
  });

  const flash = new THREE.Mesh(shared.dot, new THREE.MeshStandardMaterial({ color: 0xfff2d6, emissive: 0xfff2d6, emissiveIntensity: 0.4 }));
  flash.position.set(0.19, 0.0, 0.045);
  group.add(flash);

  const mic = new THREE.Mesh(shared.dot, new THREE.MeshStandardMaterial({ color: 0x0a0a0c }));
  mic.scale.setScalar(0.5);
  mic.position.set(-0.19, 0.0, 0.045);
  group.add(mic);

  return group;
}

/**
 * Full iPhone-16-inspired model. Returns a group plus an API for recoloring
 * and driving the "exploded parts" scroll animation.
 */
export function createPhoneModel(colorId = "ultramarine") {
  const color = IPHONE_COLORS.find((c) => c.id === colorId) ?? IPHONE_COLORS[0];
  const root = new THREE.Group();
  root.name = "phone";

  const parts = [];
  const addPart = (mesh, explodeDir) => {
    mesh.userData.rest = mesh.position.clone();
    mesh.userData.explodeDir = explodeDir.clone();
    parts.push(mesh);
    root.add(mesh);
    return mesh;
  };

  // Frame (the shell everything else nests inside)
  const frameGeo = new RoundedBoxGeometry(BODY.w, BODY.h, BODY.d, 6, BODY.r);
  const frameMat = metalMaterial(color.frame);
  const frame = addPart(new THREE.Mesh(frameGeo, frameMat), new THREE.Vector3(0, 0, 0));
  frame.castShadow = true;
  frame.receiveShadow = true;
  root.userData.frameMat = frameMat;

  // Front glass / screen
  const screenGeo = new RoundedBoxGeometry(BODY.w - 0.05, BODY.h - 0.05, 0.02, 4, BODY.r - 0.02);
  const screen = new THREE.Mesh(screenGeo, screenMaterial());
  screen.position.set(0, 0, BODY.d / 2 + 0.005);
  addPart(screen, new THREE.Vector3(0, 0, 0.9));
  root.userData.screenMat = screen.material;

  // Dynamic Island
  const island = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.09, 0.015, 3, 0.045),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  island.position.set(0, BODY.h / 2 - 0.26, BODY.d / 2 + 0.02);
  addPart(island, new THREE.Vector3(0, 0, 1.1));

  // Back glass
  const backGeo = new RoundedBoxGeometry(BODY.w - 0.05, BODY.h - 0.05, 0.02, 4, BODY.r - 0.02);
  const backMat = glassMaterial(color.back);
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.set(0, 0, -(BODY.d / 2 + 0.005));
  addPart(back, new THREE.Vector3(0, 0, -0.9));
  root.userData.backMat = backMat;

  // Camera bump (attached to back, so it explodes further back)
  const camGroup = buildCameraBump({ tint: color.frame });
  camGroup.position.set(-BODY.w / 2 + 0.42, BODY.h / 2 - 0.56, -(BODY.d / 2 + 0.045));
  addPart(camGroup, new THREE.Vector3(0, 0, -1.3));
  root.userData.cameraGroup = camGroup;
  root.userData.cameraMats = [camGroup.children[0].material];

  // Buttons: Action button, volume x2, power/Camera Control
  const buttonMat = metalMaterial(color.frame);
  const mkButton = (x, y, z, h) => {
    const geo = new RoundedBoxGeometry(0.03, h, 0.05, 2, 0.014);
    const m = new THREE.Mesh(geo, buttonMat);
    m.position.set(x, y, z);
    return m;
  };
  const rightX = BODY.w / 2 + 0.012;
  const leftX = -BODY.w / 2 - 0.012;
  addPart(mkButton(leftX, 0.62, 0, 0.16), new THREE.Vector3(-0.6, 0, 0));
  addPart(mkButton(leftX, 0.36, 0, 0.24), new THREE.Vector3(-0.6, 0, 0));
  addPart(mkButton(rightX, 0.7, 0, 0.14), new THREE.Vector3(0.6, 0, 0));
  const cameraControl = mkButton(rightX, 0.28, 0, 0.22);
  addPart(cameraControl, new THREE.Vector3(0.6, 0, 0));
  root.userData.cameraControl = cameraControl;

  // USB-C port
  const port = new THREE.Mesh(
    new RoundedBoxGeometry(0.16, 0.035, 0.05, 2, 0.014),
    new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.6, roughness: 0.4 })
  );
  port.position.set(0, -BODY.h / 2 - 0.008, 0);
  addPart(port, new THREE.Vector3(0, -0.5, 0));

  // Speaker grille — shared geometry, small instance count (well under 50)
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.5, roughness: 0.5 });
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 6; i++) {
      const dot = new THREE.Mesh(shared.grille, grilleMat);
      dot.rotation.z = Math.PI / 2;
      dot.position.set(side * (0.24 + i * 0.045), -BODY.h / 2 - 0.006, 0);
      addPart(dot, new THREE.Vector3(0, -0.5, 0));
    }
  }

  root.userData.parts = parts;
  root.userData.colorId = color.id;

  root.userData.setExplode = (amount) => {
    parts.forEach((mesh) => {
      const rest = mesh.userData.rest;
      const dir = mesh.userData.explodeDir;
      mesh.position.set(
        rest.x + dir.x * amount,
        rest.y + dir.y * amount,
        rest.z + dir.z * amount
      );
    });
  };

  root.userData.setColor = (nextColorId) => {
    const c = IPHONE_COLORS.find((x) => x.id === nextColorId);
    if (!c) return;
    root.userData.frameMat.color.setHex(c.frame);
    root.userData.backMat.color.setHex(c.back);
    root.userData.cameraMats.forEach((m) => m.color.setHex(c.frame));
    root.userData.colorId = c.id;
  };

  root.userData.dispose = () => {
    parts.forEach((mesh) => {
      mesh.geometry?.dispose?.();
      if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
      else mesh.material?.dispose?.();
    });
  };

  return root;
}

/** Standalone chip model for the "Performance" section. */
export function createChipModel() {
  const group = new THREE.Group();
  group.name = "chip";

  const board = new THREE.Mesh(
    new RoundedBoxGeometry(1.3, 1.3, 0.04, 3, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0c1410, metalness: 0.3, roughness: 0.6 })
  );
  group.add(board);

  const die = new THREE.Mesh(
    new RoundedBoxGeometry(0.7, 0.7, 0.09, 3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x2b2d33, metalness: 0.85, roughness: 0.25 })
  );
  die.position.z = 0.065;
  group.add(die);

  const traceMat = new THREE.MeshBasicMaterial({ color: 0x8fa4ff, transparent: true, opacity: 0.85 });
  const traceGeo = new THREE.BoxGeometry(0.5, 0.012, 0.002);
  const traces = [];
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(traceGeo, traceMat);
    t.position.set(0, -0.26 + i * 0.1, 0.111);
    t.scale.x = 0.5 + Math.random() * 0.5;
    group.add(t);
    traces.push(t);
  }
  const traces2 = [];
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(traceGeo, traceMat);
    t.rotation.z = Math.PI / 2;
    t.position.set(-0.26 + i * 0.1, 0, 0.111);
    t.scale.x = 0.5 + Math.random() * 0.5;
    group.add(t);
    traces2.push(t);
  }

  // Ball grid array dots along the board perimeter — shared geometry
  const bgaMat = new THREE.MeshStandardMaterial({ color: 0xd8b25c, metalness: 0.9, roughness: 0.3 });
  const perimeter = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const x = -0.55 + (1.1 * i) / (n - 1);
    [0.55, -0.55].forEach((y) => {
      const dot = new THREE.Mesh(shared.dot, bgaMat);
      dot.scale.setScalar(0.35);
      dot.position.set(x, y, 0.021);
      group.add(dot);
      perimeter.push(dot);
    });
  }

  group.userData.traces = [...traces, ...traces2];
  group.userData.emissiveMat = traceMat;
  group.userData.dispose = () => {
    group.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
      }
    });
  };
  return group;
}

/** Large standalone camera module for the "Camera" section close-up. */
export function createCameraMacroModel(colorId = "ultramarine") {
  const color = IPHONE_COLORS.find((c) => c.id === colorId) ?? IPHONE_COLORS[0];
  const group = buildCameraBump({ tint: color.frame, lensAccent: 0x9db2ff });
  group.scale.setScalar(2.4);

  const haloGeo = new THREE.TorusGeometry(0.62, 0.006, 8, 64);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x8fa4ff, transparent: true, opacity: 0.35 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.z = 0.08;
  group.add(halo);
  group.userData.halo = halo;

  group.userData.setColor = (nextColorId) => {
    const c = IPHONE_COLORS.find((x) => x.id === nextColorId);
    if (!c) return;
    group.children[0].material.color.setHex(c.frame);
  };
  group.userData.dispose = () => {
    group.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
      }
    });
  };
  return group;
}

/** Large standalone edge slab with Action Button + Camera Control for the "Controls" section. */
export function createButtonMacroModel(colorId = "ultramarine") {
  const color = IPHONE_COLORS.find((c) => c.id === colorId) ?? IPHONE_COLORS[0];
  const group = new THREE.Group();

  const slab = new THREE.Mesh(
    new RoundedBoxGeometry(0.5, 1.6, 0.9, 5, 0.22),
    metalMaterial(color.frame)
  );
  group.add(slab);

  const action = new THREE.Mesh(
    new RoundedBoxGeometry(0.1, 0.32, 0.5, 3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.6, roughness: 0.3 })
  );
  action.position.set(0.24, 0.5, 0);
  group.add(action);

  const control = new THREE.Mesh(
    new RoundedBoxGeometry(0.09, 0.6, 0.46, 3, 0.05),
    new THREE.MeshPhysicalMaterial({ color: 0x0c0d10, metalness: 0.3, roughness: 0.15, clearcoat: 1 })
  );
  control.position.set(0.245, -0.35, 0);
  group.add(control);

  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x9db2ff, transparent: true, opacity: 0.5 })
  );
  scan.rotation.y = Math.PI / 2;
  scan.position.set(0.29, -0.35, 0);
  group.add(scan);
  group.userData.scan = scan;

  group.userData.dispose = () => {
    group.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
      }
    });
  };
  return group;
}
