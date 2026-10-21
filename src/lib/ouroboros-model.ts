import * as THREE from "three";
import type { ChapterId } from "./apparatus";
import {
  grain,
  stoneGeometry,
  terrainGeometry,
  torsoGeometry,
  muscleGeometry,
} from "./sculpture-geometry.ts";

export function createEngine() {
  const root = new THREE.Group();
  root.name = "Sisyphus / Ouroboros";
  const parts = new Map<ChapterId, THREE.Group>();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials: { material: THREE.MeshStandardMaterial; role: string }[] =
    [];
  const textures: THREE.Texture[] = [];
  const noise = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < 128 * 128; i++) {
    const value = Math.round(
      132 + grain((i % 128) * 0.7, Math.floor(i / 128) * 0.7, 0.3) * 90,
    );
    noise.set([value, value, value, 255], i * 4);
  }
  const surface = new THREE.DataTexture(noise, 128, 128);
  surface.wrapS = surface.wrapT = THREE.RepeatWrapping;
  surface.repeat.set(5, 5);
  surface.needsUpdate = true;
  textures.push(surface);
  function material(
    role: string,
    color: string,
    metalness: number,
    roughness: number,
    bumpScale = 0.008,
  ) {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      bumpMap: surface,
      bumpScale,
    });
    materials.push({ material: m, role });
    return m;
  }
  const serpent = material("serpent", "#5b655b", 0.66, 0.42);
  const skin = material("skin", "#b9b8a9", 0.16, 0.59, 0.005);
  const carved = material("carved", "#93998d", 0.18, 0.65, 0.004);
  const rock = material("rock", "#91968d", 0.08, 0.85, 0.025);
  rock.vertexColors = true;
  const trail = material("trail", "#d2cabc", 0.12, 0.73, 0.012);
  const dark = material("dark", "#252c2a", 0.25, 0.49);
  const brass = material("brass", "#9b8162", 0.75, 0.37);
  const eye = material("eye", "#101714", 0.1, 0.17, 0);
  const sphere = new THREE.SphereGeometry(1, 28, 20);
  const muscle = muscleGeometry();
  function part(id: ChapterId) {
    const group = new THREE.Group();
    group.name = id;
    group.userData.chapter = id;
    root.add(group);
    parts.set(id, group);
    return group;
  }
  function mesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    m: THREE.Material,
  ) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, m);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function ellipsoid(
    parent: THREE.Object3D,
    xyz: number[],
    radii: number[],
    m = skin,
  ) {
    const object = mesh(parent, sphere, m);
    object.position.fromArray(xyz);
    object.scale.fromArray(radii);
    return object;
  }
  function tube(
    parent: THREE.Object3D,
    points: THREE.Vector3[],
    radius: number,
    m = brass,
    segments = 32,
  ) {
    return mesh(
      parent,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        segments,
        radius,
        6,
        false,
      ),
      m,
    );
  }
  const vector = (x: number, y: number, z: number) =>
    new THREE.Vector3(x, y, z);
  const up = vector(0, 1, 0);
  function connect(
    object: THREE.Mesh,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    flatten = 1,
  ) {
    const direction = b.clone().sub(a);
    object.position.copy(a).add(b).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    object.scale.set(radius, direction.length(), radius * flatten);
  }

  const identity = part("about");
  const radius = 2.72,
    start = 0.46,
    end = Math.PI * 2 + 0.33;
  const ringPoint = (angle: number) =>
    vector(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      Math.sin(angle * 2) * 0.12,
    );
  const radiusAt = (t: number) =>
    0.18 *
    (0.7 + 0.3 * Math.sin(t * Math.PI)) *
    (t > 0.88 ? 1 - ((t - 0.88) / 0.12) * 0.58 : 1);
  const path = new THREE.CatmullRomCurve3(
    Array.from({ length: 257 }, (_, i) =>
      ringPoint(start + ((end - start) * i) / 256),
    ),
  );
  const body = new THREE.TubeGeometry(path, 512, 0.18, 20, false);
  const p = body.getAttribute("position");
  for (let i = 0; i <= 512; i++) {
    const center = path.getPointAt(i / 512);
    for (let j = 0; j <= 20; j++) {
      const k = i * 21 + j;
      const v = vector(p.getX(k), p.getY(k), p.getZ(k))
        .sub(center)
        .multiplyScalar(radiusAt(i / 512) / 0.18)
        .add(center);
      p.setXYZ(k, v.x, v.y, v.z);
    }
  }
  body.computeVertexNormals();
  mesh(identity, body, serpent);

  // Overlapping, staggered lenticular scales; one instanced draw call.
  const scaleGeometry = new THREE.BufferGeometry();
  scaleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        0, 0.078, 0, -0.052, 0.03, 0, -0.052, -0.027, 0, 0, -0.073, 0, 0.052,
        -0.027, 0, 0.052, 0.03, 0, 0, 0, 0.018, 0, 0, -0.006,
      ],
      3,
    ),
  );
  const scaleIndices: number[] = [];
  for (let i = 0; i < 6; i++) {
    scaleIndices.push(i, (i + 1) % 6, 6, (i + 1) % 6, i, 7);
  }
  scaleGeometry.setIndex(scaleIndices);
  scaleGeometry.computeVertexNormals();
  geometries.add(scaleGeometry);
  const scales = new THREE.InstancedMesh(scaleGeometry, serpent, 168 * 12);
  scales.name = "2016 overlapping serpent scales";
  scales.castShadow = true;
  scales.receiveShadow = true;
  const transform = new THREE.Object3D(),
    matrix = new THREE.Matrix4();
  for (let i = 0; i < 168; i++)
    for (let j = 0; j < 12; j++) {
      const t = (i + (j % 2) * 0.5) / 168,
        angle = start + (end - start) * t;
      const tangent = vector(
        -Math.sin(angle),
        Math.cos(angle),
        (0.24 * Math.cos(angle * 2)) / radius,
      ).normalize();
      const radial = vector(Math.cos(angle), Math.sin(angle), 0);
      const binormal = radial.clone().cross(tangent).normalize();
      const beta = (j / 12) * Math.PI * 2;
      const normal = radial
        .clone()
        .multiplyScalar(Math.cos(beta))
        .addScaledVector(binormal, Math.sin(beta))
        .normalize();
      const across = tangent.clone().cross(normal).normalize();
      matrix.makeBasis(across, tangent, normal);
      transform.quaternion.setFromRotationMatrix(matrix);
      transform.position
        .copy(ringPoint(angle))
        .addScaledVector(normal, radiusAt(t) * 0.99);
      transform.scale.set(0.95, 1.08, 1);
      transform.updateMatrix();
      scales.setMatrixAt(i * 12 + j, transform.matrix);
      const shade = 0.86 + (Math.sin(i * 12.7 + j * 19.3) + 1) * 0.065;
      scales.setColorAt(
        i * 12 + j,
        new THREE.Color(shade, shade * (j % 4 === 0 ? 1.035 : 1), shade * 0.97),
      );
    }
  identity.add(scales);

  const signal = part("contact"),
    head = new THREE.Group();
  signal.add(head);
  head.position.copy(ringPoint(start));
  head.rotation.z = start - Math.PI / 2;
  ellipsoid(head, [0, 0, 0], [0.3, 0.155, 0.205], serpent);
  ellipsoid(head, [0.19, 0.005, 0], [0.245, 0.085, 0.148], serpent);
  ellipsoid(head, [0.2, -0.115, 0], [0.23, 0.032, 0.135], serpent);
  tube(
    head,
    [
      vector(-0.08, -0.06, 0.16),
      vector(0.15, -0.08, 0.135),
      vector(0.37, -0.065, 0.07),
    ],
    0.006,
    dark,
    24,
  );
  tube(
    head,
    [
      vector(-0.08, -0.06, -0.16),
      vector(0.15, -0.08, -0.135),
      vector(0.37, -0.065, -0.07),
    ],
    0.006,
    dark,
    24,
  );
  for (const side of [-1, 1]) {
    ellipsoid(head, [-0.01, 0.065, side * 0.183], [0.052, 0.039, 0.025], dark);
    ellipsoid(head, [0.002, 0.072, side * 0.202], [0.029, 0.027, 0.012], brass);
    ellipsoid(head, [0.005, 0.074, side * 0.213], [0.007, 0.022, 0.006], eye);
    ellipsoid(head, [0.345, 0.047, side * 0.061], [0.018, 0.01, 0.01], eye);
    tube(
      head,
      [
        vector(-0.09, 0.105, side * 0.17),
        vector(0, 0.12, side * 0.186),
        vector(0.07, 0.097, side * 0.175),
      ],
      0.017,
      serpent,
      20,
    );
  }
  for (let i = 0; i < 30; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(i / 30) * 0.17;
    const s = mesh(head, scaleGeometry, serpent);
    s.position.set(
      -0.14 + Math.cos(a) * r,
      0.12 + Math.sqrt(Math.max(0, 1 - (r * r) / 0.04)) * 0.035,
      Math.sin(a) * r,
    );
    s.rotation.x = -Math.PI / 2;
    s.rotation.z = a;
    s.scale.setScalar(0.52);
  }
  const tail = mesh(identity, new THREE.ConeGeometry(0.073, 0.4, 20), serpent);
  tail.position.copy(ringPoint(end - 0.025));
  tail.rotation.z = end;

  const mountain = part("learning");
  mesh(mountain, terrainGeometry(), rock);
  // The ridge is a worn continuous path, not a set of floating blocks.
  const pathShape = new THREE.BufferGeometry(),
    pathPositions: number[] = [],
    pathIndices: number[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = -1.8 + (i / 80) * 3.15;
    for (const z of [-0.17, 0.17]) pathPositions.push(x, x * 0.52 - 0.875, z);
    if (i < 80) {
      const a = i * 2;
      pathIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  pathShape.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(pathPositions, 3),
  );
  pathShape.setIndex(pathIndices);
  pathShape.computeVertexNormals();
  mesh(mountain, pathShape, trail);
  for (let layer = 1; layer <= 5; layer++) {
    const points = Array.from({ length: 60 }, (_, i) => {
      const t = 0.12 + (i / 59) * 0.75,
        x = -1.93 + t * 3.52,
        width = 0.09 + Math.pow(Math.sin(t * Math.PI), 0.7) * 0.9;
      const top = x * 0.52 - 0.9,
        depth = 0.12 + Math.sin(t * Math.PI) * 1.24;
      return vector(
        x,
        top - depth * (0.2 + layer * 0.115) + Math.sin(x * 8 + layer) * 0.018,
        width + 0.008,
      );
    });
    tube(mountain, points, 0.005, layer % 2 === 0 ? dark : trail, 70);
  }

  const project = part("projects");
  const stone = mesh(project, stoneGeometry(0.69, 5), rock);
  stone.name = "Weathered stone";
  const record = part("writing");
  for (let i = 0; i < 7; i++) {
    const x = 0.18 + i * 0.078;
    tube(
      record,
      [
        vector(x, -1.6, 0.89),
        vector(x + 0.025, -1.72, 0.91),
        vector(x + 0.075, -1.78, 0.87),
      ],
      0.006,
      brass,
      12,
    );
  }

  const builder = part("work"),
    human = new THREE.Group(),
    torso = new THREE.Group();
  builder.add(human);
  human.position.set(-1, -1.42, 0);
  human.add(torso);
  mesh(torso, torsoGeometry(), skin);
  ellipsoid(torso, [0.29, 1.23, 0], [0.085, 0.13, 0.085]);
  const skull = ellipsoid(torso, [0.365, 1.43, 0], [0.123, 0.168, 0.115]);
  skull.rotation.z = -0.14;
  ellipsoid(torso, [0.428, 1.39, 0], [0.105, 0.096, 0.095]);
  ellipsoid(torso, [0.504, 1.428, 0], [0.045, 0.041, 0.029]);
  ellipsoid(torso, [0.472, 1.335, 0], [0.056, 0.026, 0.065]);
  // Brow, orbital hollows, ears, lips and individually formed curls.
  for (const side of [-1, 1]) {
    ellipsoid(
      torso,
      [0.454, 1.454, side * 0.071],
      [0.034, 0.014, 0.02],
      carved,
    );
    ellipsoid(torso, [0.466, 1.464, side * 0.071], [0.037, 0.011, 0.022]);
    ellipsoid(torso, [0.326, 1.415, side * 0.111], [0.025, 0.044, 0.014]);
    ellipsoid(
      torso,
      [0.329, 1.418, side * 0.124],
      [0.013, 0.025, 0.006],
      carved,
    );
  }
  tube(
    torso,
    [
      vector(0.487, 1.353, -0.035),
      vector(0.505, 1.352, 0),
      vector(0.487, 1.353, 0.035),
    ],
    0.004,
    dark,
    18,
  );
  for (let i = 0; i < 45; i++) {
    const a = i * 2.39996,
      v = (i + 0.5) / 45;
    const theta = Math.acos(1 - v * 1.35);
    const x = 0.35 + Math.cos(theta) * 0.13,
      y = 1.46 + Math.sin(theta) * Math.cos(a) * 0.145,
      z = Math.sin(theta) * Math.sin(a) * 0.116;
    if (x > 0.41 && y < 1.53) continue;
    const curl = ellipsoid(torso, [x, y, z], [0.027, 0.026, 0.024], carved);
    curl.rotation.z = a;
  }
  // Carved shoulder, pectoral and abdominal planes keep a readable anatomy.
  for (const side of [-1, 1]) {
    ellipsoid(torso, [0.252, 1.085, side * 0.2], [0.115, 0.1, 0.1]);
    ellipsoid(torso, [0.27, 1.015, side * 0.105], [0.088, 0.082, 0.095]);
    tube(
      torso,
      [
        vector(0.28, 1.13, side * 0.035),
        vector(0.28, 1.11, side * 0.15),
        vector(0.23, 1.1, side * 0.21),
      ],
      0.014,
      skin,
      18,
    );
    ellipsoid(torso, [0.15, 0.9, side * 0.075], [0.075, 0.085, 0.055]);
    ellipsoid(torso, [0.09, 0.8, side * 0.067], [0.062, 0.06, 0.05]);
  }
  const cloth = ellipsoid(human, [0.015, 0.65, 0], [0.17, 0.12, 0.195], trail);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const strip = ellipsoid(
      human,
      [Math.cos(a) * 0.13, 0.53, Math.sin(a) * 0.17],
      [0.05, 0.15, 0.045],
      trail,
    );
    strip.rotation.z = Math.cos(a) * 0.15;
  }
  const legRig: {
    upper: THREE.Mesh;
    lower: THREE.Mesh;
    knee: THREE.Mesh;
    side: number;
    ankle: THREE.Vector3;
  }[] = [];
  for (const side of [-1, 1]) {
    const z = side * 0.145;
    const ankle = side < 0 ? vector(-0.4, -0.13, z) : vector(0.23, 0.195, z);
    const foot = ellipsoid(
      human,
      [ankle.x + 0.045, ankle.y - 0.045, z],
      [0.155, 0.05, 0.08],
    );
    foot.rotation.z = Math.atan(0.52);
    for (let j = 0; j < 5; j++)
      ellipsoid(
        human,
        [ankle.x + 0.168, ankle.y + 0.004, z + (j - 2) * 0.027],
        [0.045 - j * 0.003, 0.027, 0.018],
      );
    const upper = mesh(human, muscle, skin),
      lower = mesh(human, muscle, skin),
      knee = ellipsoid(human, [0, 0, 0], [0.078, 0.075, 0.072]);
    legRig.push({ upper, lower, knee, side, ankle });
  }
  const armRig: {
    upper: THREE.Mesh;
    lower: THREE.Mesh;
    elbow: THREE.Mesh;
    side: number;
    hand: THREE.Group;
  }[] = [];
  for (const side of [-1, 1]) {
    const upper = mesh(human, muscle, skin),
      lower = mesh(human, muscle, skin);
    const elbow = ellipsoid(human, [0, 0, 0], [0.067, 0.068, 0.067]);
    const hand = new THREE.Group();
    human.add(hand);
    const palm = ellipsoid(hand, [0, 0, 0], [0.034, 0.069, 0.053]);
    palm.rotation.z = -0.3;
    for (let f = 0; f < 4; f++) {
      const z = (f - 1.5) * 0.024;
      tube(
        hand,
        [
          vector(0.015, 0.025, z),
          vector(0.042, 0.075, z),
          vector(0.058, 0.103, z),
          vector(0.068, 0.112, z),
        ],
        0.01,
        skin,
        12,
      );
    }
    tube(
      hand,
      [
        vector(0.005, -0.02, -side * 0.04),
        vector(0.046, -0.035, -side * 0.065),
        vector(0.071, -0.012, -side * 0.065),
      ],
      0.014,
      skin,
      12,
    );
    armRig.push({ upper, lower, elbow, side, hand });
  }

  const anchors = {
    about: ringPoint(2.28),
    work: vector(-0.65, -0.12, 0.2),
    projects: vector(0.65, 0.25, 0.45),
    learning: vector(-0.9, -1.98, 0.57),
    writing: vector(0.5, -1.7, 0.92),
    contact: head.position.clone(),
  } satisfies Record<ChapterId, THREE.Vector3>;
  function animate(seconds: number, reduced = false) {
    const phase = reduced ? 0 : (seconds * Math.PI * 2) / 6.4;
    const effort = Math.sin(phase),
      breath = effort * 0.014;
    torso.position.y = breath;
    torso.rotation.z = effort * 0.009;
    cloth.rotation.z = effort * 0.012;
    stone.position.set(0.58 + effort * 0.01, 0.18 + effort * 0.0052, 0);
    stone.rotation.set(0.18, -0.28, -effort * 0.022);
    for (const leg of legRig) {
      const hip = vector(0.015, 0.64 + breath, leg.side * 0.135);
      const d = leg.ankle.clone().sub(hip),
        distance = d.length(),
        direction = d.clone().normalize();
      const a =
        (0.5 * 0.5 - 0.49 * 0.49 + distance * distance) / (2 * distance);
      const h = Math.sqrt(Math.max(0, 0.5 * 0.5 - a * a));
      const perpendicular = vector(-direction.y, direction.x, 0).normalize();
      const knee = hip
        .clone()
        .addScaledVector(direction, a)
        .addScaledVector(perpendicular, h);
      connect(leg.upper, hip, knee, 0.091, 1.02);
      connect(leg.lower, knee, leg.ankle, 0.064);
      leg.knee.position.copy(knee);
    }
    for (const arm of armRig) {
      const shoulder = vector(0.25, 1.1 + breath, arm.side * 0.215);
      const elbow = vector(
        0.53 + effort * 0.009,
        1.105 + breath,
        arm.side * 0.24,
      );
      const hand = stone.position
        .clone()
        .sub(human.position)
        .add(vector(-0.608, -0.16, arm.side * 0.235));
      connect(arm.upper, shoulder, elbow, 0.071);
      connect(arm.lower, elbow, hand, 0.051);
      arm.elbow.position.copy(elbow);
      arm.hand.position.copy(hand);
      arm.hand.rotation.z = -0.5;
    }
    anchors.projects.copy(stone.position).add(vector(0.08, 0.12, 0.45));
    anchors.work.set(-0.63, -0.07 + breath, 0.22);
  }
  function setTheme(darkMode: boolean) {
    const colors: Record<string, string> = darkMode
      ? {
          serpent: "#79897f",
          carved: "#b0b4a5",
          skin: "#c9c7b8",
          rock: "#9a9c92",
          trail: "#ded2be",
          dark: "#2c3531",
          brass: "#b69e78",
          eye: "#101714",
        }
      : {
          serpent: "#5b655b",
          carved: "#93998d",
          skin: "#b9b8a9",
          rock: "#91968d",
          trail: "#d2cabc",
          dark: "#252c2a",
          brass: "#9b8162",
          eye: "#101714",
        };
    for (const { material: m, role } of materials) m.color.set(colors[role]);
  }
  function dispose() {
    geometries.forEach((g) => g.dispose());
    materials.forEach(({ material: m }) => m.dispose());
    textures.forEach((t) => t.dispose());
  }
  animate(0);
  return { root, parts, anchors, animate, setTheme, dispose };
}
export function pickedChapter(
  object: THREE.Object3D | null,
): ChapterId | undefined {
  while (object) {
    if (object.userData.chapter) return object.userData.chapter as ChapterId;
    object = object.parent;
  }
  return undefined;
}
