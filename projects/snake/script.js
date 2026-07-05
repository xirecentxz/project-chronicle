// ==========================================================
// 1. SETUP DASAR: Canvas, Grid, dan Elemen DOM
// ==========================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ukuran grid (jumlah kotak per baris/kolom). Canvas akan dibagi
// menjadi grid GRID_SIZE x GRID_SIZE agar ular bergerak per-kotak.
const GRID_SIZE = 20;
let cellSize = 0; // dihitung otomatis berdasarkan ukuran canvas (responsif)

// Elemen DOM untuk HUD & layar
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const currentLevelEl = document.getElementById('currentLevel');
const levelBox = document.getElementById('levelBox');
const levelUpFlash = document.getElementById('levelUpFlash');

const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const newRecordText = document.getElementById('newRecordText');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const dpad = document.getElementById('dpad');

// ==========================================================
// 2. STATE PERMAINAN (variabel yang berubah selama game)
// ==========================================================
let snake = [];          // array segmen ular, tiap segmen {x, y} dalam satuan grid
let direction = { x: 1, y: 0 };   // arah gerak saat ini
let nextDirection = { x: 1, y: 0 }; // arah yang di-input pemain (dibuffer agar tidak bug saat ganti arah cepat)
let food = { x: 0, y: 0 };
let score = 0;
let level = 1;
let highScore = 0;

let gameLoopId = null;   // menyimpan reference setTimeout agar bisa dihentikan
let isGameOver = false;
let isRunning = false;

// Kecepatan game: semakin kecil interval (ms), semakin cepat ular bergerak.
const BASE_SPEED = 160;      // kecepatan awal (ms per langkah)
const SPEED_STEP = 12;       // pengurangan interval setiap naik level
const MIN_SPEED = 60;        // batas kecepatan maksimum agar tidak terlalu ekstrem
const FOODS_PER_LEVEL = 5;   // setiap 5 makanan, level naik 1

// ==========================================================
// 3. LOCALSTORAGE: High Score
// ==========================================================
function loadHighScore() {
  const saved = localStorage.getItem('neonSnakeHighScore');
  highScore = saved ? parseInt(saved, 10) : 0;
  highScoreEl.textContent = highScore;
}

function saveHighScoreIfNeeded() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('neonSnakeHighScore', highScore.toString());
    highScoreEl.textContent = highScore;
    return true; // menandakan rekor baru
  }
  return false;
}

// ==========================================================
// 4. RESPONSIVE CANVAS
// Canvas dibuat persegi (aspect-ratio 1:1 diatur via CSS),
// di sini kita samakan resolusi internal canvas dengan ukuran
// tampilnya di layar agar tetap tajam di berbagai ukuran layar.
// ==========================================================
function resizeCanvas() {
  const size = canvas.clientWidth; // ukuran tampil (px) hasil CSS
  canvas.width = size;
  canvas.height = size;
  cellSize = size / GRID_SIZE;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (!isRunning) drawIdleFrame();
});

// ==========================================================
// 5. INISIALISASI / RESET GAME
// ==========================================================
function initGame() {
  resizeCanvas();

  // Ular mulai di tengah grid, panjang 3 segmen menghadap kanan
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
    { x: startX - 3, y: startY },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  isGameOver = false;

  currentScoreEl.textContent = score;
  currentLevelEl.textContent = level;

  placeFood();
}

// ==========================================================
// 6. PENEMPATAN MAKANAN (memastikan tidak muncul di badan ular)
// ==========================================================
function placeFood() {
  let validPosition = false;
  while (!validPosition) {
    const candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Cek apakah posisi ini bertabrakan dengan tubuh ular
    const collidesWithSnake = snake.some(
      (segment) => segment.x === candidate.x && segment.y === candidate.y
    );
    if (!collidesWithSnake) {
      food = candidate;
      validPosition = true;
    }
  }
}

// ==========================================================
// 7. GAME LOOP UTAMA
// Menggunakan setTimeout (bukan setInterval) agar kecepatan
// bisa diubah secara dinamis setiap kali level naik.
// ==========================================================
function gameLoop() {
  if (isGameOver) return;

  update();   // 1) update posisi & logika
  render();   // 2) gambar ulang canvas

  if (!isGameOver) {
    const speed = getCurrentSpeed();
    gameLoopId = setTimeout(gameLoop, speed);
  }
}

// Menghitung interval loop berdasarkan level saat ini
function getCurrentSpeed() {
  const speed = BASE_SPEED - (level - 1) * SPEED_STEP;
  return Math.max(speed, MIN_SPEED); // jangan lebih cepat dari batas minimum
}

// ==========================================================
// 8. UPDATE LOGIKA: gerak ular, deteksi makan, deteksi tabrakan
// ==========================================================
function update() {
  // Terapkan arah yang sudah dibuffer dari input pemain
  direction = nextDirection;

  // Hitung posisi kepala baru berdasarkan arah gerak
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  // --- DETEKSI TABRAKAN DINDING ---
  // Jika kepala keluar dari batas grid (0 sampai GRID_SIZE-1) -> game over
  if (
    newHead.x < 0 ||
    newHead.x >= GRID_SIZE ||
    newHead.y < 0 ||
    newHead.y >= GRID_SIZE
  ) {
    triggerGameOver();
    return;
  }

  // --- DETEKSI TABRAKAN DIRI SENDIRI ---
  // Jika posisi kepala baru sama dengan salah satu segmen tubuh -> game over
  const hitsSelf = snake.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y
  );
  if (hitsSelf) {
    triggerGameOver();
    return;
  }

  // Tambahkan kepala baru ke depan array (ular "bergerak maju")
  snake.unshift(newHead);

  // --- DETEKSI MAKAN ---
  const ateFood = newHead.x === food.x && newHead.y === food.y;
  if (ateFood) {
    score += 1;
    currentScoreEl.textContent = score;
    placeFood();
    checkLevelUp();
    // Catatan: kita TIDAK menghapus ekor di sini,
    // sehingga ular bertambah panjang 1 segmen.
  } else {
    // Jika tidak makan, hapus segmen ekor terakhir
    // supaya panjang ular tetap konstan (efek "bergerak").
    snake.pop();
  }
}

// ==========================================================
// 9. SISTEM LEVEL
// Setiap kelipatan FOODS_PER_LEVEL skor, level naik 1.
// ==========================================================
function checkLevelUp() {
  const targetLevel = Math.floor(score / FOODS_PER_LEVEL) + 1;
  if (targetLevel > level) {
    level = targetLevel;
    currentLevelEl.textContent = level;
    showLevelUpEffect();
  }
}

function showLevelUpEffect() {
  // Efek 1: teks "LEVEL UP!" muncul sebentar di tengah canvas
  levelUpFlash.classList.add('show');
  setTimeout(() => levelUpFlash.classList.remove('show'), 700);

  // Efek 2: kotak level berkedip/pulse
  levelBox.classList.add('level-pulse');
  setTimeout(() => levelBox.classList.remove('level-pulse'), 500);
}

// ==========================================================
// 10. RENDER: menggambar ular, makanan, dan grid ke canvas
// ==========================================================
function render() {
  // Bersihkan canvas setiap frame
  ctx.fillStyle = '#0d1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    const x = segment.x * cellSize;
    const y = segment.y * cellSize;
    const padding = 2; // sedikit jarak antar segmen agar terlihat seperti kotak terpisah

    ctx.fillStyle = isHead ? '#a5ffcf' : '#39ff88';
    ctx.shadowColor = '#39ff88';
    ctx.shadowBlur = isHead ? 18 : 10;

    drawRoundedRect(
      x + padding / 2,
      y + padding / 2,
      cellSize - padding,
      cellSize - padding,
      6
    );
  });
  ctx.shadowBlur = 0; // reset shadow agar tidak mempengaruhi elemen lain
}

function drawFood() {
  const x = food.x * cellSize;
  const y = food.y * cellSize;
  const radius = cellSize / 2 - 2;

  ctx.beginPath();
  ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2e6c';
  ctx.shadowColor = '#ff2e6c';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Helper: menggambar persegi dengan sudut melengkung (rounded rect)
function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

// Frame statis saat belum mulai bermain (tampilan awal canvas kosong)
function drawIdleFrame() {
  ctx.fillStyle = '#0d1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ==========================================================
// 11. GAME OVER
// ==========================================================
function triggerGameOver() {
  isGameOver = true;
  isRunning = false;
  clearTimeout(gameLoopId);

  const isNewRecord = saveHighScoreIfNeeded();

  finalScoreEl.textContent = score;
  newRecordText.classList.toggle('hidden', !isNewRecord);

  gameOverScreen.classList.remove('hidden');
}

// ==========================================================
// 12. KONTROL INPUT: Keyboard (Arrow Keys & WASD)
// ==========================================================
function handleDirectionInput(key) {
  // Mapping tombol ke vektor arah
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const newDir = keyMap[key];
  if (!newDir) return;

  // Mencegah ular berbalik 180 derajat langsung ke tubuhnya sendiri
  // (misal: sedang bergerak kanan, tidak boleh langsung ke kiri)
  const isOpposite =
    newDir.x === -direction.x && newDir.y === -direction.y;

  if (!isOpposite) {
    nextDirection = newDir;
  }
}

document.addEventListener('keydown', (e) => {
  if (!isRunning) return;
  handleDirectionInput(e.key);
});

// ==========================================================
// 13. KONTROL INPUT: D-Pad Virtual (Mobile)
// ==========================================================
const dpadKeyMap = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

dpad.querySelectorAll('.dpad-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!isRunning) return;
    const dir = btn.getAttribute('data-dir');
    handleDirectionInput(dpadKeyMap[dir]);
  });
});

// ==========================================================
// 14. KONTROL STATE LAYAR (Start / Playing / Game Over)
// ==========================================================
function startGame() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');

  initGame();
  isRunning = true;

  render();
  gameLoopId = setTimeout(gameLoop, getCurrentSpeed());
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// ==========================================================
// 15. INISIALISASI SAAT HALAMAN DIMUAT
// ==========================================================
window.addEventListener('load', () => {
  loadHighScore();
  resizeCanvas();
  drawIdleFrame();
});
