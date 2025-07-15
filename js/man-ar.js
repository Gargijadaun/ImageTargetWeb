let sceneEl = null,
    targetImage = null,
    arSystem = null;

let AR_READY = false;

const TIMELINE_DETAILS = {
    currentAnimationSeq: 1
};

// DOM Elements
const mainScreen = document.querySelector('#mainScreen');
const backBtn = document.querySelector('#backBtn');
const replayButton = document.querySelector('#replayButton');

let wakeLock = null;

// ✅ Keep Screen Awake
async function keepScreenAwake() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Screen Wake Lock is active");
        } else {
            console.warn("Wake Lock API not supported");
        }
    } catch (err) {
        console.error(`Wake Lock Error: ${err.message}`);
    }
}

// ✅ Initialize AR and set up video logic
function init() {
    mainScreen.classList.add('hide');
    // backBtn.classList.add('show');
    document.querySelector('#mainScreen .btn-container').classList.remove('show');

    if (!AR_READY) {
        arSystem.start();
        AR_READY = true;
    } else {
        arSystem.unpause();
    }

    // 📌 Target Found
    targetImage.addEventListener("targetFound", () => {
        const mainVideoEl = document.querySelector("#mainVideo");
        const aVideo = document.querySelector("#displayVideo");

        if (mainVideoEl) {
            mainVideoEl.play().catch(err => console.warn("Autoplay blocked", err));
        }
        if (aVideo) {
            aVideo.setAttribute("visible", "true");
        }
    });

    // 📌 Target Lost
    targetImage.addEventListener("targetLost", () => {
        const mainVideoEl = document.querySelector("#mainVideo");
        const aVideo = document.querySelector("#displayVideo");

        if (mainVideoEl) {
            mainVideoEl.pause();
        }
        if (aVideo) {
            aVideo.setAttribute("visible", "false");
        }
    });

    sceneEl.addEventListener("arError", () => {
        console.log("MindAR failed to start");
    });
}

// ✅ Go Back Button Handler - Cleanly exits AR view and resets everything
function goBack() {
    // Hide the AR video screen and deactivate it
    const videoScreen = document.getElementById("videoScreen");
    videoScreen.style.display = "none";
    videoScreen.classList.remove("active");

    // Show the main screen
    const mainScreen = document.getElementById("mainScreen");
    mainScreen.style.display = "flex";
    mainScreen.classList.add("active");
    mainScreen.classList.remove("hide");

    // Pause and reset all video elements
    document.querySelectorAll("video").forEach(video => {
        video.pause();
        video.currentTime = 0;
    });

    // Hide custom button container used in AR
    const btnContainer1 = document.querySelector(".btn-container1");
    if (btnContainer1) {
        btnContainer1.classList.add("hide");
        btnContainer1.classList.remove("show");
        btnContainer1.style.display = "none";
    }

    // Hide A-Frame video plane (if present)
    const aVideo = document.querySelector("#displayVideo");
    if (aVideo) {
        aVideo.setAttribute("visible", "false");
    }

    // Stop AR system cleanly
    if (typeof arSystem !== "undefined" && arSystem.running) {
        arSystem.stop();
        sessionStorage.setItem("cameraActive", "false");
    }

    // Hide back button
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.classList.add("hide");
        backBtn.classList.remove("show");
    }

    // Show main screen button container
    const btnContainer = document.querySelector("#mainScreen .btn-container");
    if (btnContainer) {
        btnContainer.classList.add("show");
        btnContainer.classList.remove("hide");
        btnContainer.style.display = "flex";
    }

    // Hide scan text and scanning overlay
    const scanText = document.getElementById("scanText");
    if (scanText) scanText.style.display = "none";

    const scanningOverlay = document.getElementById("scanning-overlay");
    if (scanningOverlay) scanningOverlay.classList.add("hidden");

    // Optional: Turn off AR camera (A-Frame specific)
    const arCamera = document.querySelector("a-camera");
    if (arCamera) {
        arCamera.setAttribute("active", false);
    }

    // Optional: Stop the A-Frame scene rendering (if needed)
    const scene = document.querySelector("a-scene");
    if (scene && scene.renderer) {
        scene.pause();
    }

    // Reset orientation or layout
    checkOrientation();
}


// ✅ Go to Animation with Default Video Load
function goToAnimation() {
    keepScreenAwake();

    if (mainScreen) mainScreen.style.display = "none";

    const btnContainer = mainScreen.querySelector(".btn-container");
    if (btnContainer) {
        btnContainer.classList.add("hide");
        btnContainer.classList.remove("show");
        btnContainer.style.display = "none";
    }

    const btnContainer1 = document.querySelector(".btn-container1");
    if (btnContainer1) {
        btnContainer1.classList.remove("hide");
        btnContainer1.classList.add("show");
        btnContainer1.style.display = "flex";
    }

    const scanText = document.getElementById("scanText");
    if (scanText) scanText.style.display = "none";

    if (arSystem && arSystem.running) arSystem.stop();

    changeVideoSource("assets/video/Test-01.mp4");
    init();

    sessionStorage.setItem("cameraActive", "true");
}

// ✅ Change Video Path Dynamically
function changeVideo(videoPath) {
    changeVideoSource(videoPath);
}

// ✅ Core Function to Change and Reload Video Source
function changeVideoSource(videoPath) {
    const mainVideoEl = document.querySelector('#mainVideo');
    const aVideo = document.querySelector('#displayVideo');

    if (!mainVideoEl || !aVideo) return;

    mainVideoEl.pause();
    mainVideoEl.setAttribute("src", videoPath);
    mainVideoEl.load();

    aVideo.setAttribute("src", "#mainVideo");
    aVideo.setAttribute("visible", "false");

    // Auto-play if target is already visible
    if (targetImage && targetImage.object3D.visible) {
        mainVideoEl.play().catch(e => console.warn("Autoplay blocked", e));
        aVideo.setAttribute("visible", "true");
    }
}

// ✅ DOM Ready Setup
document.addEventListener("DOMContentLoaded", () => {
    sceneEl = document.querySelector("a-scene");
    targetImage = document.querySelector("#targetImage");

    sceneEl.addEventListener("loaded", () => {
        arSystem = sceneEl.systems["mindar-image-system"];
        document.querySelector('#mainScreen .btn-container').classList.add('show');
    });
});
// function continueWithoutAR() {
//     window.location.href = "video.html"; // Replace with your actual file name
// }

// ✅ Global Access
window.goToAnimation = goToAnimation;
window.goBack = goBack;
window.changeVideo = changeVideo;
