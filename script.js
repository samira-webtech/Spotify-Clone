console.log('Project Spotify: JavaScript Loaded');

// Global variables
let currentSong = new Audio();
let songs = [];       
let currentIndex = 0; 

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs() {
    let origin = window.location.origin.includes("http") 
        ? window.location.origin 
        : "http://127.0.0.1:3000";
        
    let songsUrl = `${origin}/songs/`;

    try {
        let response = await fetch(songsUrl);
        if (!response.ok) throw new Error("Could not reach songs directory");

        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let an = div.getElementsByTagName("a");

        let loadedSongs = [];
        for (let i = 0; i < an.length; i++) {
            let href = an[i].getAttribute("href");
            if (href && href.endsWith(".mp3")) {
                let cleanName = decodeURIComponent(href)
                    .split('/')
                    .pop()
                    .replace(".mp3", "");

                loadedSongs.push({
                    url: href.startsWith("http") ? href : encodeURI(`${songsUrl}${href}`),
                    name: cleanName
                });
            }
        }
        
        if (loadedSongs.length > 0) return loadedSongs;
    } catch (err) {
        console.warn("Fetch failed, using static fallback songs list:", err);
    }

    return [
        { name: "After Sunset - Alex Jones _ Xander Jones", url: "songs/After Sunset - Alex Jones _ Xander Jones.mp3" },
        { name: "Fire In The Sky - Alex Jones _ Xander Jones", url: "songs/Fire In The Sky - Alex Jones _ Xander Jones.mp3" },
        { name: "Intergalactic - Alex Jones _ Xander Jones", url: "songs/Intergalactic - Alex Jones _ Xander Jones.mp3" },
        { name: "On The Flip - The Grey Room _ Density & Time", url: "songs/On The Flip - The Grey Room _ Density & Time.mp3" },
        { name: "Stake Out - Alex Jones _ Xander Jones", url: "songs/Stake Out - Alex Jones _ Xander Jones.mp3" }
    ];
}

const playMusic = (track, pause = false) => {
    currentSong.src = track;

    let currentTrackObj = songs.find(song => song.url === track);
    const songNameElement = document.querySelector(".songName");
    if (songNameElement && currentTrackObj) {
        songNameElement.innerHTML = currentTrackObj.name;
    }

    const playImg = document.getElementById("playImg");

    if (!pause) {
        currentSong.play().catch(err => console.log("Playback error:", err));
        if (playImg) playImg.src = "pause.svg";
    } else {
        if (playImg) playImg.src = "play.svg";
    }
}

async function main() {
    songs = await getsongs();
    
    let songUL = document.querySelector(".songList ul");
    if (songUL) {
        songUL.innerHTML = "";

        songs.forEach((song) => {
            songUL.innerHTML += `<li>
                <img class="invert" src="music.svg" alt="music">
                <div class="info">
                    <h3>${song.name}</h3>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="play">
                </div>
            </li>`;
        });

        Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
            li.addEventListener("click", () => {
                currentIndex = index;
                playMusic(songs[currentIndex].url);
            });
        });
    }

    // Update time and seekbar continuously as audio plays
    currentSong.addEventListener("timeupdate", () => {
        const songTime = document.querySelector(".songTime");
        if (songTime) {
            const current = secondsToMinutesSeconds(currentSong.currentTime);
            const duration = secondsToMinutesSeconds(currentSong.duration);
            songTime.innerHTML = `${current} / ${duration}`;
        }

        const circle = document.querySelector(".seekbar .circle");
        const seekbar = document.querySelector(".seekbar");
        
        if (circle && currentSong.duration) {
            let progressPercent = (currentSong.currentTime / currentSong.duration) * 100;
            circle.style.left = `${progressPercent}%`;
            seekbar.style.background = `linear-gradient(to right, #000000 ${progressPercent}%, #c1d0e4 ${progressPercent}%)`;
        }
    });

    // Fully interactive seekbar (Click or Drag anywhere to update position)
    const seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        let isDragging = false;

        const updateSeek = (e) => {
            let rect = seekbar.getBoundingClientRect();
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clickPosition = (clientX - rect.left) / rect.width;
            clickPosition = Math.max(0, Math.min(1, clickPosition));
            
            if (!isNaN(currentSong.duration)) {
                currentSong.currentTime = clickPosition * currentSong.duration;
            }
        };

        seekbar.addEventListener("mousedown", (e) => {
            isDragging = true;
            updateSeek(e);
        });

        window.addEventListener("mousemove", (e) => {
            if (isDragging) {
                updateSeek(e);
            }
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
        });
    }

    // Play/Pause Button Toggle Logic
    const playBtn = document.getElementById("playBtn");
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            const playImg = document.getElementById("playImg");
            
            if (!currentSong.src && songs.length > 0) {
                playMusic(songs[0].url);
                return;
            }

            if (currentSong.paused) {
                currentSong.play().then(() => {
                    if (playImg) playImg.src = "pause.svg";
                }).catch(err => console.log("Playback error:", err));
            } else {
                currentSong.pause();
                if (playImg) playImg.src = "play.svg";
            }
        });
    }

    // Next Control Button
    const nextBtn = document.getElementById("next");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if ((currentIndex + 1) < songs.length) {
                currentIndex++;
                playMusic(songs[currentIndex].url);
            }
        });
    }

    // Previous Control Button
    const prevBtn = document.getElementById("previous");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                playMusic(songs[currentIndex].url);
            }
        });
    }
}

const menuBtn = document.getElementById("menuBtn");
const leftPanel = document.querySelector(".left");
const closeBtn = document.querySelector(".close"); // <-- ADD THIS LINE

if (menuBtn && leftPanel) {
  menuBtn.addEventListener("click", () => {
    leftPanel.classList.toggle("active");
  });
}

if (closeBtn && leftPanel) {
  closeBtn.addEventListener("click", () => {
    leftPanel.classList.remove("active");
  });
}

const volumeSlider = document.querySelector('.range input[type="range"]');

if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });
}

let myCards = document.querySelectorAll(".card");
myCards.forEach(function(onecard){
    onecard.addEventListener("click",function(){

        console.log("you clicked a card")
    })
});
main(); // this now actually gets called







