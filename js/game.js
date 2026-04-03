export const State = {
  TITLE: 'title',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'levelComplete',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
  PAUSED: 'paused'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = State.TITLE;
    this.selectedTheme = null;
    this.currentLevel = 1;
    this.lastTime = 0;
    this.stats = { mounted: 0, shaken: 0 };

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.arenaWidth = Math.min(this.canvas.width - 40, 800);
    this.arenaHeight = Math.min(this.canvas.height - 40, 600);
    this.arenaX = (this.canvas.width - this.arenaWidth) / 2;
    this.arenaY = (this.canvas.height - this.arenaHeight) / 2;
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Will be filled in by later tasks
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
