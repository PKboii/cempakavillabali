import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Environment keyframes — the world slides from golden dusk to night  */
/* as the visitor scrolls deeper into the estate.                      */
/* ------------------------------------------------------------------ */
type Stop = {
  p: number;
  fog: number;
  density: number;
  top: number;
  horizon: number;
  sun: number;
  sunI: number;
  sunPos: [number, number, number];
  lantern: number;
  stars: number;
};

const STOPS: Stop[] = [
  { p: 0.0,  fog: 0x16322a, density: 0.0105, top: 0x0e2b38, horizon: 0xd98a4e, sun: 0xffd9a4, sunI: 1.3,  sunPos: [-80, 26, -130], lantern: 0.35, stars: 0 },
  { p: 0.32, fog: 0x132b26, density: 0.0115, top: 0x0c2733, horizon: 0xc46f3f, sun: 0xffc087, sunI: 1.0,  sunPos: [-64, 19, -130], lantern: 0.55, stars: 0.06 },
  { p: 0.62, fog: 0x0e2024, density: 0.013,  top: 0x081d2c, horizon: 0x8a4a44, sun: 0xffa878, sunI: 0.55, sunPos: [-42, 13, -130], lantern: 0.85, stars: 0.35 },
  { p: 1.0,  fog: 0x0a1a20, density: 0.015,  top: 0x050f1a, horizon: 0x1c4750, sun: 0xcfeee6, sunI: 0.5,  sunPos: [46, 58, -120],  lantern: 1.0,  stars: 1 },
];

const CAM_POS: [number, number, number][] = [
  [30, 27, 68], [16, 14, 52], [2.5, 4.6, 42], [-5, 2.3, 27],
  [-14.5, 1.35, 13.5], [-10.5, 3.7, -0.5], [7, 4.7, -9.5], [17.5, 9.5, 6], [4, 18, 26],
];
const CAM_LOOK: [number, number, number][] = [
  [0, 3, 2], [0, 4.5, 10], [0, 3.4, 22], [0, 1.7, 10],
  [5, 0.9, 8], [0, 3.3, -6.5], [0, 3.7, -4.5], [0, 4, 0], [-4, 3, -32],
];

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.35, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class VillaScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private container: HTMLElement;

  private targetProgress = 0;
  private progress = 0;
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();

  private posCurve: THREE.CatmullRomCurve3;
  private lookCurve: THREE.CatmullRomCurve3;

  private skyMat!: THREE.ShaderMaterial;
  private waterMat!: THREE.ShaderMaterial;
  private starsMat!: THREE.PointsMaterial;
  private sunSprite!: THREE.Sprite;
  private sunMat!: THREE.SpriteMaterial;

  private glowLanternMats: THREE.MeshBasicMaterial[] = [];
  private lanternSprites: THREE.SpriteMaterial[] = [];
  private interiorMats: THREE.MeshBasicMaterial[] = [];
  private goldMats: THREE.MeshBasicMaterial[] = [];
  private floatingLanterns: { mesh: THREE.Object3D; base: number; phase: number }[] = [];
  private swayers: { pivot: THREE.Object3D; phase: number }[] = [];
  private fireflies!: THREE.Points;
  private fireBase!: Float32Array;
  private petals!: THREE.Points;
  private petalBase!: Float32Array;

  private hemi!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private pavilionLight!: THREE.PointLight;
  private gateLight!: THREE.PointLight;

  private tmpA = new THREE.Color();
  private tmpB = new THREE.Color();
  private tmpV = new THREE.Vector3();
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(56, container.clientWidth / container.clientHeight, 0.1, 600);
    this.camera.position.set(...CAM_POS[0]);

    this.scene.fog = new THREE.FogExp2(STOPS[0].fog, STOPS[0].density);

    this.posCurve = new THREE.CatmullRomCurve3(CAM_POS.map((v) => new THREE.Vector3(...v)), false, "centripetal");
    this.lookCurve = new THREE.CatmullRomCurve3(CAM_LOOK.map((v) => new THREE.Vector3(...v)), false, "centripetal");

    const glowTex = makeGlowTexture();
    this.buildSky();
    this.buildLights();
    this.buildGround();
    this.buildPool();
    this.buildPavilion();
    this.buildBale();
    this.buildGate();
    this.buildPath();
    this.buildPalms();
    this.buildFoliage();
    this.buildHills();
    this.buildLanterns(glowTex);
    this.buildStars(glowTex);
    this.buildParticles(glowTex);
    this.buildSun(glowTex);

    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("resize", this.onResize);

    this.renderer.setAnimationLoop(this.tick);
  }

  /* ------------------------------ build ------------------------------ */

  private buildSky() {
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(STOPS[0].top) },
        uHorizon: { value: new THREE.Color(STOPS[0].horizon) },
        uSunDir: { value: new THREE.Vector3(...STOPS[0].sunPos).normalize() },
        uSunColor: { value: new THREE.Color(STOPS[0].sun) },
        uSunI: { value: STOPS[0].sunI },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunDir; uniform vec3 uSunColor; uniform float uSunI;
        varying vec3 vWorld;
        void main() {
          vec3 d = normalize(vWorld);
          float h = clamp(d.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
          float s = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunColor * (pow(s, 260.0) * 1.25 + pow(s, 20.0) * 0.22 + pow(s, 4.0) * 0.10) * uSunI;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(320, 24, 16), this.skyMat);
    this.scene.add(dome);
  }

  private buildLights() {
    this.hemi = new THREE.HemisphereLight(0x2a4a52, 0x0a140f, 0.55);
    this.scene.add(this.hemi);

    this.sunLight = new THREE.DirectionalLight(STOPS[0].sun, STOPS[0].sunI);
    this.sunLight.position.set(...STOPS[0].sunPos);
    this.scene.add(this.sunLight);

    this.pavilionLight = new THREE.PointLight(0xffa54f, 0, 30, 1.8);
    this.pavilionLight.position.set(0, 3.2, -7);
    this.scene.add(this.pavilionLight);

    this.gateLight = new THREE.PointLight(0xffc27d, 0, 22, 1.8);
    this.gateLight.position.set(0, 3.6, 35);
    this.scene.add(this.gateLight);

    const poolGlow = new THREE.PointLight(0x3fae8f, 0.8, 24, 1.8);
    poolGlow.position.set(0, 1.2, 9);
    this.scene.add(poolGlow);
  }

  private buildGround() {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(280, 48),
      new THREE.MeshStandardMaterial({ color: 0x0e211a, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // mottled darker patches for texture
    const patchGeo = new THREE.CircleGeometry(1, 12);
    const patchMat = new THREE.MeshStandardMaterial({ color: 0x0a1b14, roughness: 1 });
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(patchGeo, patchMat);
      m.rotation.x = -Math.PI / 2;
      const a = Math.random() * Math.PI * 2;
      const r = rand(18, 90);
      m.position.set(Math.cos(a) * r, 0.012, Math.sin(a) * r);
      m.scale.setScalar(rand(2.5, 7));
      this.scene.add(m);
    }

    // stone deck around the pool
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(34, 0.14, 18),
      new THREE.MeshStandardMaterial({ color: 0x1a2921, roughness: 0.95 })
    );
    deck.position.set(0, 0.02, 7);
    this.scene.add(deck);
  }

  private buildPool() {
    this.waterMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(0x06332f) },
        uShallow: { value: new THREE.Color(0x1d7a68) },
        uSky: { value: new THREE.Color(STOPS[0].horizon) },
        uSunColor: { value: new THREE.Color(STOPS[0].sun) },
        uSunI: { value: STOPS[0].sunI },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv; varying float vH;
        void main() {
          vUv = uv;
          vec3 p = position;
          float h = sin(p.x * 0.5 + uTime * 0.8) * 0.045
                  + cos(p.y * 0.7 + uTime * 1.15) * 0.035
                  + sin((p.x + p.y) * 0.32 + uTime * 0.55) * 0.03;
          p.z += h;
          vH = h;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uSunColor;
        uniform float uSunI; uniform float uTime;
        varying vec2 vUv; varying float vH;
        void main() {
          vec3 col = mix(uDeep, uShallow, smoothstep(-0.08, 0.09, vH));
          float ca = sin(vUv.x * 46.0 + uTime * 1.4) * sin(vUv.y * 30.0 - uTime * 1.1);
          col += uSunColor * pow(max(ca, 0.0), 8.0) * 0.11 * uSunI;
          col = mix(col, uSky, 0.2 + vUv.y * 0.16);
          float edge = smoothstep(0.0, 0.025, vUv.x) * smoothstep(1.0, 0.975, vUv.x)
                     * smoothstep(0.0, 0.04, vUv.y) * smoothstep(1.0, 0.96, vUv.y);
          gl_FragColor = vec4(col, 0.95 * edge + 0.03);
        }`,
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(26, 10, 96, 40), this.waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.16, 9);
    this.scene.add(water);

    // dark basin under the water
    const basin = new THREE.Mesh(
      new THREE.BoxGeometry(26.4, 0.3, 10.4),
      new THREE.MeshStandardMaterial({ color: 0x04110f, roughness: 1 })
    );
    basin.position.set(0, -0.02, 9);
    this.scene.add(basin);

    // andesite coping
    const copingMat = new THREE.MeshStandardMaterial({ color: 0x25332c, roughness: 0.85 });
    const mkCoping = (w: number, d: number, x: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), copingMat);
      m.position.set(x, 0.17, z);
      this.scene.add(m);
    };
    mkCoping(27.6, 0.8, 0, 3.6);
    mkCoping(27.6, 0.8, 0, 14.4);
    mkCoping(0.8, 11.6, -13.4, 9);
    mkCoping(0.8, 11.6, 13.4, 9);

    // infinity lip toward the gate — catches the dying sun
    const lipMat = new THREE.MeshBasicMaterial({ color: 0xf6c97c, transparent: true, opacity: 0.5 });
    this.goldMats.push(lipMat);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(26, 0.03, 0.1), lipMat);
    lip.position.set(0, 0.33, 14.02);
    this.scene.add(lip);
  }

  /* Tiered meru roof helper */
  private meruRoof(group: THREE.Group, tiers: { r: number; h: number; y: number }[], thatch: THREE.Material) {
    tiers.forEach((t) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 4, 1), thatch);
      cone.rotation.y = Math.PI / 4;
      cone.position.y = t.y;
      group.add(cone);
    });
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.1, 6), thatch);
    const topY = tiers[tiers.length - 1].y + tiers[tiers.length - 1].h / 2;
    finial.position.y = topY + 0.55;
    group.add(finial);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xf2bd6d, transparent: true, opacity: 0.9 });
    this.goldMats.push(tipMat);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), tipMat);
    tip.position.y = topY + 1.15;
    group.add(tip);
  }

  private shadowDisc(x: number, z: number, r: number) {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(r, 20),
      new THREE.MeshBasicMaterial({ color: 0x030a07, transparent: true, opacity: 0.34, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.02, z);
    this.scene.add(m);
  }

  private buildPavilion() {
    const g = new THREE.Group();
    g.position.set(0, 0, -7);

    const stone = new THREE.MeshStandardMaterial({ color: 0x3a4a42, roughness: 0.9 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x4a2f1e, roughness: 0.8 });
    const thatch = new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 1 });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 10), stone);
    platform.position.y = 0.25;
    g.add(platform);

    const pillarGeo = new THREE.CylinderGeometry(0.22, 0.24, 3.8, 8);
    [-4.2, 0, 4.2].forEach((z) => {
      [-6.3, 6.3].forEach((x) => {
        const p = new THREE.Mesh(pillarGeo, wood);
        p.position.set(x, 2.4, z);
        g.add(p);
      });
    });

    // glowing interior
    const interiorMat = new THREE.MeshBasicMaterial({ color: 0xff9d47, transparent: true, opacity: 0.1 });
    this.interiorMats.push(interiorMat);
    const interior = new THREE.Mesh(new THREE.BoxGeometry(11.4, 2.7, 7.4), interiorMat);
    interior.position.y = 1.95;
    g.add(interior);

    // daybeds inside
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x3c2718, roughness: 0.9 });
    const linenMat = new THREE.MeshStandardMaterial({ color: 0xd8cba8, roughness: 1 });
    [-3, 3].forEach((x) => {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 1.5), bedMat);
      bed.position.set(x, 0.72, 0.5);
      g.add(bed);
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 1.3), linenMat);
      cushion.position.set(x, 0.98, 0.5);
      g.add(cushion);
    });

    this.meruRoof(g, [
      { r: 8.4, h: 2.3, y: 5.4 },
      { r: 6.5, h: 2.0, y: 6.9 },
      { r: 4.7, h: 1.7, y: 8.2 },
      { r: 3.0, h: 1.4, y: 9.3 },
    ], thatch);

    this.scene.add(g);
    this.shadowDisc(0, -7, 10);
  }

  private buildBale() {
    const g = new THREE.Group();
    g.position.set(15.5, 0, 1.5);
    g.rotation.y = -0.5;
    const stone = new THREE.MeshStandardMaterial({ color: 0x39483f, roughness: 0.9 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x4a2f1e, roughness: 0.8 });
    const thatch = new THREE.MeshStandardMaterial({ color: 0x241a10, roughness: 1 });

    const platform = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), stone);
    platform.position.y = 0.2;
    g.add(platform);
    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.18, 3.4, 8);
    [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]].forEach(([x, z]) => {
      const p = new THREE.Mesh(pillarGeo, wood);
      p.position.set(x, 2.1, z);
      g.add(p);
    });
    const daybed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.34, 1.5), wood);
    daybed.position.y = 0.6;
    g.add(daybed);
    const linenMat = new THREE.MeshBasicMaterial({ color: 0xe4d7b4, transparent: true, opacity: 0.85 });
    const linen = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.3), linenMat);
    linen.position.y = 0.82;
    g.add(linen);

    this.meruRoof(g, [
      { r: 4.1, h: 1.9, y: 4.6 },
      { r: 2.7, h: 1.4, y: 5.85 },
    ], thatch);

    this.scene.add(g);
    this.shadowDisc(15.5, 1.5, 4.4);
  }

  private buildGate() {
    // Candi bentar — the split gate
    const stone = new THREE.MeshStandardMaterial({ color: 0x2f3d38, roughness: 0.95 });
    const tiers: [number, number, number][] = [
      [2.7, 1.2, 0.6], [2.25, 1.15, 1.78], [1.85, 1.1, 2.9], [1.45, 1.0, 3.95], [1.05, 0.9, 4.9],
    ];
    [-3.15, 3.15].forEach((x) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, 36);
      tiers.forEach(([w, h, y], i) => {
        const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), stone);
        box.position.y = y;
        tower.add(box);
        if (i === 1 || i === 3) {
          const stripMat = new THREE.MeshBasicMaterial({ color: 0xf2bd6d, transparent: true, opacity: 0.25 });
          this.goldMats.push(stripMat);
          const strip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.07, w + 0.06), stripMat);
          strip.position.y = y + h / 2 + 0.04;
          tower.add(strip);
        }
      });
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.9, 4), stone);
      cap.rotation.y = Math.PI / 4;
      cap.position.y = 5.8;
      tower.add(cap);
      this.scene.add(tower);
      this.shadowDisc(x, 36, 2.3);
    });

    // low garden walls flanking the gate
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x26332d, roughness: 1 });
    [-9.5, 9.5].forEach((x) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.4, 0.9), wallMat);
      w.position.set(x, 0.7, 36);
      this.scene.add(w);
    });
  }

  private buildPath() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2c3b34, roughness: 0.9 });
    const geo = new THREE.CylinderGeometry(0.78, 0.85, 0.09, 10);
    for (let z = 33.5; z > 15.4; z -= 2.1) {
      const s = new THREE.Mesh(geo, stoneMat);
      s.position.set(Math.sin(z * 1.7) * 0.5, 0.1, z);
      s.rotation.y = Math.random() * Math.PI;
      this.scene.add(s);
    }
  }

  private buildPalms() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1c, roughness: 1 });
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x1e4d33, roughness: 1, side: THREE.DoubleSide });
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.27, 4.6, 6);
    const frondGeo = new THREE.ConeGeometry(0.34, 2.7, 4, 1, true);
    const nutGeo = new THREE.SphereGeometry(0.16, 6, 6);

    const spots: [number, number][] = [
      [-16, 22], [18, 27], [-22, 8], [22, 11], [-18, -8], [21, -14],
      [-27, 17], [27, 21], [-12, 32], [14, 34], [29, -2], [-29, -3], [10, 20],
    ];
    spots.forEach(([x, z]) => {
      const palm = new THREE.Group();
      palm.position.set(x + rand(-1.5, 1.5), 0, z + rand(-1.5, 1.5));
      const s = rand(0.8, 1.5);
      palm.scale.setScalar(s);
      palm.rotation.y = Math.random() * Math.PI * 2;
      palm.rotation.z = rand(-0.08, 0.08);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.3;
      trunk.rotation.z = rand(-0.12, 0.12);
      palm.add(trunk);

      const crown = new THREE.Group();
      crown.position.y = 4.65;
      const fronds = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const f = new THREE.Mesh(frondGeo, frondMat);
        f.scale.set(1, 1, 0.22);
        const holder = new THREE.Group();
        holder.rotation.y = (i / 7) * Math.PI * 2;
        f.position.y = 1.1;
        f.rotation.x = -Math.PI / 2 + rand(0.5, 0.85);
        holder.add(f);
        fronds.add(holder);
      }
      crown.add(fronds);
      [-0.25, 0.25].forEach((nx) => {
        const nut = new THREE.Mesh(nutGeo, trunkMat);
        nut.position.set(nx, -0.1, 0.1);
        crown.add(nut);
      });
      palm.add(crown);
      this.scene.add(palm);
      this.swayers.push({ pivot: fronds, phase: Math.random() * Math.PI * 2 });
      this.shadowDisc(palm.position.x, palm.position.z, 1.6 * s);
    });
  }

  private buildFoliage() {
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x16382a, roughness: 1 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x2b3831, roughness: 1 });
    const bushGeo = new THREE.IcosahedronGeometry(1, 0);
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(16, 42);
      const b = new THREE.Mesh(bushGeo, bushMat);
      b.position.set(Math.cos(a) * r, 0.4, Math.sin(a) * r);
      b.scale.set(rand(0.7, 1.6), rand(0.5, 1), rand(0.7, 1.6));
      b.rotation.y = Math.random() * 3;
      this.scene.add(b);
    }
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(15, 34);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r);
      rock.scale.set(rand(0.4, 1.1), rand(0.3, 0.7), rand(0.4, 1.1));
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      this.scene.add(rock);
    }
  }

  private buildHills() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x0d2019, roughness: 1 });
    const hills: [number, number, number, number][] = [
      [-95, -70, 60, 34], [105, -45, 70, 42], [5, -145, 95, 46], [-140, 30, 65, 30], [150, 40, 70, 34],
    ];
    hills.forEach(([x, z, r, h]) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7, 1), mat);
      cone.position.set(x, h / 2 - 2, z);
      cone.rotation.y = Math.random() * 3;
      this.scene.add(cone);
    });
  }

  private buildLanterns(glowTex: THREE.Texture) {
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffb45e, transparent: true, opacity: 0.3 });
    this.glowLanternMats.push(lanternMat);
    const lanternGeo = new THREE.SphereGeometry(0.24, 8, 6);

    const addLantern = (x: number, y: number, z: number, floating: boolean) => {
      const mesh = new THREE.Mesh(lanternGeo, lanternMat);
      mesh.scale.set(1, 1.25, 1);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
      const sm = new THREE.SpriteMaterial({
        map: glowTex, color: 0xffc06a, transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      this.lanternSprites.push(sm);
      const sprite = new THREE.Sprite(sm);
      sprite.scale.setScalar(floating ? 2.6 : 1.9);
      sprite.position.copy(mesh.position);
      this.scene.add(sprite);
      if (floating) this.floatingLanterns.push({ mesh: mesh, base: y, phase: Math.random() * Math.PI * 2 });
    };

    // floating lanterns over the pool
    const spots: [number, number][] = [[-8, 7], [-3, 11.5], [2, 6.5], [6.5, 10.5], [10, 7.5], [-11, 10]];
    spots.forEach(([x, z]) => addLantern(x, rand(2.2, 3.1), z, true));

    // garden posts with lantern heads along the path
    const postMat = new THREE.MeshStandardMaterial({ color: 0x26332c, roughness: 1 });
    const postGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.1, 6);
    [21, 26.5, 32].forEach((z) => {
      [-3.3, 3.3].forEach((x) => {
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(x, 0.55, z);
        this.scene.add(post);
        addLantern(x, 1.25, z, false);
      });
    });

    // gate lanterns
    [-4.6, 4.6].forEach((x) => addLantern(x, 2.4, 35.6, false));
  }

  private buildStars(glowTex: THREE.Texture) {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const y = rand(0.12, 1) * Math.PI * 0.5;
      const r = 250;
      pos[i * 3] = Math.cos(a) * Math.cos(y) * r;
      pos[i * 3 + 1] = Math.sin(y) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(y) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.starsMat = new THREE.PointsMaterial({
      map: glowTex, color: 0xcfe8e2, size: 1.5, sizeAttenuation: false,
      transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    this.scene.add(new THREE.Points(geo, this.starsMat));
  }

  private buildParticles(glowTex: THREE.Texture) {
    // fireflies near the lantern gardens
    const ffCount = 130;
    this.fireBase = new Float32Array(ffCount * 3);
    const ffPos = new Float32Array(ffCount * 3);
    for (let i = 0; i < ffCount; i++) {
      this.fireBase[i * 3] = rand(-24, 24);
      this.fireBase[i * 3 + 1] = rand(0.4, 3.6);
      this.fireBase[i * 3 + 2] = rand(-14, 32);
    }
    ffPos.set(this.fireBase);
    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute("position", new THREE.BufferAttribute(ffPos, 3));
    this.fireflies = new THREE.Points(ffGeo, new THREE.PointsMaterial({
      map: glowTex, color: 0xffd98a, size: 0.22, transparent: true, opacity: 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.scene.add(this.fireflies);

    // drifting frangipani petals
    const pCount = 110;
    this.petalBase = new Float32Array(pCount * 4); // x,y,z,phase
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      this.petalBase[i * 4] = rand(-22, 22);
      this.petalBase[i * 4 + 1] = rand(0, 9);
      this.petalBase[i * 4 + 2] = rand(-12, 36);
      this.petalBase[i * 4 + 3] = Math.random() * Math.PI * 2;
      pPos[i * 3] = this.petalBase[i * 4];
      pPos[i * 3 + 1] = this.petalBase[i * 4 + 1];
      pPos[i * 3 + 2] = this.petalBase[i * 4 + 2];
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    this.petals = new THREE.Points(pGeo, new THREE.PointsMaterial({
      map: glowTex, color: 0xf5ead2, size: 0.16, transparent: true, opacity: 0.65, depthWrite: false,
    }));
    this.scene.add(this.petals);
  }

  private buildSun(glowTex: THREE.Texture) {
    this.sunMat = new THREE.SpriteMaterial({
      map: glowTex, color: STOPS[0].sun, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    });
    this.sunSprite = new THREE.Sprite(this.sunMat);
    this.sunSprite.position.set(...STOPS[0].sunPos).multiplyScalar(1.7);
    this.sunSprite.scale.setScalar(60);
    this.scene.add(this.sunSprite);
  }

  /* ------------------------------ runtime ----------------------------- */

  private onPointer = (e: PointerEvent) => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  setScrollProgress(p: number) {
    this.targetProgress = Math.max(0, Math.min(1, p));
  }

  private sampleEnv(p: number) {
    let a = STOPS[0], b = STOPS[STOPS.length - 1];
    for (let i = 0; i < STOPS.length - 1; i++) {
      if (p >= STOPS[i].p && p <= STOPS[i + 1].p) { a = STOPS[i]; b = STOPS[i + 1]; break; }
    }
    const t = a === b ? 0 : (p - a.p) / (b.p - a.p);
    return { a, b, t };
  }

  private lerpHex(out: THREE.Color, x: number, y: number, t: number) {
    this.tmpA.setHex(x);
    this.tmpB.setHex(y);
    out.copy(this.tmpA).lerp(this.tmpB, t);
    return out;
  }

  private tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // ease toward scroll target — the cinematic lag
    this.progress += (this.targetProgress - this.progress) * (1 - Math.pow(0.0015, dt));
    const p = this.progress;

    /* environment */
    const { a, b, t: et } = this.sampleEnv(p);
    const fog = this.scene.fog as THREE.FogExp2;
    this.lerpHex(fog.color, a.fog, b.fog, et);
    fog.density = a.density + (b.density - a.density) * et;

    const su = this.skyMat.uniforms;
    (su.uTop.value as THREE.Color).copy(this.lerpHex(this.tmpA, a.top, b.top, et));
    (su.uHorizon.value as THREE.Color).copy(this.lerpHex(this.tmpB, a.horizon, b.horizon, et));
    (su.uSunColor.value as THREE.Color).copy(this.lerpHex(this.tmpA, a.sun, b.sun, et));
    su.uSunI.value = a.sunI + (b.sunI - a.sunI) * et;
    this.tmpV.set(...a.sunPos).lerp(this.tmpV.clone().set(...b.sunPos), et).normalize();
    (su.uSunDir.value as THREE.Vector3).copy(this.tmpV);

    this.sunLight.color.copy(this.lerpHex(this.tmpA, a.sun, b.sun, et));
    this.sunLight.intensity = a.sunI + (b.sunI - a.sunI) * et;
    this.sunLight.position.set(...a.sunPos).lerp(this.tmpV.set(...b.sunPos), et);
    this.hemi.intensity = 0.55 - et * 0.1 + (1 - p) * 0.05;

    const lantern = a.lantern + (b.lantern - a.lantern) * et;
    this.glowLanternMats.forEach((m) => { m.opacity = 0.12 + lantern * 0.88; });
    this.lanternSprites.forEach((m) => { m.opacity = 0.06 + lantern * 0.5; });
    this.interiorMats.forEach((m) => { m.opacity = 0.06 + lantern * 0.8; });
    this.goldMats.forEach((m) => { m.opacity = 0.2 + lantern * 0.8; });
    this.pavilionLight.intensity = lantern * 26;
    this.gateLight.intensity = lantern * 14;

    this.starsMat.opacity = (a.stars + (b.stars - a.stars) * et) * 0.9;

    this.sunMat.color.copy(this.lerpHex(this.tmpA, a.sun, b.sun, et));
    this.sunMat.opacity = 0.5 + su.uSunI.value * 0.35;
    this.sunSprite.position.set(...a.sunPos).multiplyScalar(1.7)
      .lerp(this.tmpV.set(...b.sunPos).multiplyScalar(1.7), et);

    /* water */
    const wu = this.waterMat.uniforms;
    wu.uTime.value = t;
    (wu.uSky.value as THREE.Color).copy(this.lerpHex(this.tmpA, a.horizon, b.horizon, et));
    (wu.uSunColor.value as THREE.Color).copy(this.lerpHex(this.tmpB, a.sun, b.sun, et));
    wu.uSunI.value = su.uSunI.value;
    this.lerpHex(wu.uDeep.value as THREE.Color, 0x06332f, 0x031f20, et);
    this.lerpHex(wu.uShallow.value as THREE.Color, 0x1d7a68, 0x0f4a44, et);

    /* living things */
    const swayAmp = this.reduced ? 0 : 0.05;
    this.swayers.forEach((s) => {
      s.pivot.rotation.z = Math.sin(t * 1.1 + s.phase) * swayAmp;
      s.pivot.rotation.x = Math.cos(t * 0.8 + s.phase) * swayAmp * 0.6;
    });
    this.floatingLanterns.forEach((l) => {
      l.mesh.position.y = l.base + Math.sin(t * 0.7 + l.phase) * 0.16;
    });

    const fp = this.fireflies.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < fp.count; i++) {
      const j = i * 3;
      fp.array[j] = this.fireBase[j] + Math.sin(t * 0.6 + i * 1.7) * 0.7;
      fp.array[j + 1] = this.fireBase[j + 1] + Math.sin(t * 0.9 + i * 2.3) * 0.45;
      fp.array[j + 2] = this.fireBase[j + 2] + Math.cos(t * 0.5 + i * 1.1) * 0.7;
    }
    fp.needsUpdate = true;

    const pp = this.petals.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pp.count; i++) {
      const j = i * 4;
      let y = this.petalBase[j + 1] - ((t * 0.28 + this.petalBase[j + 3]) % 9);
      if (y < 0) y += 9;
      pp.array[i * 3] = this.petalBase[j] + Math.sin(t * 0.5 + this.petalBase[j + 3] * 3) * 0.8;
      pp.array[i * 3 + 1] = y;
      pp.array[i * 3 + 2] = this.petalBase[j + 2];
    }
    pp.needsUpdate = true;

    /* camera along the scroll path */
    this.posCurve.getPointAt(p, this.camPos);
    this.lookCurve.getPointAt(p, this.camLook);
    this.pointerSmooth.lerp(this.pointer, 0.04);
    const breathe = this.reduced ? 0 : Math.sin(t * 0.5) * 0.09;
    this.camera.position.set(
      this.camPos.x + this.pointerSmooth.x * 0.9,
      this.camPos.y + breathe - this.pointerSmooth.y * 0.5,
      this.camPos.z
    );
    this.camera.lookAt(
      this.camLook.x + this.pointerSmooth.x * 0.5,
      this.camLook.y,
      this.camLook.z
    );
    this.camera.fov = 56 - p * 11;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("resize", this.onResize);
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
