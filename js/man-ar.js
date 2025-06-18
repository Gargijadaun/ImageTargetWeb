let sceneEl = null,
    targetImage = null,
    arSystem = null;

const TIMELINE_DETAILS = {
    currentAnimationSeq: 1
};

let AR_READY = false;

// DOM Elements
const mainScreen = document.querySelector('#mainScreen');
const backBtn = document.querySelector('#backBtn');
const replayButton = document.querySelector('#replayButton');

// Wake Lock
let wakeLock = null;
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

function init() {
    mainScreen.classList.add('hide');
    backBtn.classList.add('show');
    document.querySelector('#mainScreen .btn-container').classList.remove('show');

    if (!AR_READY) {
        arSystem.start();
        AR_READY = true;
    } else {
        arSystem.unpause();
    }

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

    targetImage.addEventListener("targetLost", () => {
        const aVideo = document.querySelector("#displayVideo");
        const srcId = aVideo.getAttribute("src");
        const video = document.querySelector(srcId);
        if (video) {
            video.pause();
            aVideo.setAttribute("visible", "false");
        }
    });

    sceneEl.addEventListener("arError", () => {
        console.log("MindAR failed to start");
    });
}

function goBack() {
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

function goToAnimation() {
    keepScreenAwake();

    // Hide the welcome screen
    if (mainScreen) mainScreen.style.display = "none";

    // Hide inner btn container in mainScreen (if any)
    const btnContainer = mainScreen.querySelector(".btn-container");
    if (btnContainer) {
        btnContainer.classList.add("hide");
        btnContainer.classList.remove("show");
        btnContainer.style.display = "none";
    }

    // Show video selection button container
    const btnContainer1 = document.querySelector(".btn-container1");
    if (btnContainer1) {
        btnContainer1.classList.remove("hide");
        btnContainer1.classList.add("show");
        btnContainer1.style.display = "flex";
    }

    // Hide scan text if shown
    const scanText = document.getElementById("scanText");
    if (scanText) scanText.style.display = "none";

    // Stop AR system if running
    if (arSystem && arSystem.running) arSystem.stop();

    // Load default video
    changeVideoSource("assets/video/Test-01.mp4");

    // Re-initialize AR system
    init();
    sessionStorage.setItem("cameraActive", "true");
}

function changeVideo(videoPath) {
    changeVideoSource(videoPath);
}

function changeVideoSource(videoPath) {
    const mainVideoEl = document.querySelector('#mainVideo');
    const aVideo = document.querySelector('#displayVideo');

    if (!mainVideoEl || !aVideo) return;

    // Pause the current video
    mainVideoEl.pause();
    mainVideoEl.setAttribute("src", videoPath);
    mainVideoEl.load();

    // Rebind a-video texture to this same video
    aVideo.setAttribute("src", "#mainVideo");

    // Ensure visibility is off (it will be turned on in targetFound)
    aVideo.setAttribute("visible", "false");

    // Optional: Autoplay if target is visible already
    if (targetImage.object3D.visible) {
        mainVideoEl.play();
        aVideo.setAttribute("visible", "true");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    sceneEl = document.querySelector("a-scene");
    targetImage = document.querySelector("#targetImage");

    sceneEl.addEventListener("loaded", () => {
        arSystem = sceneEl.systems["mindar-image-system"];
        document.querySelector('#mainScreen .btn-container').classList.add('show');
    });
});

window.goToAnimation = goToAnimation;
window.goBack = goBack;
window.changeVideo = changeVideo;
