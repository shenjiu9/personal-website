// WebGL version of the hero composition: the logo's primitives (v bar, l bar, a ring,
// the half-disc and the orange dot) as glossy objects that assemble, float, and turn
// toward the pointer. Loaded lazily on desktop only; the SVG composition is the fallback.
import {
  ACESFilmicToneMapping, BoxGeometry, Clock, Color, CylinderGeometry, Group, Mesh,
  MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator, Scene, SphereGeometry,
  SRGBColorSpace, TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);

export function initHeroGL(host: HTMLElement) {
  const css = getComputedStyle(document.documentElement);
  const fg = new Color(css.getPropertyValue('--fg').trim() || '#111');
  const bg = new Color(css.getPropertyValue('--bg').trim() || '#f4f2ee');
  const accent = new Color(css.getPropertyValue('--accent').trim() || '#ff4d00');

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = 'hero-gl';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, -0.2, 13.5);

  const dark = new MeshPhysicalMaterial({ color: fg, roughness: 0.28, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.15 });
  const light = new MeshPhysicalMaterial({ color: bg.clone().lerp(new Color('#a39b8f'), 0.45), roughness: 0.35, clearcoat: 0.6, sheen: 0.4 });
  const glass = new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 1, thickness: 0.6, ior: 1.4, transparent: true });
  const orange = new MeshPhysicalMaterial({ color: accent, roughness: 0.2, clearcoat: 1, emissive: accent, emissiveIntensity: 0.12 });

  const group = new Group();
  scene.add(group);

  type Piece = { mesh: Mesh; home: Vector3; from: Vector3; spin: Vector3; depth: number; delay: number };
  const pieces: Piece[] = [];
  const add = (mesh: Mesh, home: [number, number, number], rot: [number, number, number], depth: number, delay: number) => {
    mesh.rotation.set(...rot);
    const h = new Vector3(...home);
    const from = h.clone().add(new Vector3((Math.random() - 0.5) * 6, 5 + Math.random() * 3, -4));
    mesh.position.copy(from);
    group.add(mesh);
    pieces.push({ mesh, home: h, from, spin: new Vector3(Math.random() - 0.5, Math.random() - 0.5, 0).multiplyScalar(0.25), depth, delay });
  };

  // v diagonal and l stem
  add(new Mesh(new BoxGeometry(0.42, 5.2, 0.42), dark), [-1.55, -0.1, 0.4], [0, 0.2, 0.36], 0.8, 0);
  add(new Mesh(new BoxGeometry(0.42, 5.8, 0.42), dark), [1.75, 0.2, 0], [0, -0.3, 0], 0.6, 0.12);
  // a — glass ring and a solid half-disc
  add(new Mesh(new TorusGeometry(1.9, 0.07, 32, 160), glass), [0.15, 0.2, -0.6], [0.25, -0.2, 0], 0.35, 0.22);
  add(new Mesh(new CylinderGeometry(1.25, 1.25, 0.36, 96, 1, false, -Math.PI / 2, Math.PI), light), [0.2, -0.55, 0.8], [Math.PI / 2, 0, 0], 1, 0.32);
  // the dot
  add(new Mesh(new SphereGeometry(0.36, 64, 64), orange), [2.35, -2.2, 1.2], [0, 0, 0], 1.4, 0.5);

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX / innerWidth - 0.5;
    pointer.ty = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);

  const clock = new Clock();
  let shown = false;
  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const scroll = Math.min(scrollY / innerHeight, 1);

    for (const p of pieces) {
      const k = ease((t - p.delay) / 1.8);
      p.mesh.position.lerpVectors(p.from, p.home, k);
      p.mesh.position.y += Math.sin(t * 0.8 + p.depth * 3) * 0.06 * p.depth;
      p.mesh.position.x += pointer.x * p.depth * 0.5;
      p.mesh.position.y -= pointer.y * p.depth * 0.4;
      p.mesh.rotation.x += p.spin.x * 0.01 * (1 - k * 0.8);
      p.mesh.rotation.y += p.spin.y * 0.01 * (1 - k * 0.8);
    }
    group.rotation.y = pointer.x * 0.5 + Math.sin(t * 0.25) * 0.08 + scroll * 0.6;
    group.rotation.x = pointer.y * 0.3 + scroll * 0.25;
    group.position.y = scroll * 1.2;
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      host.classList.add('gl-ready');
    }
  };
  loop();
}
