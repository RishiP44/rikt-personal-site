import * as THREE from "three";

// Smooth, deterministic surface variation: no model downloads or random seeds.
function valueNoise(x: number, y: number, z: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    iz = Math.floor(z);
  const smooth = (v: number) => v * v * (3 - 2 * v);
  const u = smooth(x - ix),
    v = smooth(y - iy),
    w = smooth(z - iz);
  const hash = (a: number, b: number, c: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  };
  const mix = THREE.MathUtils.lerp;
  return mix(
    mix(
      mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), u),
      mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), u),
      v,
    ),
    mix(
      mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), u),
      mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), u),
      v,
    ),
    w,
  );
}
export function grain(x: number, y: number, z: number) {
  return (
    valueNoise(x * 5.1, y * 5.1, z * 5.1) * 0.6 +
    valueNoise(x * 13.7 + 31, y * 13.7 + 17, z * 13.7 - 9) * 0.28 +
    valueNoise(x * 29.3, y * 29.3, z * 29.3) * 0.12
  );
}

export function stoneGeometry(radius: number, detail = 4) {
  const geometry = new THREE.SphereGeometry(
    radius,
    32 + detail * 12,
    24 + detail * 8,
  );
  const p = geometry.getAttribute("position");
  const colors = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    const n = grain(x * 1.8, y * 1.8, z * 1.8);
    const scale = 1 + n * 0.085;
    p.setXYZ(i, x * scale, y * scale, z * scale);
    const shade = 0.76 + n * 0.2;
    colors.push(shade, shade * 0.99, shade * 0.96);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function terrainGeometry() {
  const positions: number[] = [],
    indices: number[] = [],
    colors: number[] = [];
  const nx = 64,
    nz = 32;
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i <= nx; i++) {
      const u = i / nx,
        x = -1.93 + u * 3.52;
      const width = 0.09 + Math.pow(Math.sin(u * Math.PI), 0.7) * 0.9;
      for (let j = 0; j <= nz; j++) {
        const v = (j / nz) * 2 - 1,
          z = v * width;
        const top = x * 0.52 - 0.9;
        const depth = 0.12 + Math.sin(u * Math.PI) * 1.24;
        const rough = grain(x * 1.5, v * 1.7, z) * 0.12;
        const y =
          layer === 0
            ? top -
              Math.pow(Math.abs(v), 1.8) * Math.min(depth * 0.4, 0.32) +
              rough * Math.min(1, Math.abs(v) * 4)
            : top - depth + rough * 0.7;
        positions.push(x, y, z);
        const shade = 0.79 + rough * 1.1 + (layer === 0 ? 0.08 : 0);
        colors.push(shade, shade * 0.99, shade * 0.96);
      }
    }
  }
  const stride = nz + 1,
    offset = (nx + 1) * stride;
  const quad = (
    a: number,
    b: number,
    c: number,
    d: number,
    reverse = false,
  ) => {
    if (reverse) indices.push(a, c, b, b, c, d);
    else indices.push(a, b, c, b, d, c);
  };
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const a = i * stride + j;
      quad(a, a + 1, a + stride, a + stride + 1);
      quad(
        a + offset,
        a + offset + 1,
        a + offset + stride,
        a + offset + stride + 1,
        true,
      );
    }
  for (let i = 0; i < nx; i++) {
    const a = i * stride;
    quad(a, a + stride, a + offset, a + offset + stride);
    const b = a + nz;
    quad(b, b + offset, b + stride, b + offset + stride);
  }
  for (let j = 0; j < nz; j++) {
    quad(j, j + offset, j + 1, j + offset + 1);
    const a = nx * stride + j;
    quad(a, a + 1, a + offset, a + offset + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function torsoGeometry() {
  // Pelvis, abdomen, rib cage and shoulder girdle form one continuous surface.
  const rings = [
    [0, 0.62, 0.16, 0.13],
    [0.025, 0.73, 0.17, 0.13],
    [0.07, 0.83, 0.135, 0.105],
    [0.13, 0.94, 0.19, 0.14],
    [0.21, 1.05, 0.235, 0.16],
    [0.25, 1.12, 0.24, 0.14],
    [0.28, 1.17, 0.1, 0.08],
  ];
  const points: number[] = [],
    indices: number[] = [];
  const nr = 48,
    ns = 40;
  for (let i = 0; i <= nr; i++) {
    const t = (i / nr) * (rings.length - 1),
      k = Math.min(Math.floor(t), rings.length - 2);
    const f = t - k,
      a = rings[k],
      b = rings[k + 1];
    const x = THREE.MathUtils.lerp(a[0], b[0], f),
      y = THREE.MathUtils.lerp(a[1], b[1], f);
    const w = THREE.MathUtils.lerp(a[2], b[2], f),
      d = THREE.MathUtils.lerp(a[3], b[3], f);
    for (let j = 0; j <= ns; j++) {
      const angle = (j / ns) * Math.PI * 2;
      const musculature =
        1 + Math.sin((i / nr) * Math.PI * 4) * Math.cos(angle * 2) * 0.035;
      points.push(
        x + Math.cos(angle) * d * musculature,
        y,
        Math.sin(angle) * w * musculature,
      );
    }
  }
  for (let i = 0; i < nr; i++)
    for (let j = 0; j < ns; j++) {
      const a = i * (ns + 1) + j,
        b = a + ns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export function muscleGeometry() {
  return new THREE.LatheGeometry(
    Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return new THREE.Vector2(
        0.68 + Math.sin(Math.PI * t) * 0.32 - t * 0.14,
        t - 0.5,
      );
    }),
    24,
  );
}

export function rotateView(
  camera: THREE.Camera,
  target: THREE.Vector3,
  axis: THREE.Vector3,
  angle: number,
) {
  const q = new THREE.Quaternion().setFromAxisAngle(
    axis.clone().normalize(),
    angle,
  );
  camera.position.sub(target).applyQuaternion(q).add(target);
  camera.up.applyQuaternion(q).normalize();
  camera.lookAt(target);
  camera.updateMatrixWorld();
}
