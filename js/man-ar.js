let sceneEl = null,
    targetImage = null,
    arSystem = null,
    mainScreen = null,
    backBtn = null;

const TIMELINE_DETAILS = {
    currentAnimationSeq: 1
};

let AR_READY = false;
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

async function releaseWakeLock() {
    if (wakeLock) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log("Screen Wake Lock released");
        } catch (err) {
            console.error(`Wake Lock Release Error: ${err.message}`);
        }
    }
}

function init() {
    try {
        if (!AR_READY) {
            arSystem.start();
            AR_READY = true;
            sessionStorage.setItem("cameraActive", "true");
            console.log("AR system initialized");
        }

        targetImage.addEventListener("targetFound", () => {
            const aVideo = document.querySelector("#displayVideo");
            const srcId = aVideo.getAttribute("src");
            const video = document.querySelector(srcId);
            if (video) {
                video.play().catch(e => {
                    console.error("Video playback failed:", e);
                    document.getElementById("infoText").innerHTML = "<p>Video playback failed. Please try again.</p>";
                    document.getElementById("infoText").classList.remove("hide");
                });
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
            console.error("MindAR failed to start");
            document.getElementById("deviceError").classList.remove("hide");
        });
    } catch (error) {
        console.error("AR Initialization failed:", error);
        document.getElementById("deviceError").classList.remove("hide");
    }
}

function goBack() {
    try {
        document.querySelectorAll("video").forEach(video => {
            video.pause();
            video.currentTime = 0;
            video.load();
        });

        const aVideo = document.querySelector("#displayVideo");
        if (aVideo) aVideo.setAttribute("visible", "false");

        if (arSystem && arSystem.running) {
            arSystem.stop();
            AR_READY = false;
            sessionStorage.setItem("cameraActive", "false");
        }

        releaseWakeLock();

        mainScreen.classList.remove("hide");
        mainScreen.style.display = "flex";
        backBtn.classList.remove("show");
        
        const btnContainer = document.querySelector("#mainScreen .btn-container");
        if (btnContainer) {
            btnContainer.classList.add("show");
            btnContainer.style.display = "flex";
        }

        document.getElementById("scanText").classList.add("hide");
        document.getElementById("scanning-overlay").classList.add("hidden");
        document.getElementById("infoText").classList.add("hide");
        document.getElementById("deviceError").classList.add("hide");
        document.getElementById("mainScreen1").classList.add("hide");
    } catch (error) {
        console.error("Go back failed:", error);
    }
}

function showMainScreen1() {
    try {
        mainScreen.classList.add("hide");
        mainScreen.style.display = "none";
        
        const mainScreen1 = document.getElementById("mainScreen1");
        mainScreen1.classList.remove("hide");
        mainScreen1.style.display = "flex";
        
        const btnContainer = document.querySelector("#mainScreen1 .btn-container");
        if (btnContainer) {
            btnContainer.classList.add("show");
            btnContainer.style.display = "flex";
        }

        const scanText = document.getElementById("scanText");
        scanText.style.background = "white";
        scanText.classList.remove("hide");
        scanText.style.display = "flex";
        document.getElementById("scanning-overlay").classList.remove("hidden");

        keepScreenAwake();
        init(); // Initialize AR system once

        setTimeout(() => {
            scanText.classList.add("hide");
            scanText.style.display = "none";
            document.getElementById("scanning-overlay").classList.add("hidden");
            backBtn.classList.add("show");
        }, 2000);
    } catch (error) {
        console.error("Show mainScreen1 failed:", error);
        document.getElementById("deviceError").classList.remove("hide");
    }
}

function goToAnimation(animationSeq) {
    try {
        TIMELINE_DETAILS.currentAnimationSeq = Number(animationSeq);

        const videoMap = {
            1: "vid1",
            2: "vid2",
            3: "vid3",
            4: "vid4"
        };

        const selectedVideoId = videoMap[animationSeq];
        const aVideo = document.querySelector("#displayVideo");

        // Stop and reset all videos
        document.querySelectorAll("video").forEach(video => {
            video.pause();
            video.currentTime = 0;
            video.load();
        });

        // Set new video source
        aVideo.setAttribute("src", `#${selectedVideoId}`);

        // Play video if target is already found
        if (arSystem && arSystem.running && targetImage.components['mindar-image-target'].targetFound) {
            const video = document.querySelector(`#${selectedVideoId}`);
            video.play().catch(e => {
                console.error("Video playback failed:", e);
                document.getElementById("infoText").innerHTML = "<p>Video playback failed. Please try again.</p>";
                document.getElementById("infoText").classList.remove("hide");
            });
            aVideo.setAttribute("visible", "true");
        }
    } catch (error) {
        console.error("Go to animation failed:", error);
        document.getElementById("deviceError").classList.remove("hide");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        sceneEl = document.querySelector("a-scene");
        targetImage = document.querySelector("#targetImage");
        mainScreen = document.querySelector("#mainScreen");
        backBtn = document.querySelector("#backBtn");

        sceneEl.addEventListener("loaded", () => {
            arSystem = sceneEl.systems["mindar-image-system"];
            document.querySelector('#mainScreen .btn-container').classList.add('show');
            
            if (!/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
                document.getElementById("deviceError").classList.remove("hide");
            }
        });
    } catch (error) {
        console.error("DOM Content Loaded failed:", error);
    }
});

window.goToAnimation = goToAnimation;
window.goBack = goBack;
window.showMainScreen1 = showMainScreen1;