let sceneEl = null,
    targetImage = null,
    arSystem = null;

const TIMELINE_DETAILS = {
    currentAnimationSeq: 1
};

let AR_READY = false;

// DOM elements
const mainScreen = document.querySelector('#mainScreen');
const backBtn = document.querySelector('#backBtn');

// Wake lock for mobile
let wakeLock = null;
async function keepScreenAwake() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Screen Wake Lock is active");
        }
    } catch (err) {
        console.error(`Wake Lock Error: ${err.message}`);
    }
}

// ✅ Initialize AR
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

    // Optional: add listeners once
    targetImage.addEventListener("targetLost", () => {
        const aVideo = document.querySelector("#displayVideo");
        const srcId = aVideo.getAttribute("src");
        const video = document.querySelector(srcId);
        video.pause();
        aVideo.setAttribute("visible", "false");
    });

    sceneEl.addEventListener("arError", () => {
        console.log("MindAR failed to start");
    });
}

// ✅ Go to specific AR animation (video)
function goToAnimation(animationSeq) {
    keepScreenAwake();
    document.getElementById("mainScreen").style.display = "none";

    const scanText = document.getElementById("scanText");
    scanText.style.background = "white";
    scanText.style.display = "flex";

    TIMELINE_DETAILS.currentAnimationSeq = Number(animationSeq);

    const videoMap = {
        1: "vid1",
        2: "vid2",
        3: "vid3",
        4: "vid4"
    };

    const selectedVideoId = videoMap[animationSeq];
    const aVideo = document.querySelector("#displayVideo");
    const selectedVideo = document.querySelector(`#${selectedVideoId}`);

    // Pause and reset all videos
    document.querySelectorAll("video").forEach(video => {
        video.pause();
        video.currentTime = 0;
    });

    // Set video source and hide until marker found
    aVideo.setAttribute("visible", "false");
    aVideo.setAttribute("src", `#${selectedVideoId}`);

    if (arSystem && arSystem.running) arSystem.stop();

    setTimeout(() => {
        scanText.style.display = "none";
        init(); // start or unpause AR

        sessionStorage.setItem("cameraActive", "true");

        if (targetImage.components["mindar-image-target"]?.markerVisible) {
            selectedVideo.play();
            aVideo.setAttribute("visible", "true");
        }
    }, 2000);
}

// ✅ Go back to main screen
function goBack() {
    if (arSystem && arSystem.running) {
        arSystem.stop();
        sessionStorage.setItem("cameraActive", "false");
    }

    document.querySelectorAll("video").forEach(video => {
        video.pause();
        video.currentTime = 0;
    });

    const aVideo = document.querySelector("#displayVideo");
    if (aVideo) aVideo.setAttribute("visible", "false");

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

// ✅ On page load
document.addEventListener("DOMContentLoaded", () => {
    sceneEl = document.querySelector("a-scene");
    targetImage = document.querySelector("#targetImage");

    sceneEl.addEventListener("loaded", () => {
        arSystem = sceneEl.systems["mindar-image-system"]; // ✅ Assign only after scene is fully loaded
        console.log("✅ A-Frame scene loaded, AR system ready");

        const aVideo = document.querySelector("#displayVideo");

        targetImage.addEventListener("targetFound", () => {
            const srcId = aVideo.getAttribute("src");
            const video = document.querySelector(srcId);
            video.play();
            aVideo.setAttribute("visible", "true");
        });

        targetImage.addEventListener("targetLost", () => {
            const srcId = aVideo.getAttribute("src");
            const video = document.querySelector(srcId);
            video.pause();
            aVideo.setAttribute("visible", "false");
        });

        document.querySelector('#mainScreen .btn-container').classList.add('show');
    });
});


// ✅ Expose functions to global scope
window.goToAnimation = goToAnimation;
window.goBack = goBack;
