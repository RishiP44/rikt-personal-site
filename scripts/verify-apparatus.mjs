import assert from "node:assert/strict";
import * as THREE from "three";
import {
  chapters,
  chapterAt,
  viewAt,
  angleDifference,
} from "../src/lib/apparatus.ts";
import { createEngine, pickedChapter } from "../src/lib/ouroboros-model.ts";

const destinations = [
  "/about/",
  "/work/",
  "/projects/",
  "/learning/",
  "/writing/",
  "/contact/",
];
assert.deepEqual(
  chapters.map((item) => item.href),
  destinations,
);
assert.equal(new Set(chapters.map((item) => item.id)).size, 6);
const model = createEngine();
assert.deepEqual(
  [...model.parts.keys()].sort(),
  chapters.map((item) => item.id).sort(),
);
let meshes = 0;
model.root.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;
  meshes++;
  assert(
    chapters.some((item) => item.id === pickedChapter(object)),
    "Every selectable mesh belongs to a real destination",
  );
  const positions = object.geometry.getAttribute("position");
  for (const value of positions.array)
    assert(Number.isFinite(value), "Nonfinite model vertex");
});
assert(meshes > 20 && meshes < 500, "Bounded procedural scene");
assert.equal(pickedChapter(new THREE.Group()), undefined);
let previous;
for (let i = 0; i <= 240; i++) {
  const progress = i / 240;
  const view = viewAt(progress);
  assert(Object.values(view).every(Number.isFinite));
  model.setEffort(progress);
  model.root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model.root);
  assert(
    [...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite),
  );
  assert(
    bounds.min.x > -4 &&
      bounds.max.x < 4 &&
      bounds.min.y > -4 &&
      bounds.max.y < 4,
  );
  const rock = model.anchors.projects.clone();
  if (previous)
    assert(
      rock.distanceTo(previous) < 0.04,
      "Scroll motion must not jump at a cycle boundary",
    );
  previous = rock;
}
model.setEffort(0.2, true);
const reduced = model.anchors.projects.clone();
model.setEffort(0.8, true);
assert(
  reduced.equals(model.anchors.projects),
  "Reduced motion keeps the pushing pose still",
);
assert.deepEqual(viewAt(-5), viewAt(0));
assert.deepEqual(viewAt(5), viewAt(1));
assert.deepEqual(
  viewAt(0),
  viewAt(1),
  "The journey returns to its opening view",
);
assert(
  Math.abs(angleDifference(40 * Math.PI, 0.2) - 0.2) < 1e-10,
  "Reset takes the shortest arc after repeated turns",
);
const sections = [
  { id: "drawing", top: 0, height: 800 },
  { id: "about", top: 800, height: 1000 },
  { id: "work", top: 1800, height: 800 },
];
assert.equal(chapterAt(0, sections), "drawing");
assert.equal(chapterAt(700, sections), "about");
assert.equal(chapterAt(1900, sections), "work");
assert.equal(chapterAt(0, []), "drawing");
model.setTheme(true);
model.setTheme(false);
model.setEffort(0);
const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 70);
camera.position.set(0, 0.08, 11.4);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
model.root.updateMatrixWorld(true);
const ray = new THREE.Raycaster();
ray.set(
  camera.position,
  model.anchors.projects.clone().sub(camera.position).normalize(),
);
const hit = ray
  .intersectObject(model.root, true)
  .find((entry) => entry.object instanceof THREE.Mesh);
assert(
  hit && pickedChapter(hit.object) === "projects",
  "The actual stone must be ray-selectable",
);
model.dispose();
console.log(
  `PASS: six destination mappings; ${meshes} actual meshes; finite bounded geometry in 241 poses; continuous scroll movement; reduced-motion still pose; chapter boundaries; real stone ray selection. Browser rendering, touch and accessibility require separate inspection.`,
);
