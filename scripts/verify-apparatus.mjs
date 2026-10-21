import assert from "node:assert/strict";
import * as THREE from "three";
import { chapters } from "../src/lib/apparatus.ts";
import { createEngine, pickedChapter } from "../src/lib/ouroboros-model.ts";
import { rotateView } from "../src/lib/sculpture-geometry.ts";
assert.deepEqual(
  chapters.map((c) => c.href),
  ["/about/", "/work/", "/projects/", "/learning/", "/writing/", "/contact/"],
);
const model = createEngine();
assert.equal(new Set(chapters.map((c) => c.id)).size, 6);
assert.deepEqual(
  [...model.parts.keys()].sort(),
  chapters.map((c) => c.id).sort(),
);
let meshes = 0,
  triangles = 0,
  instances = 0;
model.root.traverse((o) => {
  if (!(o instanceof THREE.Mesh)) return;
  meshes++;
  assert(
    chapters.some((c) => c.id === pickedChapter(o)),
    "Every mesh has a valid destination",
  );
  const p = o.geometry.getAttribute("position");
  for (const n of p.array) assert(Number.isFinite(n), "Finite vertices");
  const count = o instanceof THREE.InstancedMesh ? o.count : 1;
  if (o instanceof THREE.InstancedMesh) {
    instances += count;
    for (const n of o.instanceMatrix.array) assert(Number.isFinite(n));
  }
  triangles += ((o.geometry.index?.count ?? p.count) / 3) * count;
  assert.notEqual(
    o.geometry.type,
    "BoxGeometry",
    "Anatomy is not assembled from blocks",
  );
});
assert(meshes > 100 && meshes < 350);
assert(instances >= 2000 && instances < 2500);
assert(triangles < 250000, "Bounded geometry budget");
let previous;
for (let i = 0; i <= 240; i++) {
  model.animate((i / 240) * 6.4);
  model.root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model.root);
  for (const n of [...bounds.min.toArray(), ...bounds.max.toArray()])
    assert(Number.isFinite(n) && Math.abs(n) < 4);
  if (previous)
    assert(
      model.anchors.projects.distanceTo(previous) < 0.002,
      "No motion discontinuity",
    );
  previous = model.anchors.projects.clone();
}
model.animate(0);
const opening = model.anchors.projects.clone();
model.animate(6.4);
assert(
  opening.distanceTo(model.anchors.projects) < 1e-10,
  "Closed motion loop",
);
model.animate(1, true);
const still = model.anchors.projects.clone();
model.animate(3, true);
assert(still.equals(model.anchors.projects), "Reduced-motion pose is static");
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100),
  target = new THREE.Vector3();
camera.position.set(0, 0, 12);
camera.lookAt(target);
rotateView(camera, target, new THREE.Vector3(1, 0, 0), Math.PI);
assert(camera.position.z < -11.99, "Full pitch rotation reaches the back");
rotateView(camera, target, new THREE.Vector3(1, 0, 0), Math.PI);
assert(camera.position.distanceTo(new THREE.Vector3(0, 0, 12)) < 1e-10);
rotateView(camera, target, new THREE.Vector3(0, 0, 1), Math.PI / 2);
assert(Math.abs(camera.up.x) > 0.99, "Roll changes camera up");
for (let i = 0; i < 120; i++)
  rotateView(camera, target, new THREE.Vector3(1, 2, 3), Math.PI / 60);
assert(Math.abs(camera.position.length() - 12) < 1e-9);
assert(Math.abs(camera.up.length() - 1) < 1e-12);
camera.position.set(0, 0.08, 11.4);
camera.up.set(0, 1, 0);
camera.lookAt(target);
camera.updateMatrixWorld();
model.animate(0);
model.root.updateMatrixWorld(true);
const ray = new THREE.Raycaster(
  camera.position,
  model.anchors.projects.clone().sub(camera.position).normalize(),
);
assert.equal(
  pickedChapter(ray.intersectObject(model.root, true)[0]?.object ?? null),
  "projects",
  "Stone is directly ray-selectable",
);
model.setTheme(true);
model.setTheme(false);
model.dispose();
console.log(
  "PASS: six direct mappings; " +
    meshes +
    " meshes; " +
    instances +
    " instanced scales; " +
    triangles +
    " triangles; finite bounded geometry in 241 poses; continuous periodic motion; reduced-motion stillness; unrestricted quaternion pitch and roll; direct stone ray selection. Browser and physical touch checks are separate.",
);
