import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================================================
   ABDULHODIY ❤️ ROBIYA BIBI
   3D LOVE GAME — GAME.JS
   ========================================================= */

const ROOM_CODE = "LOVE-1220";
const STORY_DATE = "03.03.2026";
const SAVE_KEY = "abdulhodiy-robiya-game-progress";

/* =========================================================
   DOM
   ========================================================= */

const $ = (id) => document.getElementById(id);

const loadingScreen = $("loading-screen");
const loadingProgress = $("loading-progress");
const loadingText = $("loading-text");

const authScreen = $("auth-screen");
const roleAbdul = $("role-abdulhodiy");
const roleRobiya = $("role-robiya");
const roomCodeInput = $("room-code");
const startGameBtn = $("start-game");

const gameContainer = $("game-container");
const world = $("world");

const stageCounter = $("stage-counter");
const connectionDot = $("connection-dot");
const connectionStatus = $("connection-status");

const questCard = $("quest-card");
const questTitle = $("quest-title");
const questDescription = $("quest-description");
const questProgress = $("quest-progress");

const partnerStatus = $("partner-status");
const partnerName = $("partner-name");
const partnerState = $("partner-state");
const partnerHeart = $("partner-heart");

const voicePanel = $("voice-panel");
const voiceButton = $("voice-button");
const voiceStatus = $("voice-status");

const joystick = $("joystick");
const joystickThumb = $("joystick-thumb");

const hugButton = $("hug-button");
const handButton = $("hand-button");
const musicButton = $("music-button");

const cinematicOverlay = $("cinematic-overlay");
const cinematicIcon = $("cinematic-icon");
const cinematicTitle = $("cinematic-title");
const cinematicText = $("cinematic-text");
const cinematicNext = $("cinematic-next");

const questModal = $("quest-modal");
const modalStage = $("modal-stage");
const modalTitle = $("modal-title");
const modalText = $("modal-text");
const modalClose = $("modal-close");

const finalScreen = $("final-screen");
const finalYes = $("final-yes");
const finalWaiting = $("final-waiting");

const toast = $("toast");
const toastIcon = $("toast-icon");
const toastText = $("toast-text");

/* =========================================================
   GAME STATE
   ========================================================= */

let selectedRole = "abdulhodiy";
let gameStarted = false;

let currentStage = 1;
let stageProgress = 0;

let scene;
let camera;
let renderer;
let clock;

let player;
let partner;

let playerMixer = null;
let partnerMixer = null;

let playerAnimations = [];
let partnerAnimations = [];

let joystickActive = false;
let joystickPointerId = null;
let joystickCenter = { x: 0, y: 0 };

let joystickX = 0;
let joystickY = 0;

const keys = {};

let targetCameraPosition = new THREE.Vector3();
let targetLookAt = new THREE.Vector3();

let musicOn = false;
let audioContext = null;
let masterGain = null;
let ambientOscillators = [];

let cinematicBusy = false;

const tempVector = new THREE.Vector3();

/* =========================================================
   QUEST DATA
   ========================================================= */

const quests = [
  {
    stage: 1,
    title: "Ishqiy Bog‘",
    description:
      "Bog‘ ichidan bir-biringizni toping. Ikki yurak bir joyda uchrashganda quchoqlashing.",
    icon: "❤️",
    progress: "Bir-biringizni toping"
  },
  {
    stage: 2,
    title: "Ikki yurak",
    description:
      "Ikki yurak haykalchasiga boring. Abdulhodiy va Robiya birgalikda yuraklarni uyg‘otishi kerak.",
    icon: "💗",
    progress: "Ikki yurakni uyg‘oting"
  },
  {
    stage: 3,
    title: "Menga ishon",
    description:
      "Ko‘prikni faqat ikki tomon bir vaqtda faollashtirilsa ochish mumkin.",
    icon: "🌉",
    progress: "Ko‘prikni birga oching"
  },
  {
    stage: 4,
    title: "Yuraklarni birga yig‘amiz",
    description:
      "Bog‘ bo‘ylab tarqalgan uchta sehrli yurakni birga yig‘ing.",
    icon: "💖",
    progress: "3 ta yurakni yig‘ing"
  },
  {
    stage: 5,
    title: "Bir-birimizga gapiramiz",
    description:
      "Bir-biringizga yurakdagi eng samimiy so‘zni ayting.",
    icon: "🎙️",
    progress: "Bir-biringizga gapiring"
  },
  {
    stage: 6,
    title: "Faqat ikkovimiz",
    description:
      "Bog‘ bo‘ylab birga yuring. Bir-biringizdan uzoqlashmang.",
    icon: "🌙",
    progress: "Birga sayr qiling"
  },
  {
    stage: 7,
    title: "Qo‘limni qo‘yib yuborma",
    description:
      "Bir-biringizga yaqinlashing va qo‘l ushlashni birga tasdiqlang.",
    icon: "🤝",
    progress: "Qo‘llaringizni birlashtiring"
  }
];

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance3D(a, b) {
  return a.position.distanceTo(b.position);
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function showToast(icon, message) {
  if (!toast) return;

  toastIcon.textContent = icon;
  toastText.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function saveProgress() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        stage: currentStage,
        role: selectedRole,
        date: STORY_DATE
      })
    );
  } catch (error) {
    console.warn("Progress save error:", error);
  }
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));

    if (saved && Number.isInteger(saved.stage)) {
      currentStage = clamp(saved.stage, 1, 7);
    }
  } catch (error) {
    console.warn("Progress load error:", error);
  }
}

/* =========================================================
   LOADING
   ========================================================= */

function setLoading(percent, text) {
  if (loadingProgress) {
    loadingProgress.style.width = `${percent}%`;
  }

  if (loadingText) {
    loadingText.textContent = text;
  }
}

async function boot() {
  setLoading(10, "3D dunyo tayyorlanmoqda...");

  await wait(250);

  setLoading(25, "Romantik bog‘ yaratilmoqda...");

  await wait(250);

  setLoading(45, "Oy va yulduzlar yoqilmoqda...");

  await wait(250);

  setLoading(65, "Qahramonlar tayyorlanmoqda...");

  await wait(250);

  setLoading(82, "Yuraklar uyg‘onmoqda...");

  await wait(250);

  setLoading(100, "Tayyor ❤️");

  await wait(500);

  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
  }
   if (authScreen) {
  authScreen.classList.remove("hidden");
}

updateStartButton();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* =========================================================
   ROLE SELECT
   ========================================================= */

function setupAuth() {
  roleAbdul?.addEventListener("click", () => {
    selectedRole = "abdulhodiy";

    roleAbdul.classList.add("selected");
    roleRobiya?.classList.remove("selected");

    updateStartButton();
  });

  roleRobiya?.addEventListener("click", () => {
    selectedRole = "robiya";

    roleRobiya.classList.add("selected");
    roleAbdul?.classList.remove("selected");

    updateStartButton();
  });

  roomCodeInput?.addEventListener("input", updateStartButton);

  startGameBtn?.addEventListener("click", startGame);
}

function updateStartButton() {
  if (!startGameBtn) return;

  const roomCorrect =
    !roomCodeInput ||
    roomCodeInput.value.trim().toUpperCase() === ROOM_CODE;

  startGameBtn.disabled = !(selectedRole && roomCorrect);
}

function startGame() {
  if (!selectedRole) {
    showToast("❤️", "Avval qahramonni tanlang.");
    return;
  }

  if (
    roomCodeInput &&
    roomCodeInput.value.trim().toUpperCase() !== ROOM_CODE
  ) {
    showToast("🔐", `Xona kodi: ${ROOM_CODE}`);
    return;
  }

  gameStarted = true;

  authScreen?.classList.add("hidden");
  gameContainer?.classList.remove("hidden");

  connectionStatus.textContent = "Demo";
  connectionDot.classList.add("demo");

  initializeGame();

  showToast(
    "❤️",
    selectedRole === "abdulhodiy"
      ? "Abdulhodiy sifatida kirdingiz."
      : "Robiya Bibi sifatida kirdingiz."
  );

  setTimeout(() => {
    showStageIntro(currentStage);
  }, 1000);
}

/* =========================================================
   THREE.JS INITIALIZATION
   ========================================================= */

function initializeGame() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x07101f);

  scene.fog = new THREE.FogExp2(0x07101f, 0.018);

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    58,
    1,
    0.1,
    300
  );

  camera.position.set(0, 7, 11);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
  );

  renderer.setSize(
    world.clientWidth || window.innerWidth,
    world.clientHeight || window.innerHeight,
    false
  );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  world.innerHTML = "";
  world.appendChild(renderer.domElement);

  createLights();
  createSky();
  createGround();
  createGarden();
  createPond();
  createPath();
  createLanterns();
  createFlowers();
  createFloatingHearts();
  createQuestObjects();

  createCharacters();

  setupResize();
  setupControls();
  updateQuestUI();

  renderer.setAnimationLoop(animate);
}

/* =========================================================
   LIGHTING
   ========================================================= */

function createLights() {
  const hemisphere = new THREE.HemisphereLight(
    0x9bb8ff,
    0x172313,
    1.2
  );

  scene.add(hemisphere);

  const moonLight = new THREE.DirectionalLight(
    0xaec8ff,
    2.0
  );

  moonLight.position.set(-25, 30, 10);

  moonLight.castShadow = true;

  moonLight.shadow.mapSize.width = 1024;
  moonLight.shadow.mapSize.height = 1024;

  moonLight.shadow.camera.left = -60;
  moonLight.shadow.camera.right = 60;
  moonLight.shadow.camera.top = 60;
  moonLight.shadow.camera.bottom = -60;

  scene.add(moonLight);

  const softLight = new THREE.PointLight(
    0xff6fae,
    2.0,
    28
  );

  softLight.position.set(0, 5, 0);

  scene.add(softLight);
}

/* =========================================================
   SKY / MOON / STARS
   ========================================================= */

function createSky() {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xfff4d4
    })
  );

  moon.position.set(-28, 30, -45);

  scene.add(moon);

  const moonGlow = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffe6aa,
      transparent: true,
      opacity: 0.08,
      depthWrite: false
    })
  );

  moonGlow.position.copy(moon.position);

  scene.add(moonGlow);

  const starCount = 900;

  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = random(-100, 100);
    positions[i * 3 + 1] = random(18, 90);
    positions[i * 3 + 2] = random(-100, 40);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.16,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });

  const stars = new THREE.Points(
    geometry,
    material
  );

  scene.add(stars);
}

/* =========================================================
   GROUND
   ========================================================= */

function createGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshStandardMaterial({
      color: 0x10251b,
      roughness: 0.95,
      metalness: 0
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  scene.add(ground);

  const grassCount = 400;

  const grassGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(grassCount * 3);

  for (let i = 0; i < grassCount; i++) {
    positions[i * 3] = random(-65, 65);
    positions[i * 3 + 1] = 0.02;
    positions[i * 3 + 2] = random(-65, 65);
  }

  grassGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const grassMaterial = new THREE.PointsMaterial({
    color: 0x4b7a49,
    size: 0.07
  });

  scene.add(
    new THREE.Points(
      grassGeometry,
      grassMaterial
    )
  );
}

/* =========================================================
   GARDEN
   ========================================================= */

function createGarden() {
  for (let i = 0; i < 30; i++) {
    let x = random(-58, 58);
    let z = random(-58, 58);

    if (Math.abs(x) < 14 && Math.abs(z) < 14) {
      x += x < 0 ? -18 : 18;
    }

    createTree(x, z, random(0.8, 1.35));
  }

  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const radius = 19;

    createTree(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      random(0.75, 1.1)
    );
  }
}

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.28 * scale,
      0.45 * scale,
      2.5 * scale,
      8
    ),
    new THREE.MeshStandardMaterial({
      color: 0x3b281c,
      roughness: 1
    })
  );

  trunk.position.y = 1.25 * scale;
  trunk.castShadow = true;

  tree.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(
      2.0 * scale,
      12,
      10
    ),
    new THREE.MeshStandardMaterial({
      color: 0x173b28,
      roughness: 1
    })
  );

  crown.position.y = 3.0 * scale;
  crown.castShadow = true;

  tree.add(crown);

  const crown2 = crown.clone();

  crown2.scale.set(0.75, 0.75, 0.75);
  crown2.position.set(
    -0.9 * scale,
    3.7 * scale,
    0.3 * scale
  );

  tree.add(crown2);

  const crown3 = crown.clone();

  crown3.scale.set(0.65, 0.65, 0.65);
  crown3.position.set(
    0.8 * scale,
    3.8 * scale,
    -0.2 * scale
  );

  tree.add(crown3);

  tree.position.set(x, 0, z);

  scene.add(tree);
}

/* =========================================================
   PATH
   ========================================================= */

function createPath() {
  const material = new THREE.MeshStandardMaterial({
    color: 0x554b42,
    roughness: 1
  });

  const mainPath = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 120),
    material
  );

  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(0, 0.025, -2);

  scene.add(mainPath);

  const sidePath = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 5),
    material
  );

  sidePath.rotation.x = -Math.PI / 2;
  sidePath.position.set(0, 0.026, 0);

  scene.add(sidePath);
}

/* =========================================================
   POND
   ========================================================= */

function createPond() {
  const pondGroup = new THREE.Group();

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshStandardMaterial({
      color: 0x174a68,
      transparent: true,
      opacity: 0.85,
      roughness: 0.15,
      metalness: 0.2
    })
  );

  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.08;

  pondGroup.add(water);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(9.3, 0.28, 12, 64),
    new THREE.MeshStandardMaterial({
      color: 0x6d786d,
      roughness: 0.8
    })
  );

  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.15;

  pondGroup.add(ring);

  pondGroup.position.set(28, 0, -20);

  scene.add(pondGroup);

  const fountain = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.5, 0.5, 32),
    new THREE.MeshStandardMaterial({
      color: 0x77746d,
      roughness: 0.8
    })
  );

  base.position.y = 0.25;

  fountain.add(base);

  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.55, 2.3, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8b8880,
      roughness: 0.7
    })
  );

  center.position.y = 1.4;

  fountain.add(center);

  const waterTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 0.2, 0.08, 32),
    new THREE.MeshStandardMaterial({
      color: 0x6dc9e8,
      transparent: true,
      opacity: 0.8,
      emissive: 0x174f68,
      emissiveIntensity: 0.3
    })
  );

  waterTop.position.y = 2.5;

  fountain.add(waterTop);

  fountain.position.set(28, 0, -20);

  scene.add(fountain);
}

/* =========================================================
   LANTERNS
   ========================================================= */

function createLanterns() {
  const positions = [
    [-6, -8],
    [6, -8],
    [-6, 8],
    [6, 8],
    [-14, 0],
    [14, 0],
    [-22, -10],
    [22, -10],
    [-22, 10],
    [22, 10]
  ];

  positions.forEach(([x, z]) => {
    createLantern(x, z);
  });
}

function createLantern(x, z) {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, 3.2, 8),
    new THREE.MeshStandardMaterial({
      color: 0x29221e,
      metalness: 0.6,
      roughness: 0.5
    })
  );

  pole.position.y = 1.6;

  group.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffc85c,
      emissive: 0xff8a22,
      emissiveIntensity: 2
    })
  );

  lamp.position.y = 3.15;

  group.add(lamp);

  const light = new THREE.PointLight(
    0xffa43c,
    1.7,
    9
  );

  light.position.y = 3.15;

  group.add(light);

  group.position.set(x, 0, z);

  scene.add(group);
}

/* =========================================================
   FLOWERS
   ========================================================= */

function createFlowers() {
  for (let i = 0; i < 90; i++) {
    let x = random(-55, 55);
    let z = random(-55, 55);

    if (Math.abs(x) < 10 && Math.abs(z) < 10) {
      continue;
    }

    createFlower(
      x,
      z,
      random(0.65, 1.1)
    );
  }
}

function createFlower(x, z, scale) {
  const group = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.018,
      0.025,
      0.45 * scale,
      5
    ),
    new THREE.MeshStandardMaterial({
      color: 0x2e6c38
    })
  );

  stem.position.y = 0.22 * scale;

  group.add(stem);

  const petalMaterial = new THREE.MeshStandardMaterial({
    color:
      Math.random() > 0.5
        ? 0xff6fae
        : 0xffd3e5,
    emissive:
      Math.random() > 0.5
        ? 0x300516
        : 0x1d0b15,
    emissiveIntensity: 0.25
  });

  for (let i = 0; i < 5; i++) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.1 * scale,
        8,
        8
      ),
      petalMaterial
    );

    const angle = (i / 5) * Math.PI * 2;

    petal.position.set(
      Math.cos(angle) * 0.1 * scale,
      0.48 * scale,
      Math.sin(angle) * 0.1 * scale
    );

    group.add(petal);
  }

  group.position.set(x, 0, z);

  scene.add(group);
}

/* =========================================================
   FLOATING HEARTS
   ========================================================= */

function createHeartGeometry(size = 0.5) {
  const shape = new THREE.Shape();

  shape.moveTo(0, size * 0.35);

  shape.bezierCurveTo(
    -size * 0.7,
    size * 0.8,
    -size,
    0,
    0,
    -size * 0.65
  );

  shape.bezierCurveTo(
    size,
    0,
    size * 0.7,
    size * 0.8,
    0,
    size * 0.35
  );

  return new THREE.ExtrudeGeometry(shape, {
    depth: size * 0.16,
    bevelEnabled: true,
    bevelSize: size * 0.04,
    bevelThickness: size * 0.04,
    bevelSegments: 2
  });
}

function createFloatingHearts() {
  for (let i = 0; i < 16; i++) {
    const heart = new THREE.Mesh(
      createHeartGeometry(random(0.25, 0.55)),
      new THREE.MeshStandardMaterial({
        color: 0xff5d9d,
        emissive: 0x6b0c32,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: random(0.45, 0.85)
      })
    );

    heart.rotation.x = Math.PI;

    heart.position.set(
      random(-30, 30),
      random(2, 7),
      random(-30, 20)
    );

    heart.userData.baseY = heart.position.y;
    heart.userData.phase = Math.random() * Math.PI * 2;

    scene.add(heart);
  }
}

/* =========================================================
   QUEST OBJECTS
   ========================================================= */

const questObjects = [];

function createQuestObjects() {
  createHeartShrine(0, 0);

  createBridgeSwitch(-11, 16, "left");
  createBridgeSwitch(11, 16, "right");

  createCollectibleHeart(-7, -14, 0);
  createCollectibleHeart(8, -18, 1);
  createCollectibleHeart(16, 7, 2);
}

function createHeartShrine(x, z) {
  const group = new THREE.Group();

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.8, 1, 24),
    new THREE.MeshStandardMaterial({
      color: 0x77736e,
      roughness: 0.75
    })
  );

  pedestal.position.y = 0.5;

  group.add(pedestal);

  const heart = new THREE.Mesh(
    createHeartGeometry(1.1),
    new THREE.MeshStandardMaterial({
      color: 0xff477f,
      emissive: 0x710e35,
      emissiveIntensity: 0.9
    })
  );

  heart.rotation.x = Math.PI;
  heart.position.y = 1.8;

  group.add(heart);

  const glow = new THREE.PointLight(
    0xff4f91,
    2.5,
    8
  );

  glow.position.y = 1.8;

  group.add(glow);

  group.position.set(x, 0, z);

  scene.add(group);

  questObjects.push({
    type: "shrine",
    object: group
  });
}

function createBridgeSwitch(x, z, side) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1, 0.45, 16),
    new THREE.MeshStandardMaterial({
      color: 0x55515a,
      roughness: 0.8
    })
  );

  base.position.y = 0.23;

  group.add(base);

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55),
    new THREE.MeshStandardMaterial({
      color: 0xb86cff,
      emissive: 0x47126d,
      emissiveIntensity: 1
    })
  );

  crystal.position.y = 1;

  group.add(crystal);

  group.position.set(x, 0, z);

  scene.add(group);

  questObjects.push({
    type: "switch",
    side,
    object: group
  });
}

function createCollectibleHeart(x, z, index) {
  const heart = new THREE.Mesh(
    createHeartGeometry(0.7),
    new THREE.MeshStandardMaterial({
      color: 0xff668f,
      emissive: 0x6d1535,
      emissiveIntensity: 1
    })
  );

  heart.rotation.x = Math.PI;
  heart.position.set(x, 1.3, z);

  heart.userData.collectible = true;
  heart.userData.index = index;
  heart.userData.collected = false;
  heart.userData.baseY = 1.3;
  heart.userData.phase = Math.random() * 6;

  scene.add(heart);

  questObjects.push({
    type: "collectible",
    object: heart
  });
}

/* =========================================================
   CHARACTERS
   ========================================================= */

function createCharacters() {
  player = createCharacter(
    selectedRole,
    selectedRole === "abdulhodiy"
      ? "Abdulhodiy"
      : "Robiya Bibi"
  );

  partner = createCharacter(
    selectedRole === "abdulhodiy"
      ? "robiya"
      : "abdulhodiy",
    selectedRole === "abdulhodiy"
      ? "Robiya Bibi"
      : "Abdulhodiy"
  );

  player.position.set(
    selectedRole === "abdulhodiy" ? -3 : 3,
    0,
    12
  );

  partner.position.set(
    selectedRole === "abdulhodiy" ? 3 : -3,
    0,
    -10
  );

  scene.add(player);
  scene.add(partner);

  addNameLabel(
    player,
    selectedRole === "abdulhodiy"
      ? "Abdulhodiy ❤️"
      : "Robiya Bibi ❤️"
  );

  addNameLabel(
    partner,
    selectedRole === "abdulhodiy"
      ? "Robiya Bibi"
      : "Abdulhodiy"
  );
}

function createCharacter(role, name) {
  const group = new THREE.Group();

  group.userData.role = role;
  group.userData.name = name;

  /* Shadow circle */

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.75, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3
    })
  );

  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;

  group.add(shadow);

  /* Legs */

  const legMaterial =
    role === "abdulhodiy"
      ? new THREE.MeshStandardMaterial({
          color: 0x151a24
        })
      : new THREE.MeshStandardMaterial({
          color: 0x16161c
        });

  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.17,
      0.2,
      1.25,
      10
    ),
    legMaterial
  );

  leftLeg.position.set(-0.23, 0.62, 0);

  group.add(leftLeg);

  const rightLeg = leftLeg.clone();

  rightLeg.position.x = 0.23;

  group.add(rightLeg);

  /* Body */

  const bodyMaterial =
    role === "abdulhodiy"
      ? new THREE.MeshStandardMaterial({
          color: 0xe8e5dc,
          roughness: 0.8
        })
      : new THREE.MeshStandardMaterial({
          color: 0x19191f,
          roughness: 0.8
        });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.62,
      1.15,
      8,
      16
    ),
    bodyMaterial
  );

  body.position.y = 1.65;

  body.castShadow = true;

  group.add(body);

  /* Head */

  const skin = new THREE.MeshStandardMaterial({
    color:
      role === "abdulhodiy"
        ? 0xb87555
        : 0xc98969,
    roughness: 0.85
  });

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.48,
      24,
      20
    ),
    skin
  );

  head.position.y = 2.95;

  head.castShadow = true;

  group.add(head);

  /* Hair / Hijab */

  if (role === "robiya") {
    const hijab = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.67,
        24,
        20
      ),
      new THREE.MeshStandardMaterial({
        color: 0x101014,
        roughness: 0.9
      })
    );

    hijab.scale.set(
      1,
      1.12,
      0.95
    );

    hijab.position.set(
      0,
      3.05,
      -0.04
    );

    hijab.castShadow = true;

    group.add(hijab);

    const faceCover = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.43,
        24,
        20
      ),
      skin
    );

    faceCover.scale.set(
      0.9,
      1,
      0.55
    );

    faceCover.position.set(
      0,
      3.0,
      0.35
    );

    group.add(faceCover);
  } else {
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.54,
        20,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0x171315,
        roughness: 0.9
      })
    );

    hair.scale.set(
      1.02,
      0.72,
      0.98
    );

    hair.position.set(
      0,
      3.28,
      -0.02
    );

    hair.castShadow = true;

    group.add(hair);
  }

  /* Eyes */

  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: 0x17151b
  });

  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.045,
      8,
      8
    ),
    eyeMaterial
  );

  leftEye.position.set(
    -0.16,
    3.02,
    0.43
  );

  group.add(leftEye);

  const rightEye = leftEye.clone();

  rightEye.position.x = 0.16;

  group.add(rightEye);

  /* Arms */

  const armMaterial = bodyMaterial.clone();

  const leftArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.13,
      0.65,
      6,
      10
    ),
    armMaterial
  );

  leftArm.position.set(
    -0.72,
    1.7,
    0
  );

  leftArm.rotation.z = -0.18;

  group.add(leftArm);

  const rightArm = leftArm.clone();

  rightArm.position.x = 0.72;
  rightArm.rotation.z = 0.18;

  group.add(rightArm);

  group.userData.parts = {
    body,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg
  };

  return group;
}

/* =========================================================
   NAME LABEL
   ========================================================= */

function addNameLabel(object, text) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "rgba(255,255,255,0.95)";

  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 8;

  ctx.fillText(
    text,
    canvas.width / 2,
    canvas.height / 2
  );

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(
    4.2,
    1.05,
    1
  );

  sprite.position.y = 4.2;

  object.add(sprite);
}

/* =========================================================
   OPTIONAL GLB LOADER
   ========================================================= */

async function tryLoadGLB(
  url,
  fallbackRole,
  name
) {
  const loader = new GLTFLoader();

  try {
    const gltf = await loader.loadAsync(url);

    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    model.userData.role = fallbackRole;
    model.userData.name = name;

    return {
      model,
      animations: gltf.animations || []
    };
  } catch (error) {
    console.warn(
      `GLB topilmadi: ${url}. Procedural model ishlatiladi.`
    );

    return null;
  }
}

/* =========================================================
   CONTROLS
   ========================================================= */

function setupControls() {
  window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;

    if (
      [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " "
      ].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  setupJoystick();

  hugButton?.addEventListener("click", handleHug);

  handButton?.addEventListener(
    "click",
    handleHoldingHands
  );

  musicButton?.addEventListener(
    "click",
    toggleMusic
  );

  voiceButton?.addEventListener(
    "click",
    handleVoice
  );

  cinematicNext?.addEventListener(
    "click",
    closeCinematic
  );

  modalClose?.addEventListener(
    "click",
    () => {
      questModal?.classList.remove("show");
    }
  );

  finalYes?.addEventListener(
    "click",
    handleFinalYes
  );
}

/* =========================================================
   JOYSTICK
   ========================================================= */

function setupJoystick() {
  if (!joystick) return;

  joystick.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();

      joystickActive = true;
      joystickPointerId = event.pointerId;

      joystick.setPointerCapture(
        event.pointerId
      );

      const rect =
        joystick.getBoundingClientRect();

      joystickCenter.x =
        rect.left + rect.width / 2;

      joystickCenter.y =
        rect.top + rect.height / 2;

      updateJoystick(
        event.clientX,
        event.clientY
      );
    }
  );

  joystick.addEventListener(
    "pointermove",
    (event) => {
      if (
        !joystickActive ||
        event.pointerId !== joystickPointerId
      ) {
        return;
      }

      event.preventDefault();

      updateJoystick(
        event.clientX,
        event.clientY
      );
    }
  );

  const reset = (event) => {
    if (
      event.pointerId !== undefined &&
      event.pointerId !== joystickPointerId
    ) {
      return;
    }

    joystickActive = false;
    joystickPointerId = null;

    joystickX = 0;
    joystickY = 0;

    if (joystickThumb) {
      joystickThumb.style.transform =
        "translate(-50%, -50%)";
    }
  };

  joystick.addEventListener(
    "pointerup",
    reset
  );

  joystick.addEventListener(
    "pointercancel",
    reset
  );

  joystick.addEventListener(
    "lostpointercapture",
    reset
  );
}

function updateJoystick(x, y) {
  const dx = x - joystickCenter.x;
  const dy = y - joystickCenter.y;

  const maxDistance = 45;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );

  const scale =
    distance > maxDistance
      ? maxDistance / distance
      : 1;

  const finalX = dx * scale;
  const finalY = dy * scale;

  joystickX = finalX / maxDistance;
  joystickY = finalY / maxDistance;

  if (joystickThumb) {
    joystickThumb.style.transform =
      `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;
  }
}

/* =========================================================
   MOVEMENT
   ========================================================= */

function updateMovement(delta) {
  if (!player) return;

  let moveX = joystickX;
  let moveZ = joystickY;

  if (keys["w"] || keys["arrowup"]) {
    moveZ -= 1;
  }

  if (keys["s"] || keys["arrowdown"]) {
    moveZ += 1;
  }

  if (keys["a"] || keys["arrowleft"]) {
    moveX -= 1;
  }

  if (keys["d"] || keys["arrowright"]) {
    moveX += 1;
  }

  const length = Math.sqrt(
    moveX * moveX +
      moveZ * moveZ
  );

  if (length > 1) {
    moveX /= length;
    moveZ /= length;
  }

  const speed = 5.0;

  player.position.x +=
    moveX * speed * delta;

  player.position.z +=
    moveZ * speed * delta;

  player.position.x = clamp(
    player.position.x,
    -60,
    60
  );

  player.position.z = clamp(
    player.position.z,
    -60,
    40
  );

  if (length > 0.05) {
    const angle =
      Math.atan2(moveX, moveZ);

    player.rotation.y = angle;

    animateCharacter(
      player,
      delta,
      true
    );
  } else {
    animateCharacter(
      player,
      delta,
      false
    );
  }
}

/* =========================================================
   PARTNER DEMO AI
   ========================================================= */

function updatePartner(delta, elapsed) {
  if (!partner || !player) return;

  const parts = partner.userData.parts;

  if (!parts) return;

  const distance =
    player.position.distanceTo(
      partner.position
    );

  /*
    Hozircha backend ulanmagani uchun
    Robiya/Abdulhodiy demo sherik sifatida
    boshqariladi.
  */

  let target = player.position.clone();

  if (currentStage === 1) {
    target.x += Math.sin(elapsed * 0.5) * 3;
    target.z += Math.cos(elapsed * 0.5) * 3;
  } else {
    target.x += Math.sin(elapsed * 0.4) * 4;
    target.z += Math.cos(elapsed * 0.4) * 4;
  }

  if (distance > 4.5) {
    const direction =
      target
        .sub(partner.position)
        .normalize();

    partner.position.addScaledVector(
      direction,
      delta * 1.8
    );

    partner.rotation.y =
      Math.atan2(
        direction.x,
        direction.z
      );

    animateCharacter(
      partner,
      delta,
      true
    );
  } else {
    animateCharacter(
      partner,
      delta,
      false
    );
  }

  updatePartnerUI();
}

/* =========================================================
   CHARACTER ANIMATION
   ========================================================= */

function animateCharacter(
  character,
  delta,
  walking
) {
  if (!character) return;

  const parts = character.userData.parts;

  if (!parts) return;

  const t = performance.now() * 0.006;

  if (walking) {
    parts.leftLeg.rotation.x =
      Math.sin(t * 3) * 0.5;

    parts.rightLeg.rotation.x =
      Math.sin(t * 3 + Math.PI) * 0.5;

    parts.leftArm.rotation.x =
      Math.sin(t * 3 + Math.PI) * 0.35;

    parts.rightArm.rotation.x =
      Math.sin(t * 3) * 0.35;
  } else {
    parts.leftLeg.rotation.x *= 0.85;
    parts.rightLeg.rotation.x *= 0.85;

    parts.leftArm.rotation.x *= 0.85;
    parts.rightArm.rotation.x *= 0.85;
  }

  parts.body.position.y =
    1.65 +
    Math.sin(t * 1.5) * 0.025;

  parts.head.position.y =
    2.95 +
    Math.sin(t * 1.5) * 0.035;
}

/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera(delta) {
  if (!player || !camera) return;

  const behind = new THREE.Vector3(
    0,
    5.5,
    8.5
  );

  behind.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    player.rotation.y
  );

  targetCameraPosition
    .copy(player.position)
    .add(behind);

  const smooth =
    1 - Math.pow(0.001, delta);

  camera.position.lerp(
    targetCameraPosition,
    smooth
  );

  targetLookAt
    .copy(player.position)
    .add(
      new THREE.Vector3(
        0,
        1.7,
        0
      )
    );

  camera.lookAt(targetLookAt);
}

/* =========================================================
   QUEST UI
   ========================================================= */

function updateQuestUI() {
  const quest =
    quests.find(
      (item) =>
        item.stage === currentStage
    );

  if (!quest) return;

  if (stageCounter) {
    stageCounter.textContent =
      `${currentStage} / 7`;
  }

  if (questTitle) {
    questTitle.textContent =
      quest.title;
  }

  if (questDescription) {
    questDescription.textContent =
      quest.description;
  }

  if (questProgress) {
    questProgress.textContent =
      quest.progress;
  }

  if (questCard) {
    questCard.classList.add("active");
  }

  stageProgress = 0;
}

/* =========================================================
   STAGE INTRO
   ========================================================= */

function showStageIntro(stage) {
  const quest =
    quests.find(
      (item) => item.stage === stage
    );

  if (!quest) return;

  modalStage.textContent =
    `TOPSHIRIQ ${stage}`;

  modalTitle.textContent =
    quest.title;

  modalText.textContent =
    quest.description;

  questModal?.classList.remove("hidden");
questModal?.classList.add("show");
}

function showCinematic(
  icon,
  title,
  text
) {
  if (!cinematicOverlay) return;

  cinematicBusy = true;

  cinematicIcon.textContent = icon;
  cinematicTitle.textContent = title;
  cinematicText.textContent = text;

  cinematicOverlay.classList.remove("hidden");
cinematicOverlay.classList.add("show");
}

function closeCinematic() {
  cinematicOverlay?.classList.remove(
    "show"
  );

  cinematicBusy = false;
}

/* =========================================================
   HUG
   ========================================================= */

function handleHug() {
  if (!player || !partner) return;

  const distance =
    distance3D(
      player,
      partner
    );

  if (distance > 3.4) {
    showToast(
      "❤️",
      "Avval bir-biringizga yaqinlashing."
    );
    return;
  }

  if (currentStage !== 1) {
    showToast(
      "❤️",
      "Bu harakat hozirgi topshiriq uchun emas."
    );
    return;
  }

  performHug();

  showCinematic(
    "🤍",
    "Birinchi uchrashuv",
    "Ikki yurak bir-birini topdi. Shu lahza sizning hikoyangizdagi ilk sahifa bo‘ldi."
  );

  setTimeout(() => {
    closeCinematic();
    completeStage();
  }, 2500);
}

function performHug() {
  if (!player || !partner) return;

  const midpoint =
    new THREE.Vector3()
      .addVectors(
        player.position,
        partner.position
      )
      .multiplyScalar(0.5);

  player.position.lerp(
    midpoint,
    0.35
  );

  partner.position.lerp(
    midpoint,
    0.35
  );

  player.rotation.y =
    Math.atan2(
      partner.position.x -
        player.position.x,
      partner.position.z -
        player.position.z
    );

  partner.rotation.y =
    player.rotation.y +
    Math.PI;

  const p =
    player.userData.parts;

  const q =
    partner.userData.parts;

  if (p && q) {
    p.leftArm.rotation.z = -1.0;
    p.rightArm.rotation.z = 1.0;

    q.leftArm.rotation.z = -1.0;
    q.rightArm.rotation.z = 1.0;
  }
}

/* =========================================================
   HAND HOLDING
   ========================================================= */

function handleHoldingHands() {
  if (!player || !partner) return;

  if (currentStage !== 7) {
    showToast(
      "🤝",
      "Qo‘l ushlash oxirgi topshiriqda."
    );
    return;
  }

  const distance =
    distance3D(
      player,
      partner
    );

  if (distance > 3) {
    showToast(
      "🤝",
      "Bir-biringizga yaqinroq boring."
    );
    return;
  }

  showCinematic(
    "🤝",
    "Qo‘limni qo‘yib yuborma",
    "Ikki insonning qo‘llari birlashganda, yo‘lning o‘zi ham go‘zal bo‘lib qoladi."
  );

  setTimeout(() => {
    closeCinematic();
    showFinalScreen();
  }, 2800);
}

/* =========================================================
   QUEST COMPLETION
   ========================================================= */

function completeStage() {
  if (currentStage >= 7) {
    showFinalScreen();
    return;
  }

  currentStage++;

  stageProgress = 0;

  saveProgress();

  updateQuestUI();

  setTimeout(() => {
    showStageIntro(currentStage);
  }, 500);
}

/* =========================================================
   QUEST LOGIC
   ========================================================= */

function updateQuestLogic(elapsed) {
  if (!player || !partner) return;

  const distance =
    distance3D(
      player,
      partner
    );

  /* Stage 2 */

  if (currentStage === 2) {
    const shrine =
      questObjects.find(
        (item) =>
          item.type === "shrine"
      );

    if (shrine) {
      const shrineDistance =
        player.position.distanceTo(
          shrine.object.position
        );

      const partnerDistance =
        partner.position.distanceTo(
          shrine.object.position
        );

      if (
        shrineDistance < 3.5 &&
        partnerDistance < 3.5
      ) {
        stageProgress = 100;

        updateProgressText(
          "Ikki yurak uyg‘ondi ❤️"
        );

        setTimeout(() => {
          if (currentStage === 2) {
            showCinematic(
              "💗",
              "Ikki yurak",
              "Siz ikkovingiz birga harakat qilganingizda yuraklar uyg‘ondi."
            );

            setTimeout(() => {
              closeCinematic();
              completeStage();
            }, 2300);
          }
        }, 300);
      }
    }
  }

  /* Stage 3 */

  if (currentStage === 3) {
    const switches =
      questObjects.filter(
        (item) =>
          item.type === "switch"
      );

    const nearLeft =
      player.position.distanceTo(
        switches[0].object.position
      ) < 3;

    const nearRight =
      player.position.distanceTo(
        switches[1].object.position
      ) < 3;

    const partnerNearLeft =
      partner.position.distanceTo(
        switches[0].object.position
      ) < 3;

    const partnerNearRight =
      partner.position.distanceTo(
        switches[1].object.position
      ) < 3;

    if (
      (nearLeft && partnerNearRight) ||
      (nearRight && partnerNearLeft)
    ) {
      stageProgress = 100;

      updateProgressText(
        "Ko‘prik ochildi 🌉"
      );

      setTimeout(() => {
        if (currentStage === 3) {
          showCinematic(
            "🌉",
            "Menga ishon",
            "Bir tomonda siz, boshqa tomonda u. Ishonch ikkalangizni birlashtirdi."
          );

          setTimeout(() => {
            closeCinematic();
            completeStage();
          }, 2300);
        }
      }, 300);
    }
  }

  /* Stage 4 */

  if (currentStage === 4) {
    const hearts =
      questObjects.filter(
        (item) =>
          item.type === "collectible"
      );

    let collected = 0;

    hearts.forEach((item) => {
      const heart =
        item.object;

      if (
        !heart.userData.collected
      ) {
        heart.rotation.y =
          elapsed;

        heart.position.y =
          heart.userData.baseY +
          Math.sin(
            elapsed * 2 +
              heart.userData.phase
          ) *
            0.25;

        const d =
          player.position.distanceTo(
            heart.position
          );

        if (
          d < 2.1 &&
          distance < 8
        ) {
          heart.userData.collected =
            true;

          heart.visible = false;

          stageProgress++;
        }
      } else {
        collected++;
      }
    });

    if (collected >= 3) {
      stageProgress = 100;

      updateProgressText(
        "Barcha yuraklar yig‘ildi 💖"
      );

      setTimeout(() => {
        if (currentStage === 4) {
          showCinematic(
            "💖",
            "Yuraklarni birga yig‘amiz",
            "Har bir topilgan yurak sizning hikoyangizga yana bir go‘zal xotira qo‘shdi."
          );

          setTimeout(() => {
            closeCinematic();
            completeStage();
          }, 2300);
        }
      }, 300);
    } else {
      updateProgressText(
        `${collected} / 3 yurak yig‘ildi`
      );
    }
  }

  /* Stage 5 */

  if (currentStage === 5) {
    updateProgressText(
      "🎙️ Bir-biringizga gapiring"
    );
  }

  /* Stage 6 */

  if (currentStage === 6) {
    if (distance <= 6) {
      stageProgress += 0.15;

      stageProgress =
        Math.min(
          stageProgress,
          100
        );

      updateProgressText(
        `Birga sayr: ${Math.floor(
          stageProgress
        )}%`
      );

      if (stageProgress >= 100) {
        setTimeout(() => {
          if (currentStage === 6) {
            showCinematic(
              "🌙",
              "Faqat ikkovimiz",
              "Birga yurgan yo‘l uzoq bo‘lsa ham, sizlar uchun vaqt tez o‘tdi."
            );

            setTimeout(() => {
              closeCinematic();
              completeStage();
            }, 2300);
          }
        }, 300);
      }
    } else {
      stageProgress =
        Math.max(
          0,
          stageProgress - 0.25
        );

      updateProgressText(
        "Bir-biringizdan uzoqlashmang ❤️"
      );
    }
  }

  /* Stage 7 */

  if (currentStage === 7) {
    if (distance <= 3) {
      updateProgressText(
        "🤝 Qo‘l ushlashga tayyor"
      );
    } else {
      updateProgressText(
        "Bir-biringizga yaqinlashing"
      );
    }
  }
}

function updateProgressText(text) {
  if (questProgress) {
    questProgress.textContent =
      text;
  }
}

/* =========================================================
   PARTNER UI
   ========================================================= */

function updatePartnerUI() {
  if (!player || !partner) return;

  const distance =
    distance3D(
      player,
      partner
    );

  if (partnerName) {
    partnerName.textContent =
      selectedRole === "abdulhodiy"
        ? "Robiya Bibi"
        : "Abdulhodiy";
  }

  if (partnerHeart) {
    partnerHeart.textContent =
      distance < 5
        ? "❤️"
        : "♡";
  }

  if (partnerState) {
    if (distance < 3) {
      partnerState.textContent =
        "Sizga juda yaqin ❤️";
    } else if (distance < 8) {
      partnerState.textContent =
        "Yaqin atrofingizda";
    } else {
      partnerState.textContent =
        "Sizni kutmoqda...";
    }
  }
}

/* =========================================================
   VOICE
   ========================================================= */

async function handleVoice() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast(
      "🎙️",
      "Bu qurilmada mikrofon imkoniyati mavjud emas."
    );

    return;
  }

  try {
    voiceStatus.textContent =
      "Mikrofon tekshirilmoqda...";

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    stream
      .getTracks()
      .forEach((track) =>
        track.stop()
      );

    voiceStatus.textContent =
      "Mikrofon tayyor 🎙️";

    showToast(
      "🎙️",
      "Mikrofon ruxsati olindi."
    );

    /*
      Haqiqiy ikki telefonlik voice chat
      keyingi backend/WebRTC bosqichida ulanadi.
    */

    if (currentStage === 5) {
      showCinematic(
        "🎙️",
        "Bir-birimizga gapiramiz",
        "Endi bir-biringizga yurakdan gapiring. Haqiqiy ikki telefonlik ovozli aloqa keyingi multiplayer bosqichida ulanadi."
      );

      setTimeout(() => {
        closeCinematic();

        if (currentStage === 5) {
          completeStage();
        }
      }, 3000);
    }
  } catch (error) {
    console.warn(
      "Microphone permission:",
      error
    );

    voiceStatus.textContent =
      "Mikrofon ruxsati berilmadi";

    showToast(
      "🎙️",
      "Mikrofon uchun ruxsat bering."
    );
  }
}

/* =========================================================
   MUSIC
   ========================================================= */

function toggleMusic() {
  if (!musicOn) {
    startAmbientMusic();

    musicOn = true;

    if (musicButton) {
      musicButton.textContent =
        "🔊";
    }

    showToast(
      "🎵",
      "Romantik musiqa yoqildi."
    );
  } else {
    stopAmbientMusic();

    musicOn = false;

    if (musicButton) {
      musicButton.textContent =
        "🎵";
    }

    showToast(
      "🔇",
      "Musiqa o‘chirildi."
    );
  }
}

function startAmbientMusic() {
  try {
    audioContext =
      audioContext ||
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    if (
      audioContext.state ===
      "suspended"
    ) {
      audioContext.resume();
    }

    masterGain =
      audioContext.createGain();

    masterGain.gain.value = 0.035;

    masterGain.connect(
      audioContext.destination
    );

    const notes = [
      261.63,
      329.63,
      392.0,
      523.25
    ];

    notes.forEach(
      (frequency, index) => {
        const osc =
          audioContext.createOscillator();

        const gain =
          audioContext.createGain();

        osc.type = "sine";

        osc.frequency.value =
          frequency;

        gain.gain.value =
          0.08 /
          (index + 1);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start();

        ambientOscillators.push(
          osc
        );
      }
    );
  } catch (error) {
    console.warn(
      "Audio error:",
      error
    );
  }
}

function stopAmbientMusic() {
  ambientOscillators.forEach(
    (osc) => {
      try {
        osc.stop();
      } catch (_) {}
    }
  );

  ambientOscillators = [];

  if (masterGain) {
    masterGain.disconnect();
    masterGain = null;
  }
}

/* =========================================================
   FINAL SCREEN
   ========================================================= */

function showFinalScreen() {
  questModal?.classList.remove("hidden");
questModal?.classList.add("show");

  if (finalWaiting) {
    finalWaiting.textContent =
      "Ikkalangiz ham “HA ❤️” tugmasini bosishingiz kerak.";
  }

  createFinalHearts();
}

function createFinalHearts() {
  for (let i = 0; i < 25; i++) {
    const heart = document.createElement(
      "div"
    );

    heart.textContent = "❤️";

    heart.style.position =
      "fixed";

    heart.style.left =
      `${random(5, 95)}%`;

    heart.style.top =
      `${random(5, 95)}%`;

    heart.style.fontSize =
      `${random(18, 40)}px`;

    heart.style.opacity =
      "0.7";

    heart.style.pointerEvents =
      "none";

    heart.style.zIndex =
      "99999";

    heart.style.animation =
      `floatHeart ${random(
        2,
        5
      )}s ease-in-out infinite`;

    document.body.appendChild(
      heart
    );

    setTimeout(() => {
      heart.remove();
    }, 8000);
  }
}

function handleFinalYes() {
  if (finalWaiting) {
    finalWaiting.textContent =
      "“HA ❤️” javobi yuborildi. Juftingizning javobi kutilmoqda...";
  }

  showToast(
    "❤️",
    "Siz “HA” deb javob berdingiz."
  );

  /*
    Haqiqiy ikki telefonlik yakun:
    ikkala qurilmaning “HA” javobi backend
    orqali tekshiriladi. Backend hali ulanmaganligi
    sababli bu versiya javobni lokal ko‘rsatadi.
  */
}

/* =========================================================
   RESIZE
   ========================================================= */

function setupResize() {
  window.addEventListener(
    "resize",
    resizeRenderer
  );

  window.addEventListener(
    "orientationchange",
    () => {
      setTimeout(
        resizeRenderer,
        150
      );
    }
  );

  resizeRenderer();
}

function resizeRenderer() {
  if (!renderer || !camera || !world) {
    return;
  }

  const width =
    world.clientWidth ||
    window.innerWidth;

  const height =
    world.clientHeight ||
    window.innerHeight;

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height,
    false
  );
}

/* =========================================================
   WORLD ANIMATION
   ========================================================= */

function animate() {
  if (!gameStarted) return;

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  const elapsed =
    clock.elapsedTime;

  updateMovement(delta);

  updatePartner(
    delta,
    elapsed
  );

  updateQuestLogic(
    elapsed
  );

  updateCamera(delta);

  animateFloatingHearts(
    elapsed
  );

  animateQuestObjects(
    elapsed
  );

  renderer.render(
    scene,
    camera
  );
}

/* =========================================================
   FLOATING HEART ANIMATION
   ========================================================= */

function animateFloatingHearts(
  elapsed
) {
  scene.traverse(
    (object) => {
      if (
        object.isMesh &&
        object.geometry &&
        object.geometry.type ===
          "ExtrudeGeometry"
      ) {
        if (
          object.userData.baseY !==
          undefined
        ) {
          object.position.y =
            object.userData.baseY +
            Math.sin(
              elapsed * 0.8 +
                object.userData.phase
            ) *
              0.35;

          object.rotation.y =
            elapsed * 0.25;
        }
      }
    }
  );
}

/* =========================================================
   QUEST OBJECT ANIMATION
   ========================================================= */

function animateQuestObjects(
  elapsed
) {
  questObjects.forEach(
    (item) => {
      if (
        item.type === "shrine"
      ) {
        const heart =
          item.object.children.find(
            (child) =>
              child.geometry &&
              child.geometry.type ===
                "ExtrudeGeometry"
          );

        if (heart) {
          heart.rotation.y =
            elapsed * 0.7;

          heart.position.y =
            1.8 +
            Math.sin(
              elapsed * 2
            ) *
              0.12;
        }
      }

      if (
        item.type === "switch"
      ) {
        const crystal =
          item.object.children[1];

        if (crystal) {
          crystal.rotation.y =
            elapsed;

          crystal.rotation.x =
            elapsed * 0.7;
        }
      }
    }
  );
}

/* =========================================================
   FINAL SAFETY
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    saveProgress();
  }
);

/* =========================================================
   START
   ========================================================= */

loadProgress();

setupAuth();

boot();

console.log(
  "❤️ Abdulhodiy & Robiya Bibi 3D Love Game loaded."
);

console.log(
  "Room:",
  ROOM_CODE
);

console.log(
  "Story date:",
  STORY_DATE
);
