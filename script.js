console.log('Project Spotify: JavaScript Loaded');

// Global variables
let currentSong = new Audio();
let songs = [];       // Holds our list of songs
let currentIndex = 0; // Tracks which song number is playing

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getsongs() {
    // Detect the current host port dynamically or default to 3000
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

    // FALLBACK: Hardcoded song list matching your HTML folder structure
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
    if (!pause) {
        currentSong.play().catch(err => console.log("Playback error:", err));
        const playImg = document.querySelector("#playBtn img");
        if (playImg) playImg.src = "pause.svg";
    }
}






async function main() {
    // Load songs
    songs = await getsongs();
    
    let songUL = document.querySelector(".songList ul");
    if (songUL) {
        songUL.innerHTML = "";

        // Populate Library List
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

        // Add Click Handlers for Playlist Items
        Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
            li.addEventListener("click", () => {
                currentIndex = index;
                console.log("Playing:", songs[currentIndex].name);
                playMusic(songs[currentIndex].url);
            });
        });
    }


// Update time continuously as audio plays
    // currentSong.addEventListener("timeupdate", () => {
    //     const songTime = document.querySelector(".songtime");
    //     if (songTime) {
    //         const current = secondsToMinutesSeconds(currentSong.currentTime);
    //         const duration = secondsToMinutesSeconds(currentSong.duration);
    //         songTime.innerHTML = `${current} / ${duration}`;
    //     }
    // });









    // Play/Pause Control Button
    const playBtn = document.getElementById("playBtn");
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (currentSong.paused) {
                if (!currentSong.src && songs.length > 0) {
                    playMusic(songs[0].url);
                }
                
                else {
                    currentSong.play();
                }
                const img = playBtn.querySelector("img");
                if (img) img.src = "pause.svg";
            } else {
                currentSong.pause();
                const img = playBtn.querySelector("img");
                if (img) img.src = "play.svg";
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

main();