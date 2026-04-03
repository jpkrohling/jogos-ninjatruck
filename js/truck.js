import { clamp } from './utils.js';

export class Truck {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 70;
    this.rotation = 0;
    this.targetRotation = 0;
    this.baseSpeed = 200;
    this.currentSpeed = this.baseSpeed;
    this.speedPenaltyPerEnemy = this.baseSpeed * 0.15;
    this.mountedCount = 0;
    this.vx = 0;
    this.vy = 0;

    // Turbo
    this.turboAvailable = false;
    this.turboActive = false;
    this.turboDuration = 2;
    this.turboTimer = 0;
    this.turboCooldown = 5;
    this.turboCooldownTimer = 0;
    this.turboMultiplier = 2.5;

    // Shake
    this.shakeAvailable = false;
    this.shakeCooldown = 4;
    this.shakeCooldownTimer = 0;
    this.shakeActive = false;
    this.shakeTimer = 0;
    this.shakeDuration = 0.3;
  }

  get speed() {
    const base = this.currentSpeed;
    if (this.turboActive) return base * this.turboMultiplier;
    return base;
  }

  get alive() {
    return this.currentSpeed > 0;
  }

  enemyMounted() {
    this.mountedCount++;
    this.currentSpeed = Math.max(0, this.baseSpeed - this.mountedCount * this.speedPenaltyPerEnemy);
  }

  activateTurbo() {
    if (!this.turboAvailable || this.turboActive || this.turboCooldownTimer > 0) return false;
    this.turboActive = true;
    this.turboTimer = this.turboDuration;
    return true;
  }

  activateShake() {
    if (!this.shakeAvailable || this.shakeActive || this.shakeCooldownTimer > 0) return false;
    this.shakeActive = true;
    this.shakeTimer = this.shakeDuration;
    return true;
  }

  update(dt, inputX, inputY, arenaX, arenaY, arenaW, arenaH) {
    const len = Math.sqrt(inputX * inputX + inputY * inputY);
    if (len > 0.1) {
      const nx = inputX / len;
      const ny = inputY / len;
      this.vx = nx * this.speed;
      this.vy = ny * this.speed;
      this.targetRotation = Math.atan2(ny, nx);
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const halfW = this.width / 2;
    const halfH = this.height / 2;
    this.x = clamp(this.x, arenaX + halfW, arenaX + arenaW - halfW);
    this.y = clamp(this.y, arenaY + halfH, arenaY + arenaH - halfH);

    // Smooth rotation
    let diff = this.targetRotation - this.rotation;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.rotation += diff * Math.min(1, dt * 10);

    // Turbo timer
    if (this.turboActive) {
      this.turboTimer -= dt;
      if (this.turboTimer <= 0) {
        this.turboActive = false;
        this.turboCooldownTimer = this.turboCooldown;
      }
    }
    if (this.turboCooldownTimer > 0) this.turboCooldownTimer -= dt;

    // Shake timer
    if (this.shakeActive) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.shakeActive = false;
        this.shakeCooldownTimer = this.shakeCooldown;
      }
    }
    if (this.shakeCooldownTimer > 0) this.shakeCooldownTimer -= dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation + Math.PI / 2);

    if (this.shakeActive) {
      ctx.translate(Math.sin(performance.now() * 0.05) * 5, 0);
    }

    const w = this.width;
    const h = this.height;

    // Turbo flame
    if (this.turboActive) {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, h * 0.5);
      ctx.lineTo(0, h * 0.5 + 20 + Math.random() * 10);
      ctx.lineTo(w * 0.3, h * 0.5);
      ctx.fill();

      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(-w * 0.15, h * 0.5);
      ctx.lineTo(0, h * 0.5 + 12 + Math.random() * 8);
      ctx.lineTo(w * 0.15, h * 0.5);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);
    ctx.fill();

    // Cabin
    ctx.fillStyle = '#457b9d';
    ctx.beginPath();
    ctx.roundRect(-w * 0.35, -h * 0.2, w * 0.7, h * 0.3, 4);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#2d2d2d';
    const wheelW = 10;
    const wheelH = 16;
    ctx.fillRect(-w / 2 - wheelW / 2, -h * 0.3, wheelW, wheelH);
    ctx.fillRect(w / 2 - wheelW / 2, -h * 0.3, wheelW, wheelH);
    ctx.fillRect(-w / 2 - wheelW / 2, h * 0.15, wheelW, wheelH);
    ctx.fillRect(w / 2 - wheelW / 2, h * 0.15, wheelW, wheelH);

    ctx.restore();
  }
}
