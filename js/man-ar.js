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
        const aVideo = document.querySelector("#displayVideo");
        const srcId = aVideo.getAttribute("src");
        const video = document.querySelector(srcId);
        if (video) {
            video.play();
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
          btnContainer1.style.display = "flex";
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

function goToAnimation(animationSeq) {
    keepScreenAwake();
    document.getElementById("mainScreen").style.display = "none";

    const btnContainer = document.querySelector("#mainScreen .btn-container");
    if (btnContainer) {
        btnContainer.classList.add("hide");
        btnContainer.classList.remove("show");
        btnContainer.style.display = "flex";
    }

    const btnContainer1 = document.querySelector(".btn-container1");
    btnContainer1.classList.add("show");
    btnContainer1.classList.remove("hide");
    btnContainer1.style.display = "flex";

    TIMELINE_DETAILS.currentAnimationSeq = Number(animationSeq);

    const videoMap = {
        1: "assets/video/Test-01.mp4",
        2: "assets/video/Video2.mp4",
        3: "assets/video/Video3.mp4",
        4: "assets/video/Video4.mp4"
    };

    const selectedVideoSrc = videoMap[animationSeq];

    if (arSystem && arSystem.running) arSystem.stop();

    scanText.style.display = "none";
    
    // ✅ Call the new function to switch the video
    changeVideoSource(selectedVideoSrc);

    init();
    sessionStorage.setItem("cameraActive", "true");
}

function changeVideoSource(videoPath) {
    const mainVideoEl = document.querySelector('#mainVideo');
    const aVideo = document.querySelector('#displayVideo');

    // Stop and reset video
    mainVideoEl.pause();
    mainVideoEl.currentTime = 0;

    // Change the video source
    mainVideoEl.src = videoPath;
    mainVideoEl.load();

    // Reassign source to a-video (in case it's already playing something)
    aVideo.setAttribute("visible", "false");
    aVideo.setAttribute("src", "#mainVideo");
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
