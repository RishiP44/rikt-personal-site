import * as THREE from "three";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createEngine, pickedChapter } from "../lib/ouroboros-model";
import { rotateView } from "../lib/sculpture-geometry";
import { chapters, type ChapterId } from "../lib/apparatus";

const stage = document.querySelector<HTMLElement>("[data-apparatus]");
if (stage) enhance(stage);
function enhance(stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLCanvasElement>("canvas")!;
  const viewport = stage.querySelector<HTMLElement>(".apparatus-viewport")!;
  const tools = stage.querySelector<HTMLElement>(".apparatus-controls")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return;
  }
  const model = createEngine(),
    scene = new THREE.Scene();
  scene.add(model.root);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const pmrem = new THREE.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.55;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x647267, 0.85));
  const key = new THREE.DirectionalLight(0xfff5e5, 2.3);
  key.position.set(-4, 6, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -4,
    right: 4,
    top: 4,
    bottom: -4,
    near: 0.1,
    far: 25,
  });
  key.shadow.normalBias = 0.025;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd6e7eb, 1.1);
  fill.position.set(4, 1, -5);
  scene.add(fill);
  const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.075 });
  const floorGeometry = new THREE.PlaneGeometry(200, 200),
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.05;
  floor.receiveShadow = true;
  scene.add(floor);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const initialDirection = new THREE.Vector3(0.7, 0.55, 12).normalize();
  let fit = 12;
  camera.position.copy(initialDirection).multiplyScalar(fit);
  // The runtime exposes target; the upstream declaration currently omits it.
  const controls = new ArcballControls(
    camera,
    canvas,
    scene,
  ) as ArcballControls & { target: THREE.Vector3 };
  controls.enableGrid = false;
  controls.enableFocus = false;
  controls.cursorZoom = false;
  controls.enableAnimations = !reduced.matches;
  controls.dampingFactor = 18;
  controls.wMax = 2.5;
  controls.setGizmosVisible(false);
  let paused = false,
    elapsed = 0,
    last = performance.now(),
    frame = 0,
    disposed = false;
  const projected = new Map<ChapterId, THREE.Vector2>();
  const links = new Map(
    chapters.map((c) => [
      c.id,
      stage.querySelector<HTMLAnchorElement>(
        '[data-scene-node="' + c.id + '"]',
      )!,
    ]),
  );
  function draw(now: number) {
    frame = 0;
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused && !reduced.matches && !document.hidden) elapsed += dt;
    model.animate(elapsed, reduced.matches);
    model.root.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    const outer = stage.getBoundingClientRect(),
      view = canvas.getBoundingClientRect();
    for (const { id } of chapters) {
      const v = model.anchors[id].clone().project(camera);
      const x = (v.x * 0.5 + 0.5) * view.width + view.left - outer.left;
      const y = (-v.y * 0.5 + 0.5) * view.height + view.top - outer.top;
      projected.set(id, new THREE.Vector2(x, y));
      const label = links.get(id)!.getBoundingClientRect();
      const line = stage.querySelector<SVGLineElement>(
        '[data-ray="' + id + '"]',
      )!;
      const lx = label.left + label.width / 2 - outer.left,
        ly = label.top + label.height / 2 - outer.top;
      line.setAttribute("x1", String(x));
      line.setAttribute("y1", String(y));
      line.setAttribute("x2", String(lx));
      line.setAttribute("y2", String(ly));
      for (const attr of ["pin", "halo"]) {
        const circle = stage.querySelector<SVGCircleElement>(
          "[data-" + attr + '="' + id + '"]',
        )!;
        circle.setAttribute("cx", String(x));
        circle.setAttribute("cy", String(y));
      }
      stage.querySelector<SVGGElement>(
        '[data-marker="' + id + '"]',
      )!.style.visibility = v.z > 1 ? "hidden" : "visible";
    }
    if (!paused && !reduced.matches && !document.hidden) requestDraw();
  }
  function requestDraw() {
    if (!frame && !disposed) {
      frame = requestAnimationFrame(draw);
    }
  }
  function resize() {
    const box = viewport.getBoundingClientRect(),
      aspect = box.width / Math.max(1, box.height);
    const next = Math.max(
      10.7,
      (6.4 / (2 * Math.tan(THREE.MathUtils.degToRad(19)) * aspect)) * 1.1,
    );
    camera.position
      .sub(controls.target)
      .multiplyScalar(next / fit)
      .add(controls.target);
    fit = next;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    controls.minDistance = fit * 0.48;
    controls.maxDistance = fit * 2.7;
    renderer.setSize(box.width, box.height, false);
    controls.update();
    requestDraw();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  const themeObserver = new MutationObserver(() => {
    model.setTheme(document.documentElement.dataset.theme === "dark");
    requestDraw();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  model.setTheme(document.documentElement.dataset.theme === "dark");
  controls.addEventListener("change", requestDraw);
  function reset() {
    controls.target.set(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.position.copy(initialDirection).multiplyScalar(fit);
    camera.lookAt(0, 0, 0);
    controls.setCamera(camera);
    controls.setGizmosVisible(false);
    controls.saveState();
    requestDraw();
  }
  function zoom(factor: number) {
    camera.position
      .sub(controls.target)
      .multiplyScalar(factor)
      .clampLength(controls.minDistance, controls.maxDistance)
      .add(controls.target);
    controls.update();
    requestDraw();
  }
  function rotate(axis: THREE.Vector3, angle: number) {
    rotateView(camera, controls.target, axis, angle);
    controls.update();
    requestDraw();
  }
  function pause() {
    paused = !paused;
    const button = stage.querySelector<HTMLButtonElement>(
      '[data-control="pause"]',
    )!;
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute(
      "aria-label",
      paused ? "Resume sculpture motion" : "Pause sculpture motion",
    );
    button.textContent = paused ? "▷" : "Ⅱ";
    requestDraw();
  }
  function action(name: string) {
    if (name === "reset") reset();
    if (name === "zoom-in") zoom(0.86);
    if (name === "zoom-out") zoom(1.16);
    if (name === "roll-left" || name === "roll-right")
      rotate(
        camera.getWorldDirection(new THREE.Vector3()),
        name === "roll-left" ? 0.18 : -0.18,
      );
    if (name === "pause") pause();
  }
  tools.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-control]",
    );
    if (button) action(button.dataset.control!);
  });
  canvas.addEventListener("keydown", (event) => {
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const map: Record<string, () => void> = {
      ArrowLeft: () => rotate(camera.up, 0.12),
      ArrowRight: () => rotate(camera.up, -0.12),
      ArrowUp: () => rotate(right, 0.12),
      ArrowDown: () => rotate(right, -0.12),
      q: () => action("roll-left"),
      e: () => action("roll-right"),
      "+": () => zoom(0.86),
      "=": () => zoom(0.86),
      "-": () => zoom(1.16),
      Home: reset,
      " ": pause,
    };
    const handler = map[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  });
  const pointers = new Map<
    number,
    { x: number; y: number; moved: boolean; button: number }
  >();
  let multi = false;
  canvas.addEventListener("pointerdown", (event) => {
    pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      moved: false,
      button: event.button,
    });
    if (pointers.size > 1) multi = true;
  });
  window.addEventListener("pointermove", (event) => {
    const point = pointers.get(event.pointerId);
    if (
      point &&
      Math.hypot(event.clientX - point.x, event.clientY - point.y) > 6
    )
      point.moved = true;
  });
  function release(event: PointerEvent) {
    const point = pointers.get(event.pointerId);
    pointers.delete(event.pointerId);
    if (
      point &&
      !point.moved &&
      !multi &&
      point.button === 0 &&
      event.type === "pointerup"
    ) {
      const rect = stage.getBoundingClientRect(),
        pos = new THREE.Vector2(
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      const close = [...projected].sort(
        (a, b) => a[1].distanceTo(pos) - b[1].distanceTo(pos),
      )[0];
      let id: ChapterId | undefined =
        close && close[1].distanceTo(pos) < 18 ? close[0] : undefined;
      if (!id) {
        const bounds = canvas.getBoundingClientRect(),
          ray = new THREE.Raycaster();
        ray.setFromCamera(
          new THREE.Vector2(
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
            (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
          ),
          camera,
        );
        id = pickedChapter(
          ray.intersectObject(model.root, true)[0]?.object ?? null,
        );
      }
      const destination = chapters.find((c) => c.id === id);
      if (destination) window.location.assign(destination.href);
    }
    if (pointers.size === 0) multi = false;
  }
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  const motionChange = () => {
    controls.enableAnimations = !reduced.matches;
    requestDraw();
  };
  reduced.addEventListener("change", motionChange);
  const visibility = () => {
    last = performance.now();
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else requestDraw();
  };
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stage.dataset.renderState = "static";
    canvas.hidden = true;
    tools.hidden = true;
    cancelAnimationFrame(frame);
    frame = 0;
    disposed = true;
  });
  window.addEventListener(
    "pagehide",
    (event) => {
      if (event.persisted) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      controls.dispose();
      model.dispose();
      environment.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      renderer.dispose();
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      reduced.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibility);
    },
    { once: true },
  );
  stage.dataset.renderState = "webgl";
  canvas.hidden = false;
  tools.hidden = false;
  stage.querySelector("[data-gesture-note]")!.textContent =
    "Drag · Pinch · Twist";
  resize();
  reset();
  requestDraw();
}
