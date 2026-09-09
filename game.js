// Loading va Entry screen logikasi
window.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progress-bar");
    const loadingText = document.getElementById("loading-text");
    const loadingScreen = document.getElementById("loading-screen");
    const entryScreen = document.getElementById("entry-screen");
    
    const secretInput = document.getElementById("secret-code-input");
    const enterBtn = document.getElementById("enter-btn");
    const errorMsg = document.getElementById("error-msg");

    const loadingPhrases = [
        "Bizning dunyomiz tayyorlanmoqda...",
        "Yuraklar bir-birini kutmoqda...",
        "Uchrashuvga oz qoldi..."
    ];

    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
            progressBar.style.width = progress + "%";
            if (progress === 40) loadingText.textContent = loadingPhrases[1];
            if (progress === 80) loadingText.textContent = loadingPhrases[2];
        } else {
            clearInterval(interval);
            // Loading tugagach, uni yashirib Entry screen'ni chiqaramiz
            loadingScreen.classList.add("hidden");
            entryScreen.classList.remove("hidden");
        }
    }, 40);

    // Maxfiy kod tekshiruvi (To'g'ri kod: 030326)
    enterBtn.addEventListener("click", () => {
        const enteredCode = secretInput.value.trim();
        if (enteredCode === "030326") {
            errorMsg.style.display = "none";
            alert("Xush kelibsiz! Kod muvaffaqiyatli tasdiqlandi ❤️");
            // Keyingi fazalarda bu yerda character tanlash oynasi ochiladi
        } else {
            errorMsg.style.display = "block";
            secretInput.value = "";
        }
    });

    // Enter tugmasi bosilganda ham ishlaydigan qilish
    secretInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            enterBtn.click();
        }
    });
});
