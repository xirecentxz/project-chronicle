// ============================================================
// Sound effects sederhana menggunakan Web Audio API (oscillator).
// Tidak memerlukan file .mp3 eksternal, jadi game tetap
// self-contained/portable saat dideploy ke GitHub Pages.
// ============================================================

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType, volume = 0.15, delay = 0) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const startTime = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Web Audio tidak tersedia / diblokir browser - abaikan secara diam-diam
  }
}

export const sound = {
  click() {
    playTone(420, 0.1, 'sine', 0.12);
  },
  capture() {
    playTone(220, 0.12, 'sawtooth', 0.15);
    playTone(330, 0.15, 'sawtooth', 0.12, 0.08);
  },
  bonus() {
    playTone(523.25, 0.12, 'triangle', 0.15);
    playTone(659.25, 0.12, 'triangle', 0.15, 0.1);
    playTone(783.99, 0.18, 'triangle', 0.15, 0.2);
  },
  win() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      playTone(f, 0.2, 'triangle', 0.15, i * 0.15)
    );
  },
};
