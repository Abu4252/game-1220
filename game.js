window.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progress-bar");
    const progressPercent = document.getElementById("progress-percent");
    const loadingText = document.getElementById("loading-text");
    const loadingScreen = document.getElementById("loading-screen");
    const entryScreen = document.getElementById("entry-screen");
    const charSelectScreen = document.getElementById("char-select-screen");
    const gameHud = document.getElementById("game-hud");
    
    const secretInput = document.getElementById("secret-code-input");
    const enterBtn = document.getElementById("enter-btn");
    const errorMsg = document.getElementById("error-msg");

    const charCards = document.querySelectorAll(".char-card");
    const startGameBtn = document.getElementById("start-game-btn");

    let selectedCharacter = null;
    const loadingPhrases = [
        "Professional 3D olam yaratilmoqda...",
        "Romantik bog' va yulduzlar yuklanmoqda...",
        "Qahramonlar tayyorlanmoqda..."
    ];

    // Mukammal silliq yuklanish jarayoni
    let progress = 0;
    const interval = setInterval(() => {
        progress += 3;
        if (progress <= 100) {
            progressBar.style.width = progress + "%";
            progressPercent.textContent = progress + "%";
            if (progress === 35) loadingText.textContent = loadingPhrases[1];
            if (progress === 75) loadingText.textContent = loadingPhrases[2];
        } else {
            clearInterval(interval);
            loadingScreen.classList.add("hidden");
            entryScreen.classList.remove("hidden");
        }
    }, 25);

    // Maxfiy kod tekshiruvi
    enterBtn.addEventListener("click", () => {
        if (secretInput.value.trim() === "030326") {
            errorMsg.style.display = "none";
            entryScreen.classList.add("hidden");
            charSelectScreen.classList.remove("hidden");
        } else {
            errorMsg.style.display = "block";
            secretInput.value = "";
        }
    });

    secretInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") enterBtn.click();
    });

    // Qahramon tanlash
    charCards.forEach(card => {
        card.addEventListener("click", () => {
            charCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedCharacter = card.getAttribute("data-char");
            startGameBtn.classList.remove("hidden");
            startGameBtn.removeAttribute("disabled");
        });
    });

    // O'yinni boshlash
    startGameBtn.addEventListener("click", () => {
        if (!selectedCharacter) return;
        charSelectScreen.classList.add("hidden");
        gameHud.classList.remove("hidden");

        // Hakamlarni lol qoldiruvchi efir (konfeti portlashi)
        if (typeof confetti === "function") {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
            });
        }

        initProfessional3DWorld();
    });
});

// Professional Three.js Dunyosi
function initProfessional3DWorld() {
    const container = document.getElementById("canvas-container");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05020c);
    scene.fog = new THREE.FogExp2(0x05020c, 0.025);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Professional Yorug'liklar
    const ambientLight = new THREE.AmbientLight(0x2a1b4e, 1.8);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xffb7c5, 1.5);
    moonLight.position.set(30, 50, 30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    scene.add(moonLight);

    // Romantik Yer (Night Garden Floor)
    const floorGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x0e071d, 
        roughness: 0.85,
        metalness: 0.15 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Stone path (Yo'lakcha)
    const pathGeo = new THREE.PlaneGeometry(6, 120);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x1d1135, roughness: 0.6 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.01;
    path.receiveShadow = true;
    scene.add(path);

    // Favvora (Centerpiece Fountain)
    const fountainBaseGeo = new THREE.CylinderGeometry(3, 3.5, 0.8, 32);
    const fountainMat = new THREE.MeshStandardMaterial({ color: 0x2b194d, roughness: 0.4 });
    const fountainBase = new THREE.Mesh(fountainBaseGeo, fountainMat);
    fountainBase.position.set(0, 0.4, -15);
    fountainBase.castShadow = true;
    fountainBase.receiveShadow = true;
    scene.add(fountainBase);

    const fountainCenterGeo = new THREE.CylinderGeometry(0.8, 1, 3, 16);
    const fountainCenter = new THREE.Mesh(fountainCenterGeo, fountainMat);
    fountainCenter.position.set(0, 2, -15);
    fountainCenter.castShadow = true;
    scene.add(fountainCenter);

    // Qahramon Vizual Modeli (Professional Styled Avatar)
    const charGroup = new THREE.Group();

    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.4, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0xff758c, 
        roughness: 0.3, 
        emissive: 0x220b12 
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    body.castShadow = true;
    charGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd1dc, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.3;
    head.castShadow = true;
    charGroup.add(head);

    scene.add(charGroup);

    // Atrofga miltillovchi yulduzlar va zarrachalar (Fireflies / Particles)
    const particleCount = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 100;
        particlePositions[i + 1] = Math.random() * 20;
        particlePositions[i + 2] = (Math.random() - 0.5) * 100;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0xffb7c5,
        size: 0.25,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Responsive Oyna o'lchami
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Render va Animatsiya Sirti
    let clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);

        let elapsedTime = clock.getElapsedTime();

        // Qahramonning jonli nafas olish animatsiyasi
        charGroup.position.y = Math.sin(elapsedTime * 3) * 0.05;
        charGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;

        // Zarrachalar harakati
        const positions = particleGeo.attributes.position.array;
        for (let i = 1; i < particleCount * 3; i += 3) {
            positions[i] -= 0.02;
            if (positions[i] < 0) positions[i] = 20;
        }
        particleGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }
    animate();
}
