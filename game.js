window.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progress-bar");
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
        "Bizning dunyomiz tayyorlanmoqda...",
        "Yuraklar bir-birini kutmoqda...",
        "Uchrashuvga oz qoldi..."
    ];

    // 1. Loading simulyatsiyasi
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
            progressBar.style.width = progress + "%";
            if (progress === 40) loadingText.textContent = loadingPhrases[1];
            if (progress === 80) loadingText.textContent = loadingPhrases[2];
        } else {
            clearInterval(interval);
            loadingScreen.classList.add("hidden");
            entryScreen.classList.remove("hidden");
        }
    }, 35);

    // 2. Maxfiy kod tekshiruvi (030326)
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

    // 3. Qahramon tanlash logikasi
    charCards.forEach(card => {
        card.addEventListener("click", () => {
            charCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedCharacter = card.getAttribute("data-char");
            startGameBtn.classList.remove("hidden");
            startGameBtn.removeAttribute("disabled");
        });
    });

    // 4. O‘yinni boshlash va Three.js olamini ishga tushirish
    startGameBtn.addEventListener("click", () => {
        if (!selectedCharacter) return;
        charSelectScreen.classList.add("hidden");
        gameHud.classList.remove("hidden");

        initThreeJS();
    });
});

// Three.js 3D Dunyoni yaratish funksiyasi
function initThreeJS() {
    const container = document.getElementById("canvas-container");

    // Sahna, Kamera va Render
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b061a);
    scene.fog = new THREE.FogExp2(0x0b061a, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Yorug'liklar (Professional Night Garden Lighting)
    const ambientLight = new THREE.AmbientLight(0x2a1b4e, 1.5);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xd1b3ff, 1.2);
    moonLight.position.set(20, 40, 20);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // Romantik Yer (Ground)
    const floorGeo = new THREE.PlaneGeometry(150, 150);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x140c26, 
        roughness: 0.8,
        metalness: 0.2 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Vaqtinchalik vizual element (Player o'rnini ko'rsatuvchi professional shakl - keyinchalik GLB model qo'yiladi)
    const playerGeo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 16);
    const playerMat = new THREE.MeshStandardMaterial({ 
        color: 0xff758c, 
        roughness: 0.3,
        emissive: 0x331018 
    });
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.position.set(0, 1.25, 0);
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Oyna o'lchami o'zgarganda
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Render sikli (Animation Loop)
    function animate() {
        requestAnimationFrame(animate);
        
        // Silliq kamera va obyekt harakati
        playerMesh.rotation.y += 0.005;

        renderer.render(scene, camera);
    }
    animate();
}
