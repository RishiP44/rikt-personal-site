import * as THREE from "three";
import type { ChapterId } from "./apparatus";

export function createEngine() {
  const root = new THREE.Group();
  root.name = "The Ouroboric Engine";
  const parts = new Map<ChapterId, THREE.Group>();
  const materials: {
    material: THREE.MeshStandardMaterial | THREE.LineBasicMaterial;
    role: string;
  }[] = [];
  const geometries = new Set<THREE.BufferGeometry>();
  const material = (role: string, color: string, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.75,
      metalness,
      flatShading: true,
    });
    materials.push({ material: m, role });
    return m;
  };
  const stone = material("stone", "#c7c1b3");
  const serpent = material("serpent", "#8e897c", 0.25);
  const person = material("person", "#292b27");
  const brass = material("brass", "#a88a51", 0.4);
  const eye = material("eye", "#161614");
  const lines = new THREE.LineBasicMaterial({
    color: "#514c41",
    transparent: true,
    opacity: 0.35,
  });
  materials.push({ material: lines, role: "line" });
  const contour = new THREE.LineBasicMaterial({
    color: "#37382f",
    transparent: true,
    opacity: 0.48,
  });
  materials.push({ material: contour, role: "contour" });

  const part = (id: ChapterId) => {
    const group = new THREE.Group();
    group.name = id;
    group.userData.chapter = id;
    root.add(group);
    parts.set(id, group);
    return group;
  };
  const mesh = (
    parent: THREE.Group,
    geometry: THREE.BufferGeometry,
    m: THREE.Material,
    position = [0, 0, 0],
    outline = true,
  ) => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, m);
    object.position.set(position[0], position[1], position[2]);
    parent.add(object);
    if (outline) {
      const edges = new THREE.EdgesGeometry(geometry, 24);
      geometries.add(edges);
      object.add(new THREE.LineSegments(edges, contour));
    }
    return object;
  };
  const box = (
    parent: THREE.Group,
    size: number[],
    position: number[],
    m = stone,
  ) =>
    mesh(parent, new THREE.BoxGeometry(size[0], size[1], size[2]), m, position);
  const curveLine = (parent: THREE.Group, points: THREE.Vector3[]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometries.add(geometry);
    const object = new THREE.Line(geometry, lines);
    parent.add(object);
    return object;
  };

  // A tapered, visibly articulated serpent, with its tail held in its mouth.
  const identity = part("about");
  const radius = 2.7;
  const start = 0.42,
    end = Math.PI * 2 + 0.3;
  const ringPoint = (angle: number, r = radius) =>
    new THREE.Vector3(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      Math.sin(angle * 3) * 0.075,
    );
  const points = Array.from({ length: 121 }, (_, i) =>
    ringPoint(start + ((end - start) * i) / 120),
  );
  const path = new THREE.CatmullRomCurve3(points);
  mesh(
    identity,
    new THREE.TubeGeometry(path, 144, 0.125, 8, false),
    serpent,
    [0, 0, 0],
    false,
  );
  for (let i = 0; i < 72; i++) {
    const angle = start + ((end - start) * i) / 72;
    const p = ringPoint(angle, radius + 0.025);
    const scale = box(
      identity,
      [0.115, 0.14, 0.215],
      p.toArray(),
      i % 12 === 0 ? brass : serpent,
    );
    scale.rotation.z = angle + Math.PI / 2;
  }
  const signal = part("contact");
  const head = new THREE.Group();
  signal.add(head);
  head.position.copy(ringPoint(start));
  head.rotation.z = start - Math.PI / 2;
  const skull = mesh(head, new THREE.DodecahedronGeometry(0.26, 0), serpent);
  skull.scale.set(1.55, 0.74, 0.7);
  box(head, [0.36, 0.055, 0.23], [0.14, -0.095, 0], brass);
  mesh(
    head,
    new THREE.SphereGeometry(0.027, 8, 6),
    eye,
    [0.07, 0.072, 0.17],
    false,
  );
  mesh(
    head,
    new THREE.SphereGeometry(0.027, 8, 6),
    eye,
    [0.07, 0.072, -0.17],
    false,
  );
  const tail = mesh(
    identity,
    new THREE.ConeGeometry(0.12, 0.53, 8),
    serpent,
    ringPoint(end - 0.04).toArray(),
  );
  tail.rotation.z = end;

  // A cutaway ridge occupies the lower arc; the upper chamber is left open.
  const mountain = part("learning");
  const profile = new THREE.Shape();
  profile.moveTo(-2.04, -1.81);
  profile.lineTo(-1.68, -1.61);
  profile.lineTo(-1.28, -1.41);
  profile.lineTo(-0.88, -1.21);
  profile.lineTo(-0.48, -1.01);
  profile.lineTo(-0.08, -0.81);
  profile.lineTo(0.32, -0.61);
  profile.lineTo(0.72, -0.41);
  profile.lineTo(1.12, -0.21);
  profile.lineTo(1.38, -0.1);
  profile.lineTo(1.22, -1.62);
  profile.lineTo(0.25, -2.17);
  profile.lineTo(-1.22, -2.09);
  profile.closePath();
  const ridge = new THREE.ExtrudeGeometry(profile, {
    depth: 0.44,
    bevelEnabled: false,
  });
  const vertices = ridge.getAttribute("position");
  for (let i = 0; i < vertices.count; i++) {
    if (vertices.getZ(i) > 0.4) {
      vertices.setZ(
        i,
        0.44 + Math.sin(vertices.getX(i) * 2.3 + vertices.getY(i) * 1.2) * 0.14,
      );
    }
  }
  ridge.computeVertexNormals();
  mesh(mountain, ridge, stone, [0, 0, -0.22]);
  for (let i = 0; i < 8; i++) {
    const x = -1.8 + i * 0.4;
    const y = x * 0.5 - 0.81;
    curveLine(mountain, [
      new THREE.Vector3(x, y - 0.04, 0.232),
      new THREE.Vector3(x + 0.22, y - 0.34, 0.232),
      new THREE.Vector3(x + 0.15, -1.9 + i * 0.035, 0.232),
    ]);
  }
  for (let i = 0; i < 12; i++) {
    const x = -1.91 + i * 0.27;
    const ledge = box(
      mountain,
      [0.275, 0.038, 0.57],
      [x, x * 0.5 - 0.795, 0],
      i % 4 === 0 ? brass : stone,
    );
    ledge.rotation.z = Math.atan(0.5);
  }

  const builder = part("work");
  const human = new THREE.Group();
  builder.add(human);
  const torso = new THREE.Group();
  human.add(torso);
  torso.position.y = 0.57;
  torso.rotation.z = -0.27;
  box(torso, [0.3, 0.46, 0.25], [0, 0.16, 0], person);
  box(torso, [0.245, 0.245, 0.25], [0, 0.55, 0], person);
  box(torso, [0.07, 0.07, 0.19], [0.145, 0.535, 0], person);
  const limbs: THREE.Group[] = [];
  for (const z of [-0.12, 0.12]) {
    const arm = new THREE.Group();
    torso.add(arm);
    arm.position.set(0.08, 0.32, z);
    arm.rotation.z = 0.97;
    box(arm, [0.105, 0.38, 0.11], [0, -0.17, 0], person);
    box(arm, [0.11, 0.32, 0.11], [0.14, -0.38, 0], person).rotation.z = -0.85;
    box(arm, [0.13, 0.1, 0.13], [0.26, -0.46, 0], brass);
    const leg = new THREE.Group();
    human.add(leg);
    leg.position.set(0, 0.57, z);
    limbs.push(leg);
    box(leg, [0.12, 0.31, 0.12], [0, -0.14, 0], person);
    box(leg, [0.11, 0.3, 0.115], [-0.085, -0.41, 0], person).rotation.z = -0.36;
    box(leg, [0.24, 0.09, 0.16], [-0.02, -0.565, 0], person);
  }
  const project = part("projects");
  const boulder = mesh(project, new THREE.DodecahedronGeometry(0.53, 0), stone);
  const record = part("writing");
  for (const r of [3.0, 3.07])
    curveLine(
      record,
      Array.from(
        { length: 129 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 128) * Math.PI * 2) * r,
            Math.sin((i / 128) * Math.PI * 2) * r,
            -0.16,
          ),
      ),
    );
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    curveLine(record, [
      ringPoint(angle, 2.94),
      ringPoint(angle, i % 6 === 0 ? 3.18 : 3.08),
    ]);
  }
  const anchors = {
    about: new THREE.Vector3(-2.5, 1, 0),
    work: new THREE.Vector3(-0.6, 0.05, 0.15),
    projects: new THREE.Vector3(0.5, -0.05, 0),
    learning: new THREE.Vector3(0.6, -1.5, 0.25),
    writing: new THREE.Vector3(-1.4, -2.7, 0),
    contact: head.position.clone(),
  } satisfies Record<ChapterId, THREE.Vector3>;

  const setEffort = (progress: number, reduced = false) => {
    const cycle = reduced ? 0.3 : (1 - Math.cos(progress * Math.PI * 4)) / 2;
    const x = -0.65 + cycle * 0.5;
    human.position.set(x, x * 0.5 - 0.8, 0.05);
    limbs[0].rotation.z =
      -0.3 + (reduced ? 0 : Math.sin(cycle * Math.PI * 4) * 0.24);
    limbs[1].rotation.z =
      0.3 - (reduced ? 0 : Math.sin(cycle * Math.PI * 4) * 0.24);
    boulder.position.set(x + 0.79, (x + 0.79) * 0.5 - 0.28, 0);
    boulder.rotation.z = -cycle * Math.PI;
    anchors.work.copy(human.position).add(new THREE.Vector3(0, 0.7, 0.2));
    anchors.projects.copy(boulder.position);
  };
  const setTheme = (dark: boolean) => {
    const palette: Record<string, string> = dark
      ? {
          stone: "#bab6ac",
          serpent: "#7e817b",
          person: "#e8e4d8",
          brass: "#cfb781",
          eye: "#11131a",
          line: "#e8e4d8",
          contour: "#353830",
        }
      : {
          stone: "#c7c1b3",
          serpent: "#8e897c",
          person: "#292b27",
          brass: "#a88a51",
          eye: "#161614",
          line: "#514c41",
          contour: "#37382f",
        };
    for (const { material: m, role } of materials) m.color.set(palette[role]);
    lines.opacity = dark ? 0.22 : 0.35;
  };
  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach(({ material: m }) => m.dispose());
  };
  setEffort(0);
  return { root, parts, anchors, setEffort, setTheme, dispose };
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
