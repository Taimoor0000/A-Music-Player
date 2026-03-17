const songs = [
  { title: "Acoustic Breeze", artist: "Benjamin Tissot", category: "Instrumental", src: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3" },
  { title: "Creative Minds", artist: "Benjamin Tissot", category: "Corporate", src: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3" },
  { title: "Sunny", artist: "Benjamin Tissot", category: "Pop", src: "https://www.bensound.com/bensound-music/bensound-sunny.mp3" },
  { title: "Energy", artist: "Benjamin Tissot", category: "Workout", src: "https://www.bensound.com/bensound-music/bensound-energy.mp3" }
];

const audioPlayer = document.getElementById("audioPlayer");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songCategory = document.getElementById("songCategory");
const playlistEl = document.getElementById("playlist");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const prevBtn = document.getElementById("prevBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeRange = document.getElementById("volumeRange");

const nowPlayingBox = document.querySelector(".now-playing");

// Inject progress UI (no HTML rewrite needed)
const progressWrap = document.createElement("div");
progressWrap.className = "progress-wrap";
progressWrap.innerHTML = `
  <input type="range" id="progressBar" min="0" max="100" value="0">
  <div class="time-row">
    <span id="currentTime">0:00</span>
    <span id="duration">0:00</span>
  </div>
`;
nowPlayingBox.appendChild(progressWrap);

const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

let currentIndex = 0;
let filteredSongs = [...songs];
let isPlaying = false;

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function initCategories() {
  const categories = [...new Set(songs.map(s => s.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function renderPlaylist() {
  playlistEl.innerHTML = "";

  filteredSongs.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "song-item";
    if (filteredSongs[index].src === filteredSongs[currentIndex]?.src) li.classList.add("active");
    li.innerHTML = `<strong>${song.title}</strong><br><small>${song.artist} • ${song.category}</small>`;
    li.addEventListener("click", () => {
      currentIndex = index;
      loadSong(currentIndex);
      playSong();
      renderPlaylist();
    });
    playlistEl.appendChild(li);
  });

  if (filteredSongs.length === 0) {
    playlistEl.innerHTML = `<li class="song-item">No songs found</li>`;
  }
}

function loadSong(index) {
  if (!filteredSongs[index]) return;
  const song = filteredSongs[index];
  audioPlayer.src = song.src;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  songCategory.textContent = `Category: ${song.category}`;
  progressBar.value = 0;
  currentTimeEl.textContent = "0:00";
}

function playSong() {
  if (!audioPlayer.src) return;
  audioPlayer.play();
  isPlaying = true;
  playPauseBtn.textContent = "⏸ Pause";
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playPauseBtn.textContent = "▶ Play";
}

function nextSong() {
  if (!filteredSongs.length) return;
  currentIndex = (currentIndex + 1) % filteredSongs.length;
  loadSong(currentIndex);
  playSong();
  renderPlaylist();
}

function prevSong() {
  if (!filteredSongs.length) return;
  currentIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
  loadSong(currentIndex);
  playSong();
  renderPlaylist();
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();
  const cat = categoryFilter.value;

  filteredSongs = songs.filter(song => {
    const m1 = song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
    const m2 = cat === "All" || song.category === cat;
    return m1 && m2;
  });

  currentIndex = 0;
  if (filteredSongs.length > 0) {
    loadSong(currentIndex);
  } else {
    audioPlayer.src = "";
    songTitle.textContent = "No song selected";
    songArtist.textContent = "-";
    songCategory.textContent = "Category: -";
    pauseSong();
  }
  renderPlaylist();
}

playPauseBtn.addEventListener("click", () => {
  if (!audioPlayer.src && filteredSongs.length) loadSong(currentIndex);
  isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

volumeRange.addEventListener("input", () => {
  audioPlayer.volume = volumeRange.value;
});

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

audioPlayer.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", () => {
  if (!audioPlayer.duration) return;
  const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = pct;
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

progressBar.addEventListener("input", () => {
  if (!audioPlayer.duration) return;
  audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
});

audioPlayer.addEventListener("ended", nextSong);

// Init
initCategories();
loadSong(currentIndex);
audioPlayer.volume = volumeRange.value;
renderPlaylist();