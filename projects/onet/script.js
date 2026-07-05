/* ============================================================
   ONET — Lentera Malam
   Vanilla JS, no dependencies.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Level configuration (table from spec) ---------- */
  const LEVELS = [
    { rows: 4,  cols: 4,  time: 90,  label: "Pengenalan" },
    { rows: 4,  cols: 6,  time: 100, label: "Variasi Kolom" },
    { rows: 6,  cols: 6,  time: 120, label: "Papan Persegi" },
    { rows: 6,  cols: 6,  time: 100, label: "Waktu Dipotong" },
    { rows: 6,  cols: 8,  time: 140, label: "Melebar" },
    { rows: 8,  cols: 8,  time: 160, label: "Papan Besar" },
    { rows: 8,  cols: 8,  time: 130, label: "Lebih Ketat" },
    { rows: 8,  cols: 10, time: 180, label: "Sangat Luas" },
    { rows: 8,  cols: 10, time: 150, label: "Waktu Pendek" },
    { rows: 10, cols: 10, time: 200, label: "Boss Level" }
  ];
  const HINT_LIMITED_FROM = 7; // level index 7..10 (1-based) => index>=6 (0-based)
  const MAX_HINTS = 3;
  const POINTS_PER_MATCH = 10;

  const ICONS = [
    "🍎","🍌","🍇","🍉","🍓","🍑","🍒","🫐","🥝","🍊",
    "🍋","🍈","🥭","🫑","🥑","🧄","🧅","🥕","🌽","🥦",
    "🐱","🐶","🐰","🐻","🐼","🐨","🦊","🐮","🐷","🐵"
  ];

  /* ---------- DOM refs ---------- */
  const screenMenu = document.getElementById("screen-menu");
  const screenGame = document.getElementById("screen-game");
  const boardEl = document.getElementById("board");
  const boardWrapper = document.getElementById("board-wrapper");
  const boardStage = document.getElementById("board-stage");
  const canvas = document.getElementById("path-canvas");
  const ctx = canvas.getContext("2d");

  const hudLevel = document.getElementById("hud-level");
  const hudScore = document.getElementById("hud-score");
  const hudTime = document.getElementById("hud-time");
  const timerPill = document.getElementById("timer-pill");
  const progressFill = document.getElementById("progress-fill");

  const btnStart = document.getElementById("btn-start");
  const btnHint = document.getElementById("btn-hint");
  const btnShuffle = document.getElementById("btn-shuffle");
  const btnExit = document.getElementById("btn-exit");
  const hintCountEl = document.getElementById("hint-count");

  const overlayWin = document.getElementById("overlay-win");
  const overlayLose = document.getElementById("overlay-lose");
  const overlayFinish = document.getElementById("overlay-finish");
  const winScoreEl = document.getElementById("win-score");
  const finishScoreEl = document.getElementById("finish-score");
  const loseReasonEl = document.getElementById("lose-reason");
  const btnNext = document.getElementById("btn-next");
  const btnRetry = document.getElementById("btn-retry");
  const btnLoseExit = document.getElementById("btn-lose-exit");
  const btnFinishMenu = document.getElementById("btn-finish-menu");

  /* ---------- Game state ---------- */
  let state = {
    levelIndex: 0,
    score: 0,
    rows: 0,
    cols: 0,
    tiles: [],       // {id,row,col,icon,matched,el}
    totalPairs: 0,
    matchedPairs: 0,
    timeLeft: 0,
    timerId: null,
    hintsLeft: MAX_HINTS,
    hintLimited: false,
    selected: null,
    cellSize: 40,
    playing: false,
    busy: false      // true while a match animation is running (blocks input)
  };

  /* ============================================================
     Screen management
     ============================================================ */
  function showScreen(el) {
    [screenMenu, screenGame].forEach(s => s.classList.remove("active"));
    el.classList.add("active");
  }

  function showOverlay(el) {
    [overlayWin, overlayLose, overlayFinish].forEach(o => o.classList.remove("active"));
    el.classList.add("active");
  }
  function hideOverlays() {
    [overlayWin, overlayLose, overlayFinish].forEach(o => o.classList.remove("active"));
  }

  /* ============================================================
     Level setup / board generation
     ============================================================ */
  function startLevel(index) {
    hideOverlays();
    clearInterval(state.timerId);

    const cfg = LEVELS[index];
    state.levelIndex = index;
    state.rows = cfg.rows;
    state.cols = cfg.cols;
    state.totalPairs = (cfg.rows * cfg.cols) / 2;
    state.matchedPairs = 0;
    state.timeLeft = cfg.time;
    state.selected = null;
    state.playing = true;
    state.busy = false;
    state.hintLimited = (index + 1) >= HINT_LIMITED_FROM;
    state.hintsLeft = state.hintLimited ? MAX_HINTS : Infinity;

    generateTiles();
    renderBoard(true);
    updateHud();
    updateHintUI();
    timerPill.classList.remove("warning");

    state.timerId = setInterval(tick, 1000);
    showScreen(screenGame);
  }

  function generateTiles() {
    const total = state.rows * state.cols;
    const pairs = total / 2;

    let icons;
    do {
      icons = buildIconPool(pairs);
      shuffleArray(icons);
    } while (!hasAnyValidMoveForIcons(icons, state.rows, state.cols));

    state.tiles = [];
    let idx = 0;
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        state.tiles.push({
          id: r + "_" + c,
          row: r,
          col: c,
          icon: icons[idx++],
          matched: false,
          el: null
        });
      }
    }
  }

  function buildIconPool(pairs) {
    // Distinct icons used, cycling through ICONS if pairs > ICONS.length
    const pool = [];
    for (let p = 0; p < pairs; p++) {
      const icon = ICONS[p % ICONS.length];
      pool.push(icon, icon);
    }
    return pool;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Quick check (on a raw icon layout, before tile objects exist) that at
  // least one matching pair has a valid connecting path.
  function hasAnyValidMoveForIcons(icons, rows, cols) {
    const occ = buildOccupancyRaw(rows, cols); // all true (occupied)
    for (let i = 0; i < icons.length; i++) {
      for (let j = i + 1; j < icons.length; j++) {
        if (icons[i] !== icons[j]) continue;
        const r1 = Math.floor(i / cols), c1 = i % cols;
        const r2 = Math.floor(j / cols), c2 = j % cols;
        occ[r1 + 1][c1 + 1] = false;
        occ[r2 + 1][c2 + 1] = false;
        const path = findPathOnOcc(occ, r1, c1, r2, c2, rows, cols);
        occ[r1 + 1][c1 + 1] = true;
        occ[r2 + 1][c2 + 1] = true;
        if (path) return true;
      }
    }
    return false;
  }

  function buildOccupancyRaw(rows, cols) {
    const PR = rows + 2, PC = cols + 2;
    const occ = new Array(PR);
    for (let r = 0; r < PR; r++) {
      occ[r] = new Array(PC).fill(false);
      for (let c = 0; c < PC; c++) {
        if (r >= 1 && r <= rows && c >= 1 && c <= cols) occ[r][c] = true;
      }
    }
    return occ;
  }

  /* ============================================================
     Rendering
     ============================================================ */
  function renderBoard(isNewLevel) {
    if (isNewLevel) {
      boardEl.innerHTML = "";
      state.tiles.forEach(t => {
        const el = document.createElement("div");
        el.className = "tile";
        el.textContent = t.icon;
        el.addEventListener("click", () => onTileClick(t));
        boardEl.appendChild(el);
        t.el = el;
      });
    }
    layoutBoard();
  }

  // Computes the largest tile size that fits the available space for the
  // current rows/cols, then applies it to the stage (canvas + grid) so
  // every coordinate system (tiles, grid tracks, canvas pixels) shares the
  // exact same origin and scale. This is what keeps the drawn path lined
  // up with the tile the player actually selected, at any grid size from
  // 4x4 to 10x10.
  function layoutBoard() {
    const rect = boardWrapper.getBoundingClientRect();
    const padding = 16; // breathing room
    const availW = Math.max(rect.width - padding, 40);
    const availH = Math.max(rect.height - padding, 40);

    // +2 reserves one extra "cell" of margin on each axis so paths that
    // route around the outside edge of the board still have room to draw.
    const sizeX = availW / (state.cols + 2);
    const sizeY = availH / (state.rows + 2);
    state.cellSize = Math.max(Math.floor(Math.min(sizeX, sizeY)), 18);

    const s = state.cellSize;
    const stageW = (state.cols + 2) * s;
    const stageH = (state.rows + 2) * s;

    boardStage.style.width = stageW + "px";
    boardStage.style.height = stageH + "px";

    canvas.width = stageW;
    canvas.height = stageH;
    canvas.style.width = stageW + "px";
    canvas.style.height = stageH + "px";

    // The playable grid sits inset by exactly one tile from the stage's
    // edge — this offset is the same "+1" used by the padded occupancy
    // grid in the pathfinder, so grid cell (0,0) always lands at pixel
    // (s, s), matching padded coordinate (1,1) used when drawing.
    boardEl.style.left = s + "px";
    boardEl.style.top = s + "px";
    boardEl.style.width = (state.cols * s) + "px";
    boardEl.style.height = (state.rows * s) + "px";
    boardEl.style.gridTemplateColumns = `repeat(${state.cols}, ${s}px)`;
    boardEl.style.gridTemplateRows = `repeat(${state.rows}, ${s}px)`;
    boardEl.style.setProperty("--tile-font", Math.max(Math.floor(s * 0.6), 10) + "px");
  }

  function updateHud() {
    hudLevel.textContent = (state.levelIndex + 1) + " / " + LEVELS.length;
    hudScore.textContent = state.score;
    const m = Math.floor(state.timeLeft / 60).toString().padStart(2, "0");
    const s = Math.floor(state.timeLeft % 60).toString().padStart(2, "0");
    hudTime.textContent = m + ":" + s;
    const pct = state.totalPairs === 0 ? 0 : Math.round((state.matchedPairs / state.totalPairs) * 100);
    progressFill.style.width = pct + "%";
  }

  function updateHintUI() {
    if (state.hintLimited) {
      hintCountEl.textContent = state.hintsLeft;
      hintCountEl.classList.add("show");
      btnHint.disabled = state.hintsLeft <= 0;
    } else {
      hintCountEl.classList.remove("show");
      btnHint.disabled = false;
    }
  }

  /* ============================================================
     Timer
     ============================================================ */
  function tick() {
    if (!state.playing) return;
    state.timeLeft--;
    if (state.timeLeft <= 10) timerPill.classList.add("warning");
    updateHud();
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      loseLevel("Waktu Habis");
    }
  }

  /* ============================================================
     Tile interaction
     ============================================================ */
  function onTileClick(tile) {
    if (!state.playing || state.busy || tile.matched) return;

    if (!state.selected) {
      state.selected = tile;
      tile.el.classList.add("selected");
      return;
    }

    if (state.selected === tile) {
      tile.el.classList.remove("selected");
      state.selected = null;
      return;
    }

    const first = state.selected;
    if (first.icon !== tile.icon) {
      // different icon: just swap selection
      first.el.classList.remove("selected");
      state.selected = tile;
      tile.el.classList.add("selected");
      return;
    }

    // same icon, try to connect
    const path = findPath(first, tile);
    first.el.classList.remove("selected");
    state.selected = null;

    if (path) {
      state.busy = true;
      drawPath(path, () => {
        matchTiles(first, tile);
      });
    } else {
      shakeTile(first);
      shakeTile(tile);
    }
  }

  function shakeTile(tile) {
    tile.el.classList.add("shake");
    setTimeout(() => tile.el.classList.remove("shake"), 320);
  }

  function matchTiles(a, b) {
    a.matched = true;
    b.matched = true;
    a.el.classList.add("matched");
    b.el.classList.add("matched");
    state.score += POINTS_PER_MATCH;
    state.matchedPairs++;
    updateHud();
    state.busy = false;

    if (state.matchedPairs >= state.totalPairs) {
      winLevel();
      return;
    }
    if (checkDeadlock()) {
      loseLevel("Tidak Ada Lagi Pasangan");
    }
  }

  /* ============================================================
     Pathfinding: max 3 segments / 2 turns
     ============================================================ */
  function buildOccupancy() {
    const PR = state.rows + 2, PC = state.cols + 2;
    const occ = new Array(PR);
    for (let r = 0; r < PR; r++) occ[r] = new Array(PC).fill(false);
    state.tiles.forEach(t => {
      if (!t.matched) occ[t.row + 1][t.col + 1] = true;
    });
    return occ;
  }

  function findPath(t1, t2) {
    const occ = buildOccupancy();
    return findPathOnOcc(occ, t1.row, t1.col, t2.row, t2.col, state.rows, state.cols);
  }

  // Generic path search over a padded occupancy grid (rows+2 x cols+2).
  // Returns array of {r,c} points in *padded* coordinates, or null.
  function findPathOnOcc(occ, r1, c1, r2, c2, rows, cols) {
    const PR = rows + 2, PC = cols + 2;
    const pr1 = r1 + 1, pc1 = c1 + 1;
    const pr2 = r2 + 1, pc2 = c2 + 1;

    // Open endpoints for traversal purposes.
    const o1 = occ[pr1][pc1], o2 = occ[pr2][pc2];
    occ[pr1][pc1] = false;
    occ[pr2][pc2] = false;

    const s1 = collectRay(pr1, pc1, occ, PR, PC);
    const s2 = collectRay(pr2, pc2, occ, PR, PC);

    let result = null;
    outer:
    for (let i = 0; i < s1.length; i++) {
      const a = s1[i];
      for (let j = 0; j < s2.length; j++) {
        const b = s2[j];
        if (a.r === b.r || a.c === b.c) {
          if (segmentClear(a, b, occ)) {
            result = dedupe([{ r: pr1, c: pc1 }, a, b, { r: pr2, c: pc2 }]);
            break outer;
          }
        }
      }
    }

    occ[pr1][pc1] = o1;
    occ[pr2][pc2] = o2;
    return result;
  }

  function collectRay(r, c, occ, PR, PC) {
    const points = [{ r, c }];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    dirs.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < PR && nc >= 0 && nc < PC && !occ[nr][nc]) {
        points.push({ r: nr, c: nc });
        nr += dr; nc += dc;
      }
    });
    return points;
  }

  function segmentClear(p, q, occ) {
    if (p.r === q.r) {
      const cmin = Math.min(p.c, q.c), cmax = Math.max(p.c, q.c);
      for (let c = cmin + 1; c < cmax; c++) if (occ[p.r][c]) return false;
      return true;
    }
    if (p.c === q.c) {
      const rmin = Math.min(p.r, q.r), rmax = Math.max(p.r, q.r);
      for (let r = rmin + 1; r < rmax; r++) if (occ[r][p.c]) return false;
      return true;
    }
    return false;
  }

  function dedupe(points) {
    const out = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const last = out[out.length - 1];
      if (last.r !== points[i].r || last.c !== points[i].c) out.push(points[i]);
    }
    return out;
  }

  /* ---------- Deadlock check ---------- */
  function checkDeadlock() {
    const remaining = state.tiles.filter(t => !t.matched);
    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        if (remaining[i].icon !== remaining[j].icon) continue;
        if (findPath(remaining[i], remaining[j])) return false;
      }
    }
    return true;
  }

  function findAnyValidPair() {
    const remaining = state.tiles.filter(t => !t.matched);
    for (let i = 0; i < remaining.length; i++) {
      for (let j = i + 1; j < remaining.length; j++) {
        if (remaining[i].icon !== remaining[j].icon) continue;
        if (findPath(remaining[i], remaining[j])) return [remaining[i], remaining[j]];
      }
    }
    return null;
  }

  /* ============================================================
     Path drawing (canvas)
     ============================================================ */
  function drawPath(points, onDone) {
    const s = state.cellSize;
    const toPx = p => ({ x: p.c * s + s / 2, y: p.r * s + s / 2 });
    const px = points.map(toPx);

    let progress = 0;
    const duration = 260;
    const start = performance.now();

    function frame(now) {
      progress = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGlowLine(px, progress);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onDone();
        }, 90);
      }
    }
    requestAnimationFrame(frame);
  }

  function drawGlowLine(px, progress) {
    // total length
    let segLens = [];
    let total = 0;
    for (let i = 0; i < px.length - 1; i++) {
      const d = Math.hypot(px[i + 1].x - px[i].x, px[i + 1].y - px[i].y);
      segLens.push(d);
      total += d;
    }
    let target = total * progress;
    const drawPoints = [px[0]];
    for (let i = 0; i < segLens.length; i++) {
      if (target >= segLens[i]) {
        drawPoints.push(px[i + 1]);
        target -= segLens[i];
      } else {
        const t = segLens[i] === 0 ? 0 : target / segLens[i];
        drawPoints.push({
          x: px[i].x + (px[i + 1].x - px[i].x) * t,
          y: px[i].y + (px[i + 1].y - px[i].y) * t
        });
        break;
      }
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255,180,84,0.9)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#ffb454";
    ctx.lineWidth = Math.max(state.cellSize * 0.12, 3);
    ctx.beginPath();
    drawPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.restore();
  }

  /* ============================================================
     Hint / Shuffle
     ============================================================ */
  function useHint() {
    if (!state.playing || state.busy) return;
    if (state.hintLimited && state.hintsLeft <= 0) return;

    const pair = findAnyValidPair();
    if (!pair) return; // shouldn't happen (deadlock already checked)

    pair.forEach(t => {
      t.el.classList.add("hinting");
      setTimeout(() => t.el.classList.remove("hinting"), 2100);
    });

    if (state.hintLimited) {
      state.hintsLeft--;
      updateHintUI();
    }
  }

  function useShuffle() {
    if (!state.playing || state.busy) return;
    if (state.selected) {
      state.selected.el.classList.remove("selected");
      state.selected = null;
    }

    const remaining = state.tiles.filter(t => !t.matched);
    const icons = remaining.map(t => t.icon);

    let attempts = 0;
    let arrangement = icons.slice();
    do {
      shuffleArray(arrangement);
      attempts++;
    } while (attempts < 60 && !arrangementHasValidMove(remaining, arrangement));

    remaining.forEach((t, i) => {
      t.icon = arrangement[i];
      t.el.textContent = arrangement[i];
    });

    if (checkDeadlock()) {
      loseLevel("Tidak Ada Lagi Pasangan");
    }
  }

  function arrangementHasValidMove(remainingTiles, arrangement) {
    // temporarily assign, test, no DOM changes needed for logic-only check
    const backup = remainingTiles.map(t => t.icon);
    remainingTiles.forEach((t, i) => (t.icon = arrangement[i]));
    const ok = !checkDeadlock();
    remainingTiles.forEach((t, i) => (t.icon = backup[i]));
    return ok;
  }

  /* ============================================================
     Win / Lose flow
     ============================================================ */
  function winLevel() {
    state.playing = false;
    clearInterval(state.timerId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.levelIndex >= LEVELS.length - 1) {
      finishScoreEl.textContent = "Skor akhir: " + state.score;
      showOverlay(overlayFinish);
    } else {
      winScoreEl.textContent = "Skor kamu: " + state.score;
      showOverlay(overlayWin);
    }
  }

  function loseLevel(reason) {
    state.playing = false;
    clearInterval(state.timerId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loseReasonEl.textContent = reason;
    showOverlay(overlayLose);
  }

  /* ============================================================
     Event wiring
     ============================================================ */
  btnStart.addEventListener("click", () => {
    state.score = 0;
    startLevel(0);
  });

  btnHint.addEventListener("click", useHint);
  btnShuffle.addEventListener("click", useShuffle);

  btnExit.addEventListener("click", () => {
    clearInterval(state.timerId);
    state.playing = false;
    showScreen(screenMenu);
  });

  btnNext.addEventListener("click", () => {
    startLevel(state.levelIndex + 1);
  });

  btnRetry.addEventListener("click", () => {
    startLevel(state.levelIndex);
  });

  btnLoseExit.addEventListener("click", () => {
    hideOverlays();
    showScreen(screenMenu);
  });

  btnFinishMenu.addEventListener("click", () => {
    hideOverlays();
    showScreen(screenMenu);
  });

  function handleViewportChange() {
    if (screenGame.classList.contains("active")) {
      layoutBoard();
    }
  }
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("orientationchange", handleViewportChange);
})();
