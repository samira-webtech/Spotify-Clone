console.log("Project Spotify: JavaScript Loaded");

// Global variables
let currentSong = new Audio();
let songs = [];
let currentIndex = 0;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getsongs() {
  let origin = window.location.origin.includes("http")
    ? window.location.origin
    : "http://127.0.0.1:3000";

  let songsUrl = `${origin}/songs/`;

  // One line per song — put a different cover image link for each
  const coverMap = {
    "After Sunset - Alex Jones _ Xander Jones": "after-sunset.jpg",
    "Fire In The Sky - Alex Jones _ Xander Jones": "fireInTheSky.jpg",
    "Intergalactic - Alex Jones _ Xander Jones": "Entergalactic.jpg",
    "On The Flip - The Grey Room _ Density & Time": "OnTheFlip.jpg",
    "Stake Out - Alex Jones _ Xander Jones": "Stake Out.jpg",
  };

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
          .split("/")
          .pop()
          .replace(".mp3", "");

        loadedSongs.push({
          url: href.startsWith("http") ? href : encodeURI(`${songsUrl}${href}`),
          name: cleanName,
          cover: coverMap[cleanName] || "",
        });
      }
    }

    if (loadedSongs.length > 0) return loadedSongs;
  } catch (err) {
    console.warn("Fetch failed, using static fallback songs list:", err);
  }

  return [
    {
      name: "After Sunset - Alex Jones _ Xander Jones",
      url: "songs/After Sunset - Alex Jones _ Xander Jones.mp3",
      cover: coverMap["After Sunset - Alex Jones _ Xander Jones"],
    },
    {
      name: "Fire In The Sky - Alex Jones _ Xander Jones",
      url: "songs/Fire In The Sky - Alex Jones _ Xander Jones.mp3",
      cover: coverMap["Fire In The Sky - Alex Jones _ Xander Jones"],
    },
    {
      name: "Intergalactic - Alex Jones _ Xander Jones",
      url: "songs/Intergalactic - Alex Jones _ Xander Jones.mp3",
      cover: coverMap["Intergalactic - Alex Jones _ Xander Jones"],
    },
    {
      name: "On The Flip - The Grey Room _ Density & Time",
      url: "songs/On The Flip - The Grey Room _ Density & Time.mp3",
      cover: coverMap["On The Flip - The Grey Room _ Density & Time"],
    },
    {
      name: "Stake Out - Alex Jones _ Xander Jones",
      url: "songs/Stake Out - Alex Jones _ Xander Jones.mp3",
      cover: coverMap["Stake Out - Alex Jones _ Xander Jones"],
    },
  ];
}

const playMusic = (track, pause = false) => {
  currentSong.src = track;

  let currentTrackObj = songs.find((song) => song.url === track);
  const songNameElement = document.querySelector(".songName");
  if (songNameElement && currentTrackObj) {
    songNameElement.innerHTML = currentTrackObj.name;
  }

  const playImg = document.getElementById("playImg");

  if (!pause) {
    currentSong.play().catch((err) => console.log("Playback error:", err));
    if (playImg) playImg.src = "pause.svg";
  } else {
    if (playImg) playImg.src = "play.svg";
  }
};

// Builds one .card per song inside .card-container, and wires each card to play its song
function renderCards() {
  let cardContainer = document.querySelector(".card-container");
  if (!cardContainer) return;

  cardContainer.innerHTML = "";

  songs.forEach((song) => {
    cardContainer.innerHTML += `<div class="card">
      <div class="playbutton">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="60" height="60">
          <circle cx="12" cy="12" r="12" fill="#1db954" />
          <g transform="scale(0.74) translate(4  4)">
            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="black" />
          </g>
        </svg>
      </div>
      <img src="${song.cover || 'music.svg'}" alt="Song Cover">
      <h3>${song.name}</h3>
    </div>`;
  });

  Array.from(cardContainer.getElementsByClassName("card")).forEach((card, index) => {
    card.addEventListener("click", () => {
      currentIndex = index;
      playMusic(songs[currentIndex].url);
    });
  });
}

async function main() {
  songs = await getsongs();

  renderCards();

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
      let progressPercent =
        (currentSong.currentTime / currentSong.duration) * 100;
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
        currentSong
          .play()
          .then(() => {
            if (playImg) playImg.src = "pause.svg";
          })
          .catch((err) => console.log("Playback error:", err));
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
      if (currentIndex + 1 < songs.length) {
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

// Sidebar menu (hamburger + close button)
const menuBtn = document.getElementById("menuBtn");
const leftPanel = document.querySelector(".left");
const closeBtn = document.querySelector(".close");

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

// Volume slider
const volumeSlider = document.querySelector('.range input[type="range"]');

if (volumeSlider) {
  volumeSlider.addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });
}

main();