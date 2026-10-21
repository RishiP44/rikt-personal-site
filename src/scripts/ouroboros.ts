import * as THREE from "three";
import { createEngine, pickedChapter } from "../lib/ouroboros-model";
import {
  chapters,
  clamp,
  chapterAt,
  viewAt,
  angleDifference,
  type ChapterId,
} from "../lib/apparatus";

const plate = document.querySelector<HTMLElement>("[data-apparatus]");
if (plate) initialize(plate);

function initialize(plate: HTMLElement) {
  const canvas = plate.querySelector<HTMLCanvasElement>("canvas")!;
  const viewport = plate.querySelector<HTMLElement>(".apparatus-viewport")!;
  const toggle = plate.querySelector<HTMLButtonElement>(".inspect-toggle")!;
  const controls = plate.querySelector<HTMLElement>(".apparatus-controls")!;
  const tools = plate.querySelector<HTMLElement>(".inspection-tools")!;
  const help = plate.querySelector<HTMLElement>("#inspection-help")!;
  const detail = plate.querySelector<HTMLElement>(".part-detail")!;
  const content = document.querySelector<HTMLElement>("#journey-content")!;
  const chapterNodes = [
    ...document.querySelectorAll<HTMLElement>("[data-chapter]"),
  ];
  const links = [
    ...plate.querySelectorAll<HTMLAnchorElement>("[data-scene-node]"),
  ];
  const progressBar = document.querySelector<HTMLElement>(
    ".journey-progress-fill",
  )!;
  const sheet = document.querySelector<HTMLElement>("[data-sheet]")!;
  const progressLabel = document.querySelector<HTMLElement>("[data-progress]")!;
  const navLinks = [
    ...document.querySelectorAll<HTMLAnchorElement>(".journey-index a"),
  ];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer: THREE.WebGLRenderer;
  let engine: ReturnType<typeof createEngine>;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let frame = 0,
    lastTime = 0,
    progress = 0,
    motionProgress = 0,
    inspect = false,
    zoom = 1,
    graphicsReady = false;
  let sectionPositions: { id: string; top: number; height: number }[] = [];
  let selected: ChapterId | undefined;
  let pointer:
    | {
        id: number;
        x: number;
        y: number;
        startX: number;
        startY: number;
        moved: boolean;
      }
    | undefined;
  let width = 1,
    height = 1;
  const target = { x: -0.13, y: -0.35, z: 0.08 };
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function updateStory() {
    progress = clamp(
      window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
      0,
      1,
    );
    const id = chapterAt(window.scrollY, sectionPositions);
    document.documentElement.dataset.journeyChapter = id;
    const chapter = chapters.find((c) => c.id === id);
    sheet.textContent = chapter
      ? `${chapter.number} / ${chapter.label}`
      : "00 / The apparatus";
    progressLabel.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")}%`;
    progressBar.style.transform = `scaleY(${progress})`;
    navLinks.forEach((link) =>
      link.setAttribute("aria-current", String(link.hash === `#${id}`)),
    );
    links.forEach((link) =>
      link.classList.toggle("is-active", link.dataset.sceneNode === id),
    );
    if (!inspect) Object.assign(target, viewAt(progress));
    requestRender();
  }

  function resize() {
    sectionPositions = chapterNodes.map((node) => ({
      id: node.id,
      top: node.getBoundingClientRect().top + window.scrollY,
      height: node.offsetHeight,
    }));
    const rect = viewport.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (renderer) {
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }
    const rays = plate.querySelector(".apparatus-rays")!;
    rays.setAttribute(
      "viewBox",
      `0 0 ${window.innerWidth} ${window.innerHeight}`,
    );
    updateStory();
  }

  function requestRender() {
    if (graphicsReady && !frame && !document.hidden)
      frame = requestAnimationFrame(render);
  }

  function render(time: number) {
    frame = 0;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = time;
    const amount = reduce.matches ? 1 : 1 - Math.exp(-9 * delta);
    let remaining = 0;
    for (const axis of ["x", "y", "z"] as const) {
      const difference = angleDifference(
        engine.root.rotation[axis],
        target[axis],
      );
      engine.root.rotation[axis] += difference * amount;
      remaining += Math.abs(difference);
    }
    engine.root.scale.setScalar(zoom);
    const progressDifference = progress - motionProgress;
    motionProgress += progressDifference * amount;
    remaining += Math.abs(progressDifference);
    engine.setEffort(motionProgress, reduce.matches);
    engine.root.updateMatrixWorld(true);
    renderer.render(scene, camera);
    const rect = viewport.getBoundingClientRect();
    for (const link of links) {
      const id = link.dataset.sceneNode as ChapterId;
      const point = engine.anchors[id]
        .clone()
        .applyMatrix4(engine.root.matrixWorld)
        .project(camera);
      const label = link.getBoundingClientRect();
      const line = plate.querySelector<SVGLineElement>(`[data-ray="${id}"]`)!;
      line.setAttribute("x1", String(rect.left + ((point.x + 1) * width) / 2));
      line.setAttribute("y1", String(rect.top + ((1 - point.y) * height) / 2));
      line.setAttribute("x2", String(label.left + 10));
      line.setAttribute("y2", String(label.top + label.height / 2));
    }
    if (remaining > 0.001) requestRender();
    else lastTime = 0;
  }

  function select(id: ChapterId) {
    selected = id;
    const item = chapters.find((c) => c.id === id)!;
    plate.querySelector<HTMLElement>("[data-part-number]")!.textContent =
      `${item.number} / ${item.part}`;
    plate.querySelector<HTMLElement>("[data-part-name]")!.textContent =
      item.label;
    plate.querySelector<HTMLElement>("[data-part-description]")!.textContent =
      item.description;
    const link = plate.querySelector<HTMLAnchorElement>("[data-part-link]")!;
    link.href = item.href;
    link.textContent = `Open ${item.label} ↗`;
    detail.hidden = false;
  }

  function releasePointer() {
    if (pointer && canvas.hasPointerCapture(pointer.id))
      canvas.releasePointerCapture(pointer.id);
    pointer = undefined;
    canvas.classList.remove("is-dragging");
  }

  function setInspect(value: boolean) {
    releasePointer();
    inspect = value;
    document.documentElement.classList.toggle("is-inspecting", value);
    content.inert = value;
    if (value) content.setAttribute("aria-hidden", "true");
    else content.removeAttribute("aria-hidden");
    toggle.setAttribute("aria-pressed", String(value));
    toggle.innerHTML = value
      ? 'Back to the journey <span aria-hidden="true">↙</span>'
      : 'Inspect the apparatus <span aria-hidden="true">↗</span>';
    tools.hidden = !value;
    canvas.tabIndex = value ? 0 : -1;
    help.textContent = value
      ? "Drag or use arrow keys to rotate. + / − to zoom. Escape to return."
      : "Scroll to follow the story. Inspect to take a closer look.";
    if (value) {
      select(selected ?? "work");
      canvas.focus({ preventScroll: true });
    } else {
      detail.hidden = true;
      zoom = 1;
      Object.assign(target, viewAt(progress));
      toggle.focus({ preventScroll: true });
    }
    resize();
  }

  function fallback() {
    graphicsReady = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (inspect) setInspect(false);
    plate.dataset.renderState = "fallback";
    canvas.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("scene-enhanced");
    controls.hidden = true;
    plate.querySelector<HTMLElement>(".static-note")!.textContent =
      "Static study · explore through the chapter links.";
  }

  // Story metadata remains useful even when a graphics context is unavailable.
  window.addEventListener("scroll", updateStory, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.fonts.ready.then(resize);
  resize();
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(37, 1, 0.1, 70);
    camera.position.set(0, 0.08, 11.4);
    camera.lookAt(0, 0, 0);
    engine = createEngine();
    scene.add(engine.root);
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 6, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc4bdab, 0.5);
    fill.position.set(4, -1, 2);
    scene.add(fill);
    engine.setTheme(document.documentElement.dataset.theme === "dark");
    plate.dataset.renderState = "ready";
    canvas.removeAttribute("aria-hidden");
    graphicsReady = true;
    document.documentElement.classList.add("scene-enhanced");
    controls.hidden = false;
    resize();
  } catch {
    fallback();
    return;
  }

  toggle.addEventListener("click", () => setInspect(!inspect));
  const zoomBy = (amount: number) => {
    zoom = clamp(zoom + amount, 0.7, 1.55);
    requestRender();
  };
  plate
    .querySelector("[data-control=zoom-in]")!
    .addEventListener("click", () => zoomBy(0.12));
  plate
    .querySelector("[data-control=zoom-out]")!
    .addEventListener("click", () => zoomBy(-0.12));
  plate.querySelector("[data-control=reset]")!.addEventListener("click", () => {
    zoom = 1;
    Object.assign(target, viewAt(progress));
    requestRender();
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (!inspect || pointer || event.button !== 0) return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    target.y += (event.clientX - pointer.x) * 0.008;
    target.x = clamp(target.x + (event.clientY - pointer.y) * 0.008, -1.3, 1.3);
    pointer.moved ||=
      Math.hypot(
        event.clientX - pointer.startX,
        event.clientY - pointer.startY,
      ) > 6;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    requestRender();
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (!pointer.moved) {
      const rect = canvas.getBoundingClientRect();
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster
        .intersectObject(engine.root, true)
        .find((item) => item.object instanceof THREE.Mesh);
      const id = hit && pickedChapter(hit.object);
      if (id) select(id);
    }
    releasePointer();
  });
  canvas.addEventListener("pointercancel", releasePointer);
  canvas.addEventListener("lostpointercapture", releasePointer);
  canvas.addEventListener("keydown", (event) => {
    if (!inspect) return;
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [0, -0.15],
      ArrowRight: [0, 0.15],
      ArrowUp: [-0.15, 0],
      ArrowDown: [0.15, 0],
    };
    if (directions[event.key]) {
      event.preventDefault();
      target.x = clamp(target.x + directions[event.key][0], -1.3, 1.3);
      target.y += directions[event.key][1];
      requestRender();
    }
    if (["+", "=", "-", "_"].includes(event.key)) {
      event.preventDefault();
      zoomBy(event.key === "-" || event.key === "_" ? -0.12 : 0.12);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && inspect) {
      event.preventDefault();
      setInspect(false);
    }
  });
  links.forEach((link) =>
    link.addEventListener("click", (event) => {
      if (inspect) {
        event.preventDefault();
        select(link.dataset.sceneNode as ChapterId);
      }
    }),
  );
  new MutationObserver(() => {
    engine.setTheme(document.documentElement.dataset.theme === "dark");
    requestRender();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  reduce.addEventListener("change", requestRender);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else requestRender();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    fallback();
  });
  window.addEventListener("pagehide", (event) => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (event.persisted) return;
    engine.dispose();
    renderer.dispose();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) requestRender();
  });
}
