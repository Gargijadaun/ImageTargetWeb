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

// ✅ Go Back Button Handler
function goBack() {
      document.querySelector(".back-btn").style.display = "none";
       document.getElementById("videoScreen").style.display = "none";
      document.getElementById("videoScreen").classList.remove("active");
      document.getElementById("mainScreen").style.display = "block";
      document.getElementById("mainScreen").classList.add("active");
      checkOrientation();
    document.querySelectorAll("video").forEach(video => {
        video.pause();
        video.currentTime = 0;
    });

    const btnContainer1 = document.querySelector(".btn-container1");
    btnContainer1.classList.add("hide");
    btnContainer1.classList.remove("show");
    btnContainer1.style.display = "none";

    const aVideo = document.querySelector("#displayVideo");
    if (aVideo) aVideo.setAttribute("visible", "false");

    if (arSystem && arSystem.running) {
        arSystem.stop();
        sessionStorage.setItem("cameraActive", "false");
    }

    mainScreen.classList.remove("hide");
    mainScreen.style.display = "flex";

    backBtn.classList.add("hide");
    backBtn.classList.remove("show");

    const btnContainer = document.querySelector("#mainScreen .btn-container");
    if (btnContainer) {
        btnContainer.classList.add("show");
        btnContainer.classList.remove("hide");
        btnContainer.style.display = "flex";
    }

    document.getElementById("scanText").style.display = "none";
    document.getElementById("scanning-overlay").classList.add("hidden");
    
}

// ✅ Go to Animation with Default Video Load
function goToAnimation() {
    keepScreenAwake();
  document.querySelector(".back-btn").style.display = "block";
  document.querySelector(".back-btn1").style.display = "block";
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
