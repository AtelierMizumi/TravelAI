import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createPavilionViewer(host: HTMLDivElement, ready: () => void, error: () => void) {
  let renderer: THREE.WebGLRenderer | undefined;
  let controls: OrbitControls | undefined;
  let resize: ResizeObserver | undefined;
  let observer: IntersectionObserver | undefined;
  let frame = 0, disposed = false, visible = false, rendered = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  const target = new THREE.Vector3(0, 1.6, 0);
  camera.position.set(7, 5, 8);
  const initialPosition = camera.position.clone();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motion: { from: THREE.Spherical; to: THREE.Spherical; start: number } | null = null;
  let drawing = false;
  const stopMotion = () => { motion = null; };
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const dispose = () => {
    if (disposed) return;
    disposed = true; motion = null; cancelAnimationFrame(frame); frame = 0;
    observer?.disconnect(); resize?.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    renderer?.domElement.removeEventListener('webglcontextlost', lost);
    controls?.removeEventListener('change', draw); controls?.removeEventListener('start', stopMotion); controls?.dispose();
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    scene.clear();
    renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    host.dataset.renderer = 'disposed';
  };
  const draw = () => {
    if (disposed || !visible || document.hidden || frame || drawing) return;
    frame = requestAnimationFrame((now) => {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      drawing = true;
      try {
        if (motion) {
          const progress = reducedMotion.matches ? 1 : Math.min(1, (now - motion.start) / 180);
          const ease = 1 - Math.pow(1 - progress, 3);
          const position = new THREE.Spherical(
            THREE.MathUtils.lerp(motion.from.radius, motion.to.radius, ease),
            THREE.MathUtils.lerp(motion.from.phi, motion.to.phi, ease),
            THREE.MathUtils.lerp(motion.from.theta, motion.to.theta, ease),
          );
          camera.position.setFromSpherical(position).add(target);
          controls!.update();
          if (progress === 1) motion = null;
        }
        const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
        renderer!.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
        renderer!.render(scene, camera);
        renderer!.domElement.dataset.camera = camera.position.toArray().map(n => n.toFixed(3)).join(',');
        renderer!.domElement.dataset.frames = String(Number(renderer!.domElement.dataset.frames || 0) + 1);
        if (!rendered) { rendered = true; ready(); }
      } catch { dispose(); error(); }
      finally { drawing = false; }
      if (motion) draw();
    });
  };
  const visibility = () => {
    if (controls) controls.enabled = visible && !document.hidden;
    host.dataset.rendering = visible && !document.hidden ? 'on-demand' : 'paused';
    if (!visible || document.hidden) { stopMotion(); cancelAnimationFrame(frame); frame = 0; } else draw();
  };
  // Transient easing only after explicit commands; no idle render loop or wheel capture.
  const moveTo = (position: THREE.Vector3) => {
    if (disposed) return;
    if (reducedMotion.matches || !visible || document.hidden) {
      stopMotion(); camera.position.copy(position); controls!.update(); draw(); return;
    }
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));
    const to = new THREE.Spherical().setFromVector3(position.clone().sub(target));
    to.theta = from.theta + Math.atan2(Math.sin(to.theta - from.theta), Math.cos(to.theta - from.theta));
    motion = { from, to, start: performance.now() }; draw();
  };
  const commandPosition = () => motion ? new THREE.Vector3().setFromSpherical(motion.to).add(target) : camera.position.clone();
  const lost = (event: Event) => { event.preventDefault(); dispose(); error(); };
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor('#e7f5fc');
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('aria-label', 'Mô hình đình Việt Nam 3D');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y';
    host.appendChild(renderer.domElement); host.dataset.renderer = 'active';
    scene.add(new THREE.HemisphereLight(0xe8f6ff, 0x658194, 1.8));
    const sun = new THREE.DirectionalLight(0xffedda, 3); sun.position.set(4, 8, 6); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xb9e3ff, 1.2); fill.position.set(-5, 4, -3); scene.add(fill);
    const material = (color: number, roughness = 0.85, metalness = 0) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness }); materials.add(m); return m; };
    const stone = material(0xb5cad5), wood = material(0x75432f, 0.68), roof = material(0xa54232, 0.78), gold = material(0xe9bd69, 0.38, 0.45);
    const mesh = (geometry: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
      geometries.add(geometry); const item = new THREE.Mesh(geometry, mat); item.position.set(x, y, z); scene.add(item); return item;
    };
    mesh(new THREE.BoxGeometry(5.4, 0.3, 4.4), stone, 0, 0.15, 0);
    mesh(new THREE.BoxGeometry(2, 0.16, 0.7), stone, 0, 0.08, 2.4);
    for (const x of [-1.9, 0, 1.9]) for (const z of [-1.45, 1.45]) {
      mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.5, 8), wood, x, 1.55, z);
    }
    mesh(new THREE.BoxGeometry(4.5, 0.25, 3.4), wood, 0, 2.7, 0);
    const shape = new THREE.Shape();
    shape.moveTo(-2.7, 0); shape.lineTo(-2.35, 0.2); shape.lineTo(0, 1.35); shape.lineTo(2.35, 0.2); shape.lineTo(2.7, 0); shape.lineTo(2.3, -0.12); shape.lineTo(0, 1.05); shape.lineTo(-2.3, -0.12); shape.closePath();
    const top = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false, steps: 1 }); top.translate(0, 0, -2);
    mesh(top, roof, 0, 2.85, 0);
    mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.2, 8), gold, 0, 4.18, 0).rotation.x = Math.PI / 2;
    mesh(new THREE.BoxGeometry(1.2, 0.4, 0.08), gold, 0, 2.5, 1.73);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target); controls.enableDamping = false; controls.autoRotate = false;
    controls.enablePan = false; controls.enableZoom = false; // Wheel belongs to page; zoom buttons work with mouse/touch/keyboard.
    controls.minPolarAngle = 0.2; controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.update(); controls.saveState();
    renderer.domElement.style.touchAction = 'pan-y';
    controls.addEventListener('change', draw);
    controls.addEventListener('start', stopMotion);
    renderer.domElement.addEventListener('webglcontextlost', lost);
    resize = new ResizeObserver(draw); resize.observe(host);
    document.addEventListener('visibilitychange', visibility);
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; visibility(); }); observer.observe(host);
    } else { visible = true; visibility(); }
    return {
      rotate: (direction: number) => { const offset = commandPosition().sub(target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * 0.25); moveTo(target.clone().add(offset)); },
      zoom: (factor: number) => { const offset = commandPosition().sub(target); offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, 5, 18)); moveTo(target.clone().add(offset)); },
      reset: () => moveTo(initialPosition),
      dispose,
    };
  } catch (cause) { dispose(); throw cause; }
}
