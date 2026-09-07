/* =========================================================
   ABDULHODIY ❤️ ROBIYA BIBI
   PROFESSIONAL 3D LOVE ADVENTURE
   GAME ENGINE — V1
   ========================================================= */

import * as THREE from "three";

/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  secretCode: "030326",

  storyDate: "03.03.2026",

  world: {
    size: 180,
    groundSize: 180,
    fogNear: 35,
    fogFar: 170
  },

  player: {
    speed: 5.2,
    runSpeed: 7.2,
    rotationSpeed: 10,
    interactionDistance: 3.2
  },

  camera: {
    distance: 8,
    height: 5.2,
    smooth: 7,
    lookHeight: 1.5
  },

  saveKey: "abdulhodiy_robiya_game",

  colors: {
    sky: 0x08050d,
    ground: 0x15101b,
    grass: 0x18261e,
    pink: 0xff4d88,
    gold: 0xe8c783,
    moon: 0xfff4dc,
    water: 0x142b38
  }
};


/* =========================================================
   DOM
========================================================= */

const $ = (selector) => document.querySelector(selector);

const loadingScreen = $("#loading-screen");
const loadingProgress = $("#loading-progress");
const loadingText = $("#loading-text");

const entryScreen = $("#entry-screen");
const secretCodeInput = $("#secret-code");
const toggleCodeButton = $("#toggle-code");
const enterWorldButton = $("#enter-world");
const codeMessage = $("#code-message");

const characterScreen = $("#character-screen");
const roleAbdulhodiy = $("#role-abdulhodiy");
const roleRobiya = $("#role-robiya");
const startGameButton = $("#start-game");

const gameContainer = $("#game-container");
const worldElement = $("#world");

const connectionDot = $("#connection-dot");
const connectionStatus = $("#connection-status");

const stageCounter = $("#stage-counter");

const questTitle = $("#quest-title");
const questDescription = $("#quest-description");
const questProgress = $("#quest-progress");
const questProgressText = $("#quest-progress-text");

const partnerName = $("#partner-name");
const partnerState = $("#partner-state");
const partnerHeart = $("#partner-heart");

const voiceButton = $("#voice-button");
const voiceStatus = $("#voice-status");

const interactionHint = $("#interaction-hint");
const interactionText = $("#interaction-text");

const joystick = $("#joystick");
const joystickThumb = $("#joystick-thumb");

const hugButton = $("#hug-button");
const handButton = $("#hand-button");

const musicButton = $("#music-button");
const mapButton = $("#map-button");
const settingsButton = $("#settings-button");

const cinematicOverlay = $("#cinematic-overlay");
const cinematicIcon = $("#cinematic-icon");
const cinematicTitle = $("#cinematic-title");
const cinematicText = $("#cinematic-text");
const cinematicNext = $("#cinematic-next");

const questModal = $("#quest-modal");
const finalScreen = $("#final-screen");

const toast = $("#toast");
const toastIcon = $("#toast-icon");
const toastText = $("#toast-text");


/* =========================================================
   GAME STATE
========================================================= */

const state = {
  started: false,

  role: null,

  selectedCharacter: null,

  sceneReady: false,

  audioEnabled: false,

  voiceConnected: false,

  keys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false
  },

  joystick: {
    active: false,
    x: 0,
    y: 0,
    pointerId: null
  },

  player: {
    position: new THREE.Vector3(0, 0, 12),
    rotation: 0,
    velocity: new THREE.Vector3()
  },

  partner: {
    position: new THREE.Vector3(0, 0, -12),
    rotation: Math.PI,
    connected: false
  },

  quest: {
    current: 1,
    total: 7,
    progress: 0,
    completed: false
  },

  interaction: {
    nearby: false,
    type: null
  },

  worldTime: 0,

  save: {
    quest: 1,
    role: null,
    completed: []
  }
};


/* =========================================================
   THREE.JS VARIABLES
========================================================= */

let renderer;
let scene;
let camera;
let clock;

let playerGroup;
let partnerGroup;

let playerCharacter;
let partnerCharacter;

let cameraTarget = new THREE.Vector3();
let cameraPosition = new THREE.Vector3();

let worldObjects = [];
let flowers = [];
let fireflies = [];
let lanterns = [];
let heartObjects = [];

let fountain;
let waterSurface;

let animationFrame;


/* =========================================================
   INITIAL BOOT
========================================================= */

document.addEventListener("DOMContentLoaded", boot);

async function boot() {
  try {
    loadSave();

    await loadingSequence();

    showScreen(entryScreen);

    initializeEntry();

  } catch (error) {
    console.error("Game boot error:", error);

    if (loadingText) {
      loadingText.textContent = "Dunyoni yuklashda xatolik...";
    }
  }
}


/* =========================================================
   LOADING
========================================================= */

async function loadingSequence() {

  const steps = [
    [8, "Yuraklar dunyosi tayyorlanmoqda..."],
    [18, "Oy nuri yoqilmoqda..."],
    [30, "Yulduzlar uyg‘onmoqda..."],
    [42, "Bog‘ yaratilmoqda..."],
    [55, "Fountain tayyorlanmoqda..."],
    [68, "Chiroqlar yoqilmoqda..."],
    [80, "Sehrli muhit yaratilmoqda..."],
    [92, "Hikoyamiz tayyor..."],
    [100, "Xush kelibsiz."]
  ];

  for (const [progress, text] of steps) {
    await wait(170);

    if (loadingProgress) {
      loadingProgress.style.width = `${progress}%`;
    }

    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  await wait(500);

  loadingScreen?.classList.add("hidden");
}


/* =========================================================
   ENTRY
========================================================= */

function initializeEntry() {

  if (!entryScreen) return;

  secretCodeInput?.focus();

  toggleCodeButton?.addEventListener("click", () => {

    if (secretCodeInput.type === "password") {
      secretCodeInput.type = "text";
      toggleCodeButton.textContent = "◉";
    } else {
      secretCodeInput.type = "password";
      toggleCodeButton.textContent = "◉";
    }

  });


  secretCodeInput?.addEventListener("input", () => {

    secretCodeInput.value =
      secretCodeInput.value.replace(/\D/g, "").slice(0, 6);

    clearCodeMessage();

  });


  secretCodeInput?.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
      enterWorld();
    }

  });


  enterWorldButton?.addEventListener("click", enterWorld);
}


function enterWorld() {

  const code = secretCodeInput?.value.trim();

  if (code !== CONFIG.secretCode) {

    showCodeError();

    return;
  }

  showCodeSuccess();

  setTimeout(() => {

    hideScreen(entryScreen);

    showScreen(characterScreen);

    initializeCharacterSelection();

  }, 650);
}


function showCodeError() {

  if (!codeMessage) return;

  codeMessage.textContent = "Kod noto‘g‘ri... yana bir o‘ylab ko‘ring ❤️";
  codeMessage.classList.add("show");

  secretCodeInput?.classList.add("error");

  setTimeout(() => {
    secretCodeInput?.classList.remove("error");
  }, 500);
}


function showCodeSuccess() {

  if (!codeMessage) return;

  codeMessage.textContent = "Kod to‘g‘ri. Bizning dunyomiz ochildi ❤️";
  codeMessage.classList.add("show");

  secretCodeInput?.classList.add("success");
}


/* =========================================================
   CHARACTER SELECTION
========================================================= */

function initializeCharacterSelection() {

  roleAbdulhodiy?.addEventListener("click", () => {
    selectCharacter("abdulhodiy");
  });

  roleRobiya?.addEventListener("click", () => {
    selectCharacter("robiya");
  });

  startGameButton?.addEventListener("click", startGame);

  updateCharacterButtons();

}


function selectCharacter(role) {

  state.role = role;
  state.selectedCharacter = role;

  roleAbdulhodiy?.classList.toggle(
    "selected",
    role === "abdulhodiy"
  );

  roleRobiya?.classList.toggle(
    "selected",
    role === "robiya"
  );

  if (startGameButton) {
    startGameButton.disabled = false;
  }

  saveGame();

  showToast(
    "❤️",
    role === "abdulhodiy"
      ? "Abdulhodiy tanlandi"
      : "Robiya Bibi tanlandi"
  );
}


function updateCharacterButtons() {

  if (!state.role) return;

  roleAbdulhodiy?.classList.toggle(
    "selected",
    state.role === "abdulhodiy"
  );

  roleRobiya?.classList.toggle(
    "selected",
    state.role === "robiya"
  );

}


/* =========================================================
   START GAME
========================================================= */

async function startGame() {

  if (!state.role) {

    showToast(
      "❤️",
      "Avval qahramoningizni tanlang."
    );

    return;
  }

  if (state.started) return;

  state.started = true;

  startGameButton.disabled = true;

  hideScreen(characterScreen);

  showScreen(gameContainer);

  await wait(200);

  initializeThree();

  await buildWorld();

  setupControls();

  setupGameButtons();

  state.sceneReady = true;

  connectionStatus.textContent =
    "Mahalliy rejim";

  connectionDot.classList.add("local");

  startGameLoop();

  startOpeningCinematic();

  updateQuestUI();

  saveGame();
}


/* =========================================================
   THREE INITIALIZATION
========================================================= */

function initializeThree() {

  scene = new THREE.Scene();

  scene.background =
    new THREE.Color(CONFIG.colors.sky);

  scene.fog = new THREE.Fog(
    CONFIG.colors.sky,
    CONFIG.world.fogNear,
    CONFIG.world.fogFar
  );


  camera = new THREE.PerspectiveCamera(
    55,
    1,
    0.1,
    500
  );

  camera.position.set(
    0,
    CONFIG.camera.height,
    CONFIG.camera.distance
  );


  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.8)
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  worldElement.appendChild(renderer.domElement);


  clock = new THREE.Clock();


  setupLights();

  resizeRenderer();

  window.addEventListener(
    "resize",
    resizeRenderer
  );

}


/* =========================================================
   LIGHTING
========================================================= */

function setupLights() {

  const ambient = new THREE.HemisphereLight(
    0x51435e,
    0x09070d,
    1.7
  );

  scene.add(ambient);


  const moonLight = new THREE.DirectionalLight(
    0xb7c5ff,
    2.0
  );

  moonLight.position.set(
    -30,
    50,
    -25
  );

  moonLight.castShadow = true;

  moonLight.shadow.mapSize.width = 1024;
  moonLight.shadow.mapSize.height = 1024;

  moonLight.shadow.camera.left = -70;
  moonLight.shadow.camera.right = 70;
  moonLight.shadow.camera.top = 70;
  moonLight.shadow.camera.bottom = -70;

  scene.add(moonLight);


  const pinkLight = new THREE.PointLight(
    CONFIG.colors.pink,
    7,
    30
  );

  pinkLight.position.set(
    0,
    4,
    -4
  );

  scene.add(pinkLight);

}


/* =========================================================
   WORLD
========================================================= */

async function buildWorld() {

  createGround();

  createMoon();

  createStars();

  createGarden();

  createPath();

  createFountain();

  createLanterns();

  createFlowers();

  createTrees();

  createFireflies();

  createRomanticHearts();

  createPlayer();

  createPartner();

  createWorldBoundaries();

}


/* =========================================================
   GROUND
========================================================= */

function createGround() {

  const geometry = new THREE.CircleGeometry(
    CONFIG.world.groundSize / 2,
    96
  );

  const material = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.ground,
    roughness: 1
  });

  const ground = new THREE.Mesh(
    geometry,
    material
  );

  ground.rotation.x = -Math.PI / 2;

  ground.receiveShadow = true;

  scene.add(ground);

  worldObjects.push(ground);


  const grassGeometry =
    new THREE.CircleGeometry(76, 96);

  const grassMaterial =
    new THREE.MeshStandardMaterial({
      color: CONFIG.colors.grass,
      roughness: 1
    });

  const grass = new THREE.Mesh(
    grassGeometry,
    grassMaterial
  );

  grass.rotation.x = -Math.PI / 2;
  grass.position.y = 0.01;

  scene.add(grass);

}


/* =========================================================
   MOON
========================================================= */

function createMoon() {

  const moonGeometry =
    new THREE.SphereGeometry(7, 48, 48);

  const moonMaterial =
    new THREE.MeshBasicMaterial({
      color: CONFIG.colors.moon
    });

  const moon =
    new THREE.Mesh(
      moonGeometry,
      moonMaterial
    );

  moon.position.set(
    -35,
    42,
    -70
  );

  scene.add(moon);


  const glowGeometry =
    new THREE.SphereGeometry(9, 32, 32);

  const glowMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffdced,
      transparent: true,
      opacity: 0.08
    });

  const glow =
    new THREE.Mesh(
      glowGeometry,
      glowMaterial
    );

  glow.position.copy(moon.position);

  scene.add(glow);

}


/* =========================================================
   STARS
========================================================= */

function createStars() {

  const count = 1200;

  const positions = new Float32Array(
    count * 3
  );

  for (let i = 0; i < count; i++) {

    const radius =
      80 + Math.random() * 120;

    const theta =
      Math.random() * Math.PI * 2;

    const phi =
      Math.random() * Math.PI * 0.45;

    positions[i * 3] =
      Math.sin(phi) *
      Math.cos(theta) *
      radius;

    positions[i * 3 + 1] =
      Math.cos(phi) *
      radius * 0.75 + 20;

    positions[i * 3 + 2] =
      Math.sin(phi) *
      Math.sin(theta) *
      radius;

  }


  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );


  const material =
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.55,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });


  const stars =
    new THREE.Points(
      geometry,
      material
    );

  scene.add(stars);

}


/* =========================================================
   PATH
========================================================= */

function createPath() {

  const pathGeometry =
    new THREE.BoxGeometry(
      8,
      0.08,
      130
    );

  const pathMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x302532,
      roughness: 0.9
    });

  const path =
    new THREE.Mesh(
      pathGeometry,
      pathMaterial
    );

  path.position.set(
    0,
    0.04,
    0
  );

  path.receiveShadow = true;

  scene.add(path);


  for (let z = -60; z <= 60; z += 8) {

    const stoneGeometry =
      new THREE.BoxGeometry(
        6.5,
        0.12,
        4.5
      );

    const stoneMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x413443,
        roughness: 0.95
      });

    const stone =
      new THREE.Mesh(
        stoneGeometry,
        stoneMaterial
      );

    stone.position.set(
      (Math.random() - 0.5) * 0.8,
      0.09,
      z
    );

    scene.add(stone);
  }

}


/* =========================================================
   GARDEN
========================================================= */

function createGarden() {

  const gardenPositions = [
    [-24, -20],
    [24, -20],
    [-28, 4],
    [28, 4],
    [-22, 30],
    [22, 30]
  ];

  gardenPositions.forEach(
    ([x, z]) => {

      const bushGeometry =
        new THREE.SphereGeometry(
          3 + Math.random() * 1.5,
          20,
          20
        );

      const bushMaterial =
        new THREE.MeshStandardMaterial({
          color: 0x152b20,
          roughness: 1
        });

      const bush =
        new THREE.Mesh(
          bushGeometry,
          bushMaterial
        );

      bush.position.set(
        x,
        2,
        z
      );

      bush.scale.y = 0.7;

      bush.castShadow = true;

      scene.add(bush);

    }
  );

}


/* =========================================================
   TREES
========================================================= */

function createTrees() {

  const positions = [];

  for (let i = 0; i < 24; i++) {

    const angle =
      Math.random() * Math.PI * 2;

    const radius =
      35 + Math.random() * 38;

    positions.push([
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ]);

  }


  positions.forEach(
    ([x, z]) => {

      const trunkGeometry =
        new THREE.CylinderGeometry(
          0.45,
          0.7,
          6,
          12
        );

      const trunkMaterial =
        new THREE.MeshStandardMaterial({
          color: 0x241914
        });

      const trunk =
        new THREE.Mesh(
          trunkGeometry,
          trunkMaterial
        );

      trunk.position.set(
        x,
        3,
        z
      );

      trunk.castShadow = true;

      scene.add(trunk);


      const crownGeometry =
        new THREE.SphereGeometry(
          3.2 + Math.random() * 1.8,
          18,
          18
        );

      const crownMaterial =
        new THREE.MeshStandardMaterial({
          color: 0x11251c,
          roughness: 1
        });

      const crown =
        new THREE.Mesh(
          crownGeometry,
          crownMaterial
        );

      crown.position.set(
        x,
        7,
        z
      );

      crown.scale.y = 1.1;

      crown.castShadow = true;

      scene.add(crown);

    }
  );

}


/* =========================================================
   FLOWERS
========================================================= */

function createFlowers() {

  for (let i = 0; i < 160; i++) {

    const angle =
      Math.random() * Math.PI * 2;

    const radius =
      10 + Math.random() * 58;

    const x =
      Math.cos(angle) * radius;

    const z =
      Math.sin(angle) * radius;


    if (Math.abs(x) < 5) continue;


    const stemGeometry =
      new THREE.CylinderGeometry(
        0.025,
        0.035,
        0.7,
        6
      );

    const stemMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x32613b
      });

    const stem =
      new THREE.Mesh(
        stemGeometry,
        stemMaterial
      );

    stem.position.set(
      x,
      0.35,
      z
    );

    scene.add(stem);


    const flowerGeometry =
      new THREE.SphereGeometry(
        0.16,
        8,
        8
      );

    const flowerMaterial =
      new THREE.MeshStandardMaterial({
        color:
          Math.random() > 0.5
            ? CONFIG.colors.pink
            : CONFIG.colors.gold,

        emissive:
          Math.random() > 0.5
            ? CONFIG.colors.pink
            : CONFIG.colors.gold,

        emissiveIntensity: 0.35
      });

    const flower =
      new THREE.Mesh(
        flowerGeometry,
        flowerMaterial
      );

    flower.position.set(
      x,
      0.78,
      z
    );

    scene.add(flower);

    flowers.push({
      mesh: flower,
      baseY: 0.78,
      phase: Math.random() * 10
    });

  }

}


/* =========================================================
   LANTERNS
========================================================= */

function createLanterns() {

  for (let z = -60; z <= 60; z += 12) {

    createLantern(-6, z);
    createLantern(6, z);

  }

}


function createLantern(x, z) {

  const poleGeometry =
    new THREE.CylinderGeometry(
      0.06,
      0.09,
      3.2,
      8
    );

  const poleMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x29222d,
      metalness: 0.5,
      roughness: 0.6
    });

  const pole =
    new THREE.Mesh(
      poleGeometry,
      poleMaterial
    );

  pole.position.set(
    x,
    1.6,
    z
  );

  scene.add(pole);


  const lightGeometry =
    new THREE.SphereGeometry(
      0.28,
      16,
      16
    );

  const lightMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffdca2,
      emissive: 0xff9b45,
      emissiveIntensity: 3
    });

  const bulb =
    new THREE.Mesh(
      lightGeometry,
      lightMaterial
    );

  bulb.position.set(
    x,
    3.1,
    z
  );

  scene.add(bulb);


  const light =
    new THREE.PointLight(
      0xffa05a,
      1.5,
      9
    );

  light.position.set(
    x,
    3.1,
    z
  );

  scene.add(light);

  lanterns.push(light);

}


/* =========================================================
   FOUNTAIN
========================================================= */

function createFountain() {

  const group =
    new THREE.Group();

  group.position.set(
    0,
    0,
    -25
  );


  const baseGeometry =
    new THREE.CylinderGeometry(
      6,
      7,
      0.8,
      48
    );

  const baseMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x514550,
      roughness: 0.7
    });

  const base =
    new THREE.Mesh(
      baseGeometry,
      baseMaterial
    );

  base.position.y = 0.4;

  base.receiveShadow = true;

  group.add(base);


  const waterGeometry =
    new THREE.CylinderGeometry(
      5.3,
      5.3,
      0.15,
      48
    );

  const waterMaterial =
    new THREE.MeshPhysicalMaterial({
      color: CONFIG.colors.water,
      transparent: true,
      opacity: 0.75,
      roughness: 0.15,
      metalness: 0.15
    });

  waterSurface =
    new THREE.Mesh(
      waterGeometry,
      waterMaterial
    );

  waterSurface.position.y = 0.85;

  group.add(waterSurface);


  const centerGeometry =
    new THREE.CylinderGeometry(
      1.2,
      1.5,
      2.5,
      24
    );

  const center =
    new THREE.Mesh(
      centerGeometry,
      baseMaterial
    );

  center.position.y = 1.8;

  group.add(center);


  const waterJetGeometry =
    new THREE.CylinderGeometry(
      0.06,
      0.06,
      3,
      8
    );

  const waterJetMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x9edcff,
      transparent: true,
      opacity: 0.55
    });

  const jet =
    new THREE.Mesh(
      waterJetGeometry,
      waterJetMaterial
    );

  jet.position.y = 3.1;

  group.add(jet);


  const fountainLight =
    new THREE.PointLight(
      0x7fcfff,
      3,
      16
    );

  fountainLight.position.set(
    0,
    2,
    0
  );

  group.add(fountainLight);


  scene.add(group);

  fountain = group;

}


/* =========================================================
   FIREFLIES
========================================================= */

function createFireflies() {

  const geometry =
    new THREE.SphereGeometry(
      0.045,
      8,
      8
    );

  const material =
    new THREE.MeshBasicMaterial({
      color: 0xffe7a6
    });


  for (let i = 0; i < 80; i++) {

    const fly =
      new THREE.Mesh(
        geometry,
        material
      );

    fly.position.set(
      (Math.random() - 0.5) * 110,
      0.8 + Math.random() * 5,
      (Math.random() - 0.5) * 110
    );

    scene.add(fly);

    fireflies.push({
      mesh: fly,
      phase: Math.random() * 20,
      speed: 0.4 + Math.random() * 0.8
    });

  }

}


/* =========================================================
   HEART OBJECTS
========================================================= */

function createRomanticHearts() {

  const positions = [
    [-13, -12],
    [13, -12],
    [-15, 15],
    [15, 15],
    [-10, 35],
    [10, 35]
  ];


  positions.forEach(
    ([x, z], index) => {

      const group =
        new THREE.Group();

      group.position.set(
        x,
        1.2,
        z
      );


      const shape =
        new THREE.Shape();

      shape.moveTo(0, 0.35);

      shape.bezierCurveTo(
        -0.8,
        1.0,
        -1.5,
        0.35,
        0,
        -0.9
      );

      shape.bezierCurveTo(
        1.5,
        0.35,
        0.8,
        1.0,
        0,
        0.35
      );


      const geometry =
        new THREE.ShapeGeometry(shape);

      const material =
        new THREE.MeshBasicMaterial({
          color: CONFIG.colors.pink,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        });


      const heart =
        new THREE.Mesh(
          geometry,
          material
        );

      heart.scale.set(
        0.45,
        0.45,
        0.45
      );

      heart.rotation.x =
        -Math.PI / 2;

      group.add(heart);

      scene.add(group);


      heartObjects.push({
        group,
        phase: index
      });

    }
  );

}


/* =========================================================
   PLAYER
========================================================= */

function createPlayer() {

  playerGroup =
    new THREE.Group();

  playerGroup.position.copy(
    state.player.position
  );

  scene.add(playerGroup);


  playerCharacter =
    createProceduralCharacter(
      state.role || "abdulhodiy"
    );

  playerGroup.add(
    playerCharacter
  );

}


/* =========================================================
   PARTNER
========================================================= */

function createPartner() {

  partnerGroup =
    new THREE.Group();

  partnerGroup.position.copy(
    state.partner.position
  );

  scene.add(partnerGroup);


  const partnerRole =
    state.role === "abdulhodiy"
      ? "robiya"
      : "abdulhodiy";


  partnerCharacter =
    createProceduralCharacter(
      partnerRole
    );

  partnerGroup.add(
    partnerCharacter
  );


  state.partner.connected = false;

  partnerName.textContent =
    partnerRole === "robiya"
      ? "Robiya Bibi"
      : "Abdulhodiy";

  partnerState.textContent =
    "Hozircha kutilmoqda...";

}


/* =========================================================
   PROCEDURAL CHARACTER
========================================================= */

function createProceduralCharacter(role) {

  const group =
    new THREE.Group();


  const isMale =
    role === "abdulhodiy";


  /* Body */

  const bodyGeometry =
    new THREE.CapsuleGeometry(
      0.48,
      1.25,
      8,
      16
    );

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color:
        isMale
          ? 0xe7e0dc
          : 0x351b31,

      roughness: 0.72
    });

  const body =
    new THREE.Mesh(
      bodyGeometry,
      bodyMaterial
    );

  body.position.y = 1.05;

  body.castShadow = true;

  group.add(body);


  /* Head */

  const headGeometry =
    new THREE.SphereGeometry(
      0.43,
      24,
      24
    );

  const headMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xc98e70,
      roughness: 0.8
    });

  const head =
    new THREE.Mesh(
      headGeometry,
      headMaterial
    );

  head.position.y = 2.15;

  head.castShadow = true;

  group.add(head);


  /* Hair */

  if (isMale) {

    const hairGeometry =
      new THREE.SphereGeometry(
        0.45,
        20,
        20,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55
      );

    const hairMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x171318
      });

    const hair =
      new THREE.Mesh(
        hairGeometry,
        hairMaterial
      );

    hair.position.y = 2.3;

    group.add(hair);

  } else {

    const hijabGeometry =
      new THREE.SphereGeometry(
        0.62,
        24,
        24
      );

    const hijabMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x09080c,
        roughness: 0.85
      });

    const hijab =
      new THREE.Mesh(
        hijabGeometry,
        hijabMaterial
      );

    hijab.position.y = 2.25;

    hijab.scale.z = 0.85;

    group.add(hijab);

  }


  /* Eyes */

  const eyeGeometry =
    new THREE.SphereGeometry(
      0.045,
      8,
      8
    );

  const eyeMaterial =
    new THREE.MeshBasicMaterial({
      color: 0x090609
    });


  [-0.14, 0.14].forEach(
    (x) => {

      const eye =
        new THREE.Mesh(
          eyeGeometry,
          eyeMaterial
        );

      eye.position.set(
        x,
        2.17,
        0.39
      );

      group.add(eye);

    }
  );


  /* Heart */

  const heartGeometry =
    new THREE.SphereGeometry(
      0.08,
      12,
      12
    );

  const heartMaterial =
    new THREE.MeshBasicMaterial({
      color: CONFIG.colors.pink
    });

  const heart =
    new THREE.Mesh(
      heartGeometry,
      heartMaterial
    );

  heart.position.set(
    0,
    1.3,
    0.48
  );

  group.add(heart);


  return group;

}


/* =========================================================
   BOUNDARIES
========================================================= */

function createWorldBoundaries() {

  // Invisible logical boundary.
  // Player movement is clamped in updatePlayer().

}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

  window.addEventListener(
    "keydown",
    onKeyDown
  );

  window.addEventListener(
    "keyup",
    onKeyUp
  );


  setupJoystick();

}


function onKeyDown(event) {

  switch (event.code) {

    case "KeyW":
    case "ArrowUp":
      state.keys.forward = true;
      break;

    case "KeyS":
    case "ArrowDown":
      state.keys.backward = true;
      break;

    case "KeyA":
    case "ArrowLeft":
      state.keys.left = true;
      break;

    case "KeyD":
    case "ArrowRight":
      state.keys.right = true;
      break;

    case "ShiftLeft":
    case "ShiftRight":
      state.keys.run = true;
      break;

    case "KeyE":
      tryInteraction();
      break;

  }

}


function onKeyUp(event) {

  switch (event.code) {

    case "KeyW":
    case "ArrowUp":
      state.keys.forward = false;
      break;

    case "KeyS":
    case "ArrowDown":
      state.keys.backward = false;
      break;

    case "KeyA":
    case "ArrowLeft":
      state.keys.left = false;
      break;

    case "KeyD":
    case "ArrowRight":
      state.keys.right = false;
      break;

    case "ShiftLeft":
    case "ShiftRight":
      state.keys.run = false;
      break;

  }

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

      state.joystick.active = true;
      state.joystick.pointerId =
        event.pointerId;

      joystick.setPointerCapture(
        event.pointerId
      );

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
        !state.joystick.active ||
        state.joystick.pointerId !==
          event.pointerId
      ) {
        return;
      }

      updateJoystick(
        event.clientX,
        event.clientY
      );

    }
  );


  const release = () => {

    state.joystick.active = false;

    state.joystick.x = 0;
    state.joystick.y = 0;

    if (joystickThumb) {

      joystickThumb.style.transform =
        "translate(-50%, -50%)";

    }

  };


  joystick.addEventListener(
    "pointerup",
    release
  );

  joystick.addEventListener(
    "pointercancel",
    release
  );

}


function updateJoystick(clientX, clientY) {

  const rect =
    joystick.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;

  let dx =
    clientX - centerX;

  let dy =
    clientY - centerY;


  const max =
    rect.width * 0.34;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (distance > max) {

    dx =
      (dx / distance) * max;

    dy =
      (dy / distance) * max;

  }


  state.joystick.x =
    dx / max;

  state.joystick.y =
    dy / max;


  if (joystickThumb) {

    joystickThumb.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

  }

}


/* =========================================================
   GAME BUTTONS
========================================================= */

function setupGameButtons() {

  hugButton?.addEventListener(
    "click",
    performHug
  );

  handButton?.addEventListener(
    "click",
    performHoldHands
  );


  voiceButton?.addEventListener(
    "click",
    toggleVoice
  );


  musicButton?.addEventListener(
    "click",
    toggleMusic
  );


  mapButton?.addEventListener(
    "click",
    showMapMessage
  );


  settingsButton?.addEventListener(
    "click",
    showSettingsMessage
  );


  cinematicNext?.addEventListener(
    "click",
    closeCinematic
  );

}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(delta) {

  if (!playerGroup) return;


  const keyboardX =
    (state.keys.right ? 1 : 0) -
    (state.keys.left ? 1 : 0);

  const keyboardY =
    (state.keys.backward ? 1 : 0) -
    (state.keys.forward ? 1 : 0);


  let inputX =
    keyboardX;

  let inputY =
    keyboardY;


  if (state.joystick.active) {

    inputX =
      state.joystick.x;

    inputY =
      state.joystick.y;

  }


  const input =
    new THREE.Vector2(
      inputX,
      inputY
    );


  if (input.lengthSq() > 1) {
    input.normalize();
  }


  const moving =
    input.lengthSq() > 0.01;


  const speed =
    state.keys.run
      ? CONFIG.player.runSpeed
      : CONFIG.player.speed;


  if (moving) {

    const forward =
      new THREE.Vector3(
        input.x,
        0,
        input.y
      );


    const desiredAngle =
      Math.atan2(
        forward.x,
        forward.z
      );


    playerGroup.rotation.y =
      dampAngle(
        playerGroup.rotation.y,
        desiredAngle,
        CONFIG.player.rotationSpeed,
        delta
      );


    const move =
      forward.multiplyScalar(
        speed * delta
      );


    playerGroup.position.add(
      move
    );

  }


  const limit =
    CONFIG.world.size / 2 - 5;


  playerGroup.position.x =
    THREE.MathUtils.clamp(
      playerGroup.position.x,
      -limit,
      limit
    );

  playerGroup.position.z =
    THREE.MathUtils.clamp(
      playerGroup.position.z,
      -limit,
      limit
    );


  state.player.position.copy(
    playerGroup.position
  );


  animateCharacter(
    playerCharacter,
    moving,
    delta
  );

}


/* =========================================================
   CHARACTER ANIMATION
========================================================= */

function animateCharacter(
  character,
  moving,
  delta
) {

  if (!character) return;

  const time =
    performance.now() * 0.005;


  if (moving) {

    character.position.y =
      Math.abs(
        Math.sin(time * 2.2)
      ) * 0.04;

    character.rotation.z =
      Math.sin(time * 2.2) * 0.015;

  } else {

    character.position.y =
      Math.sin(time) * 0.015;

    character.rotation.z *=
      Math.pow(0.1, delta);

  }

}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera(delta) {

  if (!camera || !playerGroup) return;


  const distance =
    CONFIG.camera.distance;


  const height =
    CONFIG.camera.height;


  const rotation =
    playerGroup.rotation.y;


  cameraPosition.set(
    playerGroup.position.x -
      Math.sin(rotation) * distance,

    playerGroup.position.y +
      height,

    playerGroup.position.z -
      Math.cos(rotation) * distance
  );


  const smooth =
    1 -
    Math.exp(
      -CONFIG.camera.smooth * delta
    );


  camera.position.lerp(
    cameraPosition,
    smooth
  );


  cameraTarget.set(
    playerGroup.position.x,
    playerGroup.position.y +
      CONFIG.camera.lookHeight,
    playerGroup.position.z
  );


  camera.lookAt(
    cameraTarget
  );

}


/* =========================================================
   PARTNER
========================================================= */

function updatePartner(delta) {

  if (!partnerGroup) return;


  partnerGroup.position.y =
    Math.sin(
      performance.now() * 0.001
    ) * 0.02;


  animateCharacter(
    partnerCharacter,
    false,
    delta
  );

}


/* =========================================================
   INTERACTION
========================================================= */

function updateInteraction() {

  if (!playerGroup || !partnerGroup) return;


  const distance =
    playerGroup.position.distanceTo(
      partnerGroup.position
    );


  const nearby =
    distance <=
    CONFIG.player.interactionDistance;


  state.interaction.nearby =
    nearby;


  if (!nearby) {

    hugButton.disabled = true;
    handButton.disabled = true;

    hideInteractionHint();

    return;

  }


  hugButton.disabled = false;
  handButton.disabled = false;


  if (state.quest.current === 1) {

    showInteractionHint(
      "Robiya Bibini quchoqlash uchun yaqinlashing ❤️"
    );

  } else {

    showInteractionHint(
      "Birgalikdagi harakat"
    );

  }

}


/* =========================================================
   HUG
========================================================= */

function performHug() {

  if (!state.interaction.nearby) {

    showToast(
      "❤️",
      "Robiya Bibiga yaqinroq boring."
    );

    return;

  }


  if (state.quest.current !== 1) {

    showToast(
      "✦",
      "Bu harakat hozirgi topshiriq uchun kerak emas."
    );

    return;

  }


  const distance =
    playerGroup.position.distanceTo(
      partnerGroup.position
    );


  if (
    distance >
    CONFIG.player.interactionDistance
  ) {
    return;
  }


  playHugAnimation();

  completeQuest(1);

}


/* =========================================================
   HUG ANIMATION
========================================================= */

function playHugAnimation() {

  const midpoint =
    playerGroup.position
      .clone()
      .add(partnerGroup.position)
      .multiplyScalar(0.5);


  showCinematic(
    "❤️",
    "Birinchi uchrashuv",
    "Ba’zi uchrashuvlar tasodif emas..."
  );


  const startPlayer =
    playerGroup.position.clone();

  const startPartner =
    partnerGroup.position.clone();


  const duration = 1000;
  const start = performance.now();


  function animateHug(now) {

    const t =
      Math.min(
        (now - start) / duration,
        1
      );


    const eased =
      t * t * (3 - 2 * t);


    playerGroup.position.lerpVectors(
      startPlayer,
      midpoint.clone().add(
        new THREE.Vector3(
          0,
          0,
          0.55
        )
      ),
      eased
    );


    partnerGroup.position.lerpVectors(
      startPartner,
      midpoint.clone().add(
        new THREE.Vector3(
          0,
          0,
          -0.55
        )
      ),
      eased
    );


    if (t < 1) {
      requestAnimationFrame(
        animateHug
      );
    } else {

      playerGroup.lookAt(
        partnerGroup.position
      );

      partnerGroup.lookAt(
        playerGroup.position
      );

    }

  }


  requestAnimationFrame(
    animateHug
  );

}


/* =========================================================
   HOLD HANDS
========================================================= */

function performHoldHands() {

  if (!state.interaction.nearby) {

    showToast(
      "🤝",
      "Avval bir-biringizga yaqinlashing."
    );

    return;

  }


  if (state.quest.current === 7) {

    showCinematic(
      "🤝",
      "Qo‘limni qo‘yib yuborma",
      "Ba’zi yo‘llar faqat birga bosib o‘tiladi."
    );

    completeQuest(7);

    return;

  }


  showToast(
    "🤝",
    "Bir kun kelib bu qo‘llar hech qachon ajramaydi."
  );

}


/* =========================================================
   QUEST SYSTEM
========================================================= */

const QUESTS = {

  1: {
    title: "Birinchi uchrashuv",
    description: "Robiya Bibini toping va uni quchoqlang."
  },

  2: {
    title: "Ikki yurak",
    description: "Ikkingiz bir vaqtda yurakni faollashtiring."
  },

  3: {
    title: "Menga ishon",
    description: "Ko‘prik mexanizmini birgalikda ishga tushiring."
  },

  4: {
    title: "Yuraklarni birga yig‘amiz",
    description: "Bog‘dagi yuraklarni birgalikda toping."
  },

  5: {
    title: "Bir-birimizga gapiramiz",
    description: "Ovoz orqali bir-biringizga gapiring."
  },

  6: {
    title: "Faqat ikkovimiz",
    description: "Birga yuring. Bir-biringizdan uzoqlashmang."
  },

  7: {
    title: "Qo‘limni qo‘yib yuborma",
    description: "Qo‘llaringizni ushlang va oxirgi sahnaga yetib boring."
  }

};


function updateQuestUI() {

  const quest =
    QUESTS[state.quest.current];

  if (!quest) return;


  questTitle.textContent =
    quest.title;

  questDescription.textContent =
    quest.description;


  const percentage =
    state.quest.progress;


  questProgress.style.width =
    `${percentage}%`;

  questProgressText.textContent =
    `${percentage}%`;


  stageCounter.textContent =
    `${String(state.quest.current).padStart(2, "0")} / 07`;

}


function completeQuest(number) {

  if (
    state.quest.current !== number ||
    state.quest.completed
  ) {
    return;
  }


  state.quest.completed = true;

  state.quest.progress = 100;

  updateQuestUI();

  saveGame();


  showToast(
    "❤️",
    "Topshiriq bajarildi!"
  );


  setTimeout(() => {

    if (
      state.quest.current <
      state.quest.total
    ) {

      state.quest.current++;

      state.quest.progress = 0;

      state.quest.completed = false;

      updateQuestUI();

      saveGame();

      startQuestCinematic(
        state.quest.current
      );

    } else {

      showFinalScreen();

    }

  }, 1200);

}


/* =========================================================
   QUEST CINEMATICS
========================================================= */

function startQuestCinematic(number) {

  const quest =
    QUESTS[number];

  if (!quest) return;


  const icons = {
    2: "💞",
    3: "🌉",
    4: "❤️",
    5: "🎙",
    6: "🌙",
    7: "🤝"
  };


  showCinematic(
    icons[number] || "❤️",
    quest.title,
    quest.description
  );

}


/* =========================================================
   CINEMATIC
========================================================= */

function showCinematic(
  icon,
  title,
  text
) {

  if (!cinematicOverlay) return;


  cinematicIcon.textContent =
    icon;

  cinematicTitle.textContent =
    title;

  cinematicText.textContent =
    text;


  cinematicOverlay.classList.remove(
    "hidden"
  );

  cinematicOverlay.classList.add(
    "show"
  );

}


function closeCinematic() {

  cinematicOverlay?.classList.remove(
    "show"
  );

  cinematicOverlay?.classList.add(
    "hidden"
  );

}


/* =========================================================
   OPENING CINEMATIC
========================================================= */

function startOpeningCinematic() {

  setTimeout(() => {

    showCinematic(
      "❤️",
      "Bizning hikoyamiz",
      "03.03.2026 kuni boshlangan hikoya endi yangi dunyoda davom etadi."
    );

  }, 700);

}


/* =========================================================
   VOICE PLACEHOLDER
========================================================= */

function toggleVoice() {

  if (!navigator.mediaDevices) {

    showToast(
      "🎙",
      "Bu qurilma mikrofonni qo‘llab-quvvatlamaydi."
    );

    return;

  }


  if (!state.voiceConnected) {

    requestMicrophone();

  } else {

    stopMicrophone();

  }

}


let localStream = null;


async function requestMicrophone() {

  try {

    localStream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });


    state.voiceConnected = true;

    voiceStatus.textContent =
      "Mikrofon yoqilgan";

    voiceButton.classList.add(
      "active"
    );


    showToast(
      "🎙",
      "Mikrofon yoqildi."
    );


  } catch (error) {

    console.error(error);

    voiceStatus.textContent =
      "Ruxsat berilmadi";

    showToast(
      "🎙",
      "Mikrofon uchun ruxsat bering."
    );

  }

}


function stopMicrophone() {

  if (localStream) {

    localStream
      .getTracks()
      .forEach(
        track => track.stop()
      );

  }


  localStream = null;

  state.voiceConnected = false;

  voiceStatus.textContent =
    "Ulanmagan";

  voiceButton.classList.remove(
    "active"
  );

}


/* =========================================================
   MUSIC
========================================================= */

let audioContext = null;
let ambientOscillator = null;
let musicGain = null;


function toggleMusic() {

  if (!state.audioEnabled) {

    startAmbientAudio();

  } else {

    stopAmbientAudio();

  }

}


function startAmbientAudio() {

  try {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();


    musicGain =
      audioContext.createGain();

    musicGain.gain.value =
      0.025;


    ambientOscillator =
      audioContext.createOscillator();

    ambientOscillator.type =
      "sine";

    ambientOscillator.frequency.value =
      196;


    ambientOscillator.connect(
      musicGain
    );

    musicGain.connect(
      audioContext.destination
    );


    ambientOscillator.start();

    state.audioEnabled = true;

    musicButton.classList.add(
      "active"
    );


    showToast(
      "♪",
      "Romantik atmosfera yoqildi."
    );


  } catch (error) {

    console.error(
      "Audio error:",
      error
    );

  }

}


function stopAmbientAudio() {

  if (ambientOscillator) {

    try {
      ambientOscillator.stop();
    } catch (_) {}

  }


  ambientOscillator = null;

  if (audioContext) {

    audioContext.close();

  }


  audioContext = null;

  state.audioEnabled = false;

  musicButton.classList.remove(
    "active"
  );

}


/* =========================================================
   MAP
========================================================= */

function showMapMessage() {

  showToast(
    "◈",
    "Xarita tizimi keyingi bosqichda ochiladi."
  );

}


/* =========================================================
   SETTINGS
========================================================= */

function showSettingsMessage() {

  showToast(
    "⚙",
    "Sozlamalar tizimi tayyorlanmoqda."
  );

}


/* =========================================================
   INTERACTION HINT
========================================================= */

function showInteractionHint(text) {

  if (!interactionHint) return;

  interactionText.textContent =
    text;

  interactionHint.classList.remove(
    "hidden"
  );

  interactionHint.classList.add(
    "show"
  );

}


function hideInteractionHint() {

  interactionHint?.classList.remove(
    "show"
  );

  interactionHint?.classList.add(
    "hidden"
  );

}


/* =========================================================
   FINAL SCREEN
========================================================= */

function showFinalScreen() {

  if (!finalScreen) return;


  finalScreen.classList.remove(
    "hidden"
  );

  finalScreen.classList.add(
    "show"
  );


  createFinalParticles();

}


function createFinalParticles() {

  for (let i = 0; i < 80; i++) {

    const particle =
      document.createElement("div");

    particle.className =
      "final-particle";

    particle.textContent =
      Math.random() > 0.5
        ? "♥"
        : "✦";

    particle.style.left =
      `${Math.random() * 100}%`;

    particle.style.top =
      `${Math.random() * 100}%`;

    particle.style.animationDelay =
      `${Math.random() * 4}s`;

    finalScreen.appendChild(
      particle
    );

  }

}


/* =========================================================
   SAVE SYSTEM
========================================================= */

function saveGame() {

  state.save.quest =
    state.quest.current;

  state.save.role =
    state.role;

  state.save.completed =
    state.save.completed || [];


  try {

    localStorage.setItem(
      CONFIG.saveKey,
      JSON.stringify(
        state.save
      )
    );

  } catch (error) {

    console.warn(
      "Save failed:",
      error
    );

  }

}


function loadSave() {

  try {

    const raw =
      localStorage.getItem(
        CONFIG.saveKey
      );

    if (!raw) return;

    const data =
      JSON.parse(raw);


    if (data.role) {

      state.role =
        data.role;

    }


    if (
      Number.isInteger(
        data.quest
      ) &&
      data.quest >= 1 &&
      data.quest <= 7
    ) {

      state.quest.current =
        data.quest;

    }


    if (Array.isArray(data.completed)) {

      state.save.completed =
        data.completed;

    }

  } catch (error) {

    console.warn(
      "Save load failed:",
      error
    );

  }

}


/* =========================================================
   GAME LOOP
========================================================= */

function startGameLoop() {

  if (animationFrame) return;


  function loop() {

    animationFrame =
      requestAnimationFrame(loop);


    const delta =
      Math.min(
        clock.getDelta(),
        0.05
      );


    state.worldTime +=
      delta;


    updatePlayer(delta);

    updatePartner(delta);

    updateCamera(delta);

    updateInteraction();

    animateWorld(delta);

    renderer.render(
      scene,
      camera
    );

  }


  loop();

}


/* =========================================================
   WORLD ANIMATION
========================================================= */

function animateWorld(delta) {

  const time =
    state.worldTime;


  flowers.forEach(
    (flower) => {

      flower.mesh.position.y =
        flower.baseY +
        Math.sin(
          time * 1.8 +
          flower.phase
        ) * 0.035;

    }
  );


  fireflies.forEach(
    (fly) => {

      const t =
        time *
        fly.speed +
        fly.phase;


      fly.mesh.position.y +=
        Math.sin(t * 2) *
        delta *
        0.15;


      fly.mesh.position.x +=
        Math.cos(t) *
        delta *
        0.12;


      fly.mesh.position.z +=
        Math.sin(t * 0.7) *
        delta *
        0.12;

    }
  );


  heartObjects.forEach(
    (heart) => {

      heart.group.position.y =
        1.2 +
        Math.sin(
          time * 1.6 +
          heart.phase
        ) * 0.18;

      heart.group.rotation.y =
        time * 0.45;

    }
  );


  lanterns.forEach(
    (light, index) => {

      light.intensity =
        1.3 +
        Math.sin(
          time * 2 +
          index
        ) * 0.25;

    }
  );


  if (waterSurface) {

    waterSurface.material.opacity =
      0.68 +
      Math.sin(time * 1.5) *
      0.06;

  }

}


/* =========================================================
   RESIZE
========================================================= */

function resizeRenderer() {

  if (
    !renderer ||
    !camera ||
    !worldElement
  ) {
    return;
  }


  const width =
    worldElement.clientWidth ||
    window.innerWidth;

  const height =
    worldElement.clientHeight ||
    window.innerHeight;


  renderer.setSize(
    width,
    height,
    false
  );


  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

}


/* =========================================================
   UTILITIES
========================================================= */

function showScreen(element) {

  if (!element) return;

  element.classList.remove(
    "hidden"
  );

  element.classList.add(
    "show"
  );

}


function hideScreen(element) {

  if (!element) return;

  element.classList.remove(
    "show"
  );

  element.classList.add(
    "hidden"
  );

}


function showToast(icon, message) {

  if (!toast) return;

  toastIcon.textContent =
    icon;

  toastText.textContent =
    message;


  toast.classList.remove(
    "hidden"
  );

  toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.timeout
  );


  showToast.timeout =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

      toast.classList.add(
        "hidden"
      );

    }, 3000);

}


function clearCodeMessage() {

  codeMessage?.classList.remove(
    "show"
  );

}


function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


function dampAngle(
  current,
  target,
  speed,
  delta
) {

  let difference =
    target - current;


  while (
    difference > Math.PI
  ) {
    difference -=
      Math.PI * 2;
  }


  while (
    difference < -Math.PI
  ) {
    difference +=
      Math.PI * 2;
  }


  const amount =
    1 -
    Math.exp(
      -speed * delta
    );


  return (
    current +
    difference * amount
  );

}


/* =========================================================
   DEBUG API
========================================================= */

window.AbdulhodiyGame = {

  state,

  completeQuest,

  saveGame,

  showToast,

  getPlayerPosition() {

    return playerGroup
      ? playerGroup.position.clone()
      : null;

  },

  getPartnerPosition() {

    return partnerGroup
      ? partnerGroup.position.clone()
      : null;

  }

};


/* =========================================================
   END
========================================================= */
