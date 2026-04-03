export class Audio {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      // Web Audio not supported
    }
  }

  play(frequency, duration, type, volume) {
    if (!this.initialized || this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume || 0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playGrab() {
    this.play(300, 0.15, 'sawtooth', 0.08);
    setTimeout(() => this.play(200, 0.1, 'sawtooth', 0.06), 80);
  }

  playMount() {
    this.play(150, 0.3, 'sawtooth', 0.1);
  }

  playShake() {
    this.play(400, 0.1, 'square', 0.08);
    setTimeout(() => this.play(500, 0.1, 'square', 0.08), 60);
    setTimeout(() => this.play(600, 0.15, 'square', 0.1), 120);
  }

  playTurbo() {
    this.play(100, 0.3, 'sawtooth', 0.1);
    this.play(150, 0.3, 'sawtooth', 0.05);
  }

  playLevelComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.2, 'square', 0.08), i * 120);
    });
  }

  playGameOver() {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.3, 'sawtooth', 0.08), i * 200);
    });
  }

  playVictory() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.play(freq, 0.15, 'square', 0.08), i * 100);
    });
  }
}
