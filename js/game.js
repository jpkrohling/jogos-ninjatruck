import { Truck } from './truck.js';
import { Enemy, EnemyState } from './enemy.js';
import { themes } from './themes.js';
import { getLevel, levels } from './level.js';
import { Input } from './input.js';
import { drawHUD, drawPaused, drawArena, drawBackground } from './renderer.js';
import { ParticleSystem } from './particles.js';
import { Audio } from './audio.js';
import { UI } from './ui.js';

export const State = {
  TITLE: 'title',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'levelComplete',
  LOST_LIFE: 'lostLife',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
  PAUSED: 'paused'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = State.TITLE;
    this.previousState = null;
    this.selectedTheme = 'ninjas';
    this.currentLevel = 1;
    this.lastTime = 0;

    this.truck = null;
    this.enemies = [];
    this.spawnTimer = 0;
    this.levelConfig = null;
    this.levelTimer = 0;
    this.levelStats = { mounted: 0, shaken: 0 };
    this.lives = 3;
    this.maxLives = 3;

    this.input = new Input(canvas);
    this.particles = new ParticleSystem();
    this.audio = new Audio();
    this.ui = new UI(this);

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
    this.state = State.TITLE;
    this.previousState = State.TITLE;
    this.ui.showTitle();
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

  startLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.levelConfig = getLevel(levelNumber);
    this.levelTimer = this.levelConfig.duration;
    this.levelStats = { mounted: 0, shaken: 0 };
    this.enemies = [];
    this.spawnTimer = 0;
    this.particles = new ParticleSystem();

    this.truck = new Truck(
      this.arenaX + this.arenaWidth / 2,
      this.arenaY + this.arenaHeight / 2
    );
    this.truck.turboAvailable = this.levelConfig.turboAvailable;
    this.truck.shakeAvailable = this.levelConfig.shakeAvailable;

    this.input.showButtons(this.levelConfig.turboAvailable, this.levelConfig.shakeAvailable);
    this.state = State.PLAYING;
  }

  update(dt) {
    if (this.state === State.TITLE) {
      return;
    }

    // Detect state changes for UI
    if (this.state !== this.previousState) {
      if (this.state === State.LEVEL_COMPLETE) {
        this.ui.showLevelComplete(); this.audio.playLevelComplete();
        this.particles.emitLevelComplete(this.canvas.width / 2, this.canvas.height / 2);
      }
      if (this.state === State.LOST_LIFE) { this.ui.showLostLife(); this.audio.playGameOver(); }
      if (this.state === State.GAME_OVER) { this.ui.showGameOver(); this.audio.playGameOver(); }
      if (this.state === State.VICTORY) {
        this.ui.showVictory(); this.audio.playVictory();
        this.particles.emitLevelComplete(this.canvas.width / 2, this.canvas.height / 2);
      }
      this.previousState = this.state;
    }

    if (this.state === State.PLAYING) {
      this.input.update();

      if (this.input.consumePause()) {
        this.state = State.PAUSED;
        return;
      }

      // Turbo
      if (this.input.consumeTurbo()) {
        if (this.truck.activateTurbo()) this.audio.playTurbo();
      }

      // Shake
      if (this.input.consumeShake()) {
        if (this.truck.activateShake()) {
          let shakenCount = 0;
          for (const enemy of this.enemies) {
            if (enemy.fling()) {
              shakenCount++;
              this.particles.emitShake(enemy.x, enemy.y);
              this.particles.emitEnemyFlung(enemy.x, enemy.y, enemy.variant.bodyColor);
            }
          }
          this.levelStats.shaken += shakenCount;
          if (shakenCount > 0) this.audio.playShake();
        }
      }

      this.truck.update(dt, this.input.moveX, this.input.moveY,
        this.arenaX, this.arenaY, this.arenaWidth, this.arenaHeight);

      // Turbo particles
      if (this.truck.turboActive) {
        const behindX = this.truck.x - Math.cos(this.truck.rotation) * 30;
        const behindY = this.truck.y - Math.sin(this.truck.rotation) * 30;
        this.particles.emitTurbo(behindX, behindY);
      }

      // Level timer
      this.levelTimer -= dt;
      if (this.levelTimer <= 0 && this.truck.alive) {
        if (this.currentLevel >= levels.length) {
          this.state = State.VICTORY;
        } else {
          this.state = State.LEVEL_COMPLETE;
        }
        return;
      }

      // Spawn enemies
      this.spawnTimer += dt;
      const activeEnemies = this.enemies.filter(e => !e.dead).length;
      if (this.spawnTimer >= this.levelConfig.spawnInterval && activeEnemies < this.levelConfig.maxEnemies) {
        this.spawnTimer = 0;
        this.spawnEnemy(this.levelConfig.enemySpeed);
      }

      // Update enemies
      for (const enemy of this.enemies) {
        const prevState = enemy.state;
        enemy.update(dt, this.truck);
        if (prevState === EnemyState.APPROACHING && enemy.state === EnemyState.GRABBING) {
          this.audio.playGrab();
        }
        if (prevState === EnemyState.GRABBING && enemy.state === EnemyState.MOUNTED) {
          this.audio.playMount();
          this.levelStats.mounted++;
        }
      }

      this.enemies = this.enemies.filter(e => !e.dead);
      this.particles.update(dt);

      // Check if truck stopped
      if (!this.truck.alive) {
        this.lives--;
        if (this.lives <= 0) {
          this.state = State.GAME_OVER;
        } else {
          this.state = State.LOST_LIFE;
        }
      }
    }

    if (this.state === State.PAUSED) {
      this.input.update();
      if (this.input.consumePause()) {
        this.state = State.PLAYING;
      }
    }

    // Always update particles (for level complete / victory effects)
    if (this.state !== State.PLAYING) {
      this.particles.update(dt);
    }
  }

  spawnEnemy(speed) {
    const theme = themes[this.selectedTheme];
    const variant = theme.variants[Math.floor(Math.random() * theme.variants.length)];

    let x, y;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: x = this.arenaX + Math.random() * this.arenaWidth; y = this.arenaY - 20; break;
      case 1: x = this.arenaX + this.arenaWidth + 20; y = this.arenaY + Math.random() * this.arenaHeight; break;
      case 2: x = this.arenaX + Math.random() * this.arenaWidth; y = this.arenaY + this.arenaHeight + 20; break;
      case 3: x = this.arenaX - 20; y = this.arenaY + Math.random() * this.arenaHeight; break;
    }

    this.enemies.push(new Enemy(x, y, speed, variant));
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    drawBackground(ctx, this.canvas);
    drawArena(ctx, this);

    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }

    if (this.truck) {
      this.truck.draw(ctx);
    }

    this.particles.draw(ctx);

    if (this.state === State.PLAYING) {
      drawHUD(ctx, this);
    }

    if (this.state === State.PAUSED) {
      drawHUD(ctx, this);
      drawPaused(ctx, this.canvas);
    }

    if (this.input) this.input.drawJoystick(ctx);
  }
}
