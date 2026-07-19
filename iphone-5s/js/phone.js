// iPhone 5s 3D models.
//
// The full phone is a licensed external asset (see assets/iphone-5s-model/license.txt
// — CC-BY-4.0, "IPhone 5s" by Eternal Realm, sketchfab.com/EternalRealm). Every other
// model (chip, camera macro, Touch ID macro) is procedural geometry built for this page.

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const IPHONE_COLORS = [
  { id: "silver", name: "Silver", body: 0xe4e3df, front: 0xf2f1ea, ui: "#e4e3df" },
  { id: "gold", name: "Gold", body: 0xe9d7b3, front: 0xf2ede0, ui: "#e6cfa0" },
  { id: "spacegray", name: "Space Gray", body: 0x4b4b4d, front: 0x141414, ui: "#9a9a9e" },
];

const MODEL_URL = "./assets/iphone-5s-model/scene.gltf";
const TARGET_HEIGHT = 3.0; // world units, matches the scroll rig's camera distances

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

function darkGlassMaterial() {
  return new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.4, roughness: 0.25 });
}

/**
 * Loads the licensed iPhone 5s glTF, normalizes its scale/pivot, and wires up
 * a generic (semantic-free) explode effect + per-finish recoloring.
 */
export function loadPhoneModel(colorId = "silver") {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      MODEL_URL,
      (gltf) => {
        const inner = gltf.scene;

        // Normalize: center the model on its own bounding-box middle, then
        // scale so its height matches the rig's existing camera distances.
        const rawBox = new THREE.Box3().setFromObject(inner);
        const size = new THREE.Vector3();
        rawBox.getSize(size);
        const center = new THREE.Vector3();
        rawBox.getCenter(center);
        inner.position.sub(center);

        const root = new THREE.Group();
        root.name = "phone";
        root.add(inner);
        const scale = TARGET_HEIGHT / Math.max(size.y, 0.0001);
        root.scale.setScalar(scale);

        const parts = [];
        const materialsByName = {};
        const modelCenter = new THREE.Vector3(); // inner is already centered at its own origin

        inner.traverse((obj) => {
          if (!obj.isMesh) return;
          obj.castShadow = true;
          obj.receiveShadow = true;

          const box = new THREE.Box3().setFromObject(obj);
          const meshCenter = new THREE.Vector3();
          box.getCenter(meshCenter);
          const dir = meshCenter.clone().sub(modelCenter);
          if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
          dir.normalize().multiplyScalar(0.55);

          obj.userData.rest = obj.position.clone();
          obj.userData.explodeDir = dir;
          parts.push(obj);

          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m?.name) materialsByName[m.name] = m;
          });
        });

        root.userData.parts = parts;
        root.userData.materialsByName = materialsByName;
        root.userData.colorId = colorId;

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
          materialsByName.silver?.color.setHex(c.body);
          if (materialsByName.base) materialsByName.base.color.setHex(c.front);
          root.userData.colorId = c.id;
        };

        root.userData.dispose = () => {
          inner.traverse((obj) => {
            if (obj.isMesh) {
              obj.geometry?.dispose?.();
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((m) => m?.dispose?.());
            }
          });
        };

        root.userData.setColor(colorId);
        resolve(root);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * Single-lens camera module with True Tone dual-LED flash — the iPhone 5s's
 * actual camera layout (its first year introducing the two-tone flash).
 * Used both as the phone's real camera detail and, scaled up, as the
 * standalone "camera macro" model.
 */
function buildCameraModule({ tint, lensAccent = 0x9db2ff, scale = 1 } = {}) {
  const group = new THREE.Group();
  group.name = "cameraModule";

  const housing = new THREE.Mesh(
    new RoundedBoxGeometry(0.5 * scale, 0.5 * scale, 0.05 * scale, 4, 0.1 * scale),
    metalMaterial(tint)
  );
  group.add(housing);

  const ring = new THREE.Mesh(shared.lensRing, metalMaterial(0x1c1d20));
  ring.scale.setScalar(scale);
  ring.position.z = 0.03 * scale;
  group.add(ring);

  const glass = new THREE.Mesh(shared.lensGlass, darkGlassMaterial());
  glass.scale.setScalar(scale);
  glass.position.z = 0.035 * scale;
  group.add(glass);

  const accentRing = new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.037, 24),
    new THREE.MeshBasicMaterial({ color: lensAccent, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
  );
  accentRing.scale.setScalar(scale);
  accentRing.position.z = 0.036 * scale;
  group.add(accentRing);

  // True Tone flash: two LEDs (warm + cool) side by side, below the lens
  [-1, 1].forEach((side, i) => {
    const flash = new THREE.Mesh(
      shared.dot,
      new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xfff2d6 : 0xdce8ff,
        emissive: i === 0 ? 0xfff2d6 : 0xdce8ff,
        emissiveIntensity: 0.4,
      })
    );
    flash.scale.setScalar(scale * 0.45);
    flash.position.set(side * 0.11 * scale, -0.2 * scale, 0.03 * scale);
    group.add(flash);
  });

  return group;
}

/** Standalone chip model for the "Performance" section — A7 die + smaller M7 coprocessor die. */
export function createChipModel() {
  const group = new THREE.Group();
  group.name = "chip";

  const board = new THREE.Mesh(
    new RoundedBoxGeometry(1.3, 1.3, 0.04, 3, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0c1410, metalness: 0.3, roughness: 0.6 })
  );
  group.add(board);

  const die = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.62, 0.09, 3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x2b2d33, metalness: 0.85, roughness: 0.25 })
  );
  die.position.set(-0.1, 0.05, 0.065);
  group.add(die);

  // M7 motion coprocessor: a smaller companion die
  const m7 = new THREE.Mesh(
    new RoundedBoxGeometry(0.24, 0.24, 0.075, 2, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x36383f, metalness: 0.8, roughness: 0.3 })
  );
  m7.position.set(0.42, -0.42, 0.058);
  group.add(m7);

  const traceMat = new THREE.MeshBasicMaterial({ color: 0x8fa4ff, transparent: true, opacity: 0.85 });
  const traceGeo = new THREE.BoxGeometry(0.45, 0.012, 0.002);
  const traces = [];
  for (let i = 0; i < 5; i++) {
    const t = new THREE.Mesh(traceGeo, traceMat);
    t.position.set(-0.1, -0.28 + i * 0.09, 0.111);
    t.scale.x = 0.5 + Math.random() * 0.5;
    group.add(t);
    traces.push(t);
  }
  const traces2 = [];
  for (let i = 0; i < 5; i++) {
    const t = new THREE.Mesh(traceGeo, traceMat);
    t.rotation.z = Math.PI / 2;
    t.position.set(-0.32 + i * 0.09, 0.05, 0.111);
    t.scale.x = 0.4 + Math.random() * 0.4;
    group.add(t);
    traces2.push(t);
  }

  // Ball grid array dots along the board perimeter — shared geometry
  const bgaMat = new THREE.MeshStandardMaterial({ color: 0xd8b25c, metalness: 0.9, roughness: 0.3 });
  const n = 14;
  for (let i = 0; i < n; i++) {
    const x = -0.55 + (1.1 * i) / (n - 1);
    [0.55, -0.55].forEach((y) => {
      const dot = new THREE.Mesh(shared.dot, bgaMat);
      dot.scale.setScalar(0.35);
      dot.position.set(x, y, 0.021);
      group.add(dot);
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
export function createCameraMacroModel(colorId = "silver") {
  const color = IPHONE_COLORS.find((c) => c.id === colorId) ?? IPHONE_COLORS[0];
  const group = buildCameraModule({ tint: color.body, lensAccent: 0x9db2ff, scale: 2.6 });

  const haloGeo = new THREE.TorusGeometry(0.62, 0.006, 8, 64);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x8fa4ff, transparent: true, opacity: 0.35 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.z = 0.08;
  group.add(halo);
  group.userData.halo = halo;

  group.userData.setColor = (nextColorId) => {
    const c = IPHONE_COLORS.find((x) => x.id === nextColorId);
    if (!c) return;
    group.children[0].material.color.setHex(c.body);
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

/** Large standalone Touch ID home button for the "Touch ID" section. */
export function createTouchIdMacroModel(colorId = "silver") {
  const color = IPHONE_COLORS.find((c) => c.id === colorId) ?? IPHONE_COLORS[0];
  const group = new THREE.Group();

  const bezel = new THREE.Mesh(
    new RoundedBoxGeometry(1.7, 1.7, 0.12, 4, 0.5),
    new THREE.MeshStandardMaterial({ color: color.front, metalness: 0.05, roughness: 0.3 })
  );
  group.add(bezel);
  group.userData.bezelMat = bezel.material;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.05, 24, 48),
    metalMaterial(0xd7d7d4)
  );
  ring.position.z = 0.09;
  group.add(ring);

  const cap = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xf3f3f0, metalness: 0.1, roughness: 0.12, clearcoat: 1 })
  );
  cap.position.z = 0.1;
  group.add(cap);

  // Fingerprint-style concentric grooves, purely decorative
  const grooveMat = new THREE.MeshBasicMaterial({ color: 0x9db2ff, transparent: true, opacity: 0.35 });
  const grooves = [];
  for (let i = 0; i < 4; i++) {
    const groove = new THREE.Mesh(new THREE.RingGeometry(0.14 + i * 0.09, 0.15 + i * 0.09, 40), grooveMat);
    groove.position.z = 0.101;
    group.add(groove);
    grooves.push(groove);
  }
  group.userData.grooves = grooves;

  group.userData.setColor = (nextColorId) => {
    const c = IPHONE_COLORS.find((x) => x.id === nextColorId);
    if (!c) return;
    group.userData.bezelMat.color.setHex(c.front);
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
