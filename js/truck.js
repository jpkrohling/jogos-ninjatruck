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
      ctx.translate(Math.sin(performance.now() * 0.05) * 6, 0);
    }

    const w = this.width;
    const h = this.height;

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.5 + 4, w * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turbo flames (layered glow)
    if (this.turboActive) {
      // Outer glow
      const grd = ctx.createRadialGradient(0, h * 0.5, 0, 0, h * 0.5 + 25, 30);
      grd.addColorStop(0, 'rgba(255,100,0,0.6)');
      grd.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, h * 0.5 + 5, 30, 0, Math.PI * 2);
      ctx.fill();

      // Outer flame
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.moveTo(-w * 0.35, h * 0.45);
      ctx.quadraticCurveTo(-w * 0.1, h * 0.5 + 25 + Math.random() * 12, 0, h * 0.5 + 30 + Math.random() * 15);
      ctx.quadraticCurveTo(w * 0.1, h * 0.5 + 25 + Math.random() * 12, w * 0.35, h * 0.45);
      ctx.fill();

      // Middle flame
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.moveTo(-w * 0.25, h * 0.47);
      ctx.quadraticCurveTo(-w * 0.05, h * 0.5 + 18 + Math.random() * 10, 0, h * 0.5 + 22 + Math.random() * 10);
      ctx.quadraticCurveTo(w * 0.05, h * 0.5 + 18 + Math.random() * 10, w * 0.25, h * 0.47);
      ctx.fill();

      // Inner flame (bright)
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      ctx.moveTo(-w * 0.12, h * 0.48);
      ctx.quadraticCurveTo(0, h * 0.5 + 14 + Math.random() * 8, w * 0.12, h * 0.48);
      ctx.fill();
    }

    // Wheels (big chunky monster truck wheels)
    const wheelW = 14;
    const wheelH = 20;
    const wheelPositions = [
      [-w / 2 - 3, -h * 0.3],
      [w / 2 - wheelW + 3, -h * 0.3],
      [-w / 2 - 3, h * 0.15],
      [w / 2 - wheelW + 3, h * 0.15],
    ];
    for (const [wx, wy] of wheelPositions) {
      // Tire
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.roundRect(wx, wy, wheelW, wheelH, 4);
      ctx.fill();
      // Tread pattern
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const ty = wy + 3 + i * 5;
        ctx.beginPath();
        ctx.moveTo(wx + 2, ty);
        ctx.lineTo(wx + wheelW - 2, ty);
        ctx.stroke();
      }
      // Hub
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.arc(wx + wheelW / 2, wy + wheelH / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body - main chassis with gradient
    const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, -w / 2, h / 2);
    bodyGrad.addColorStop(0, '#ff4d5a');
    bodyGrad.addColorStop(0.5, '#e63946');
    bodyGrad.addColorStop(1, '#c1121f');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    ctx.stroke();

    // Racing stripes
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-2, -h / 2, 4, h);
    ctx.fillStyle = 'rgba(255,200,0,0.25)';
    ctx.fillRect(-w * 0.3, -h / 2, 3, h);
    ctx.fillRect(w * 0.3 - 3, -h / 2, 3, h);

    // Cabin with glass effect
    const cabGrad = ctx.createLinearGradient(-w * 0.35, -h * 0.2, -w * 0.35, -h * 0.2 + h * 0.3);
    cabGrad.addColorStop(0, '#6db4d8');
    cabGrad.addColorStop(0.3, '#457b9d');
    cabGrad.addColorStop(1, '#2a5070');
    ctx.fillStyle = cabGrad;
    ctx.beginPath();
    ctx.roundRect(-w * 0.32, -h * 0.18, w * 0.64, h * 0.28, 5);
    ctx.fill();

    // Glass shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(-w * 0.28, -h * 0.16, w * 0.3, h * 0.1, 3);
    ctx.fill();

    // Headlights (front)
    ctx.fillStyle = '#ffffaa';
    ctx.shadowColor = '#ffffaa';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(-w * 0.35, -h * 0.48, 10, 6, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(w * 0.35 - 10, -h * 0.48, 10, 6, 3);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bumper (front)
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.roundRect(-w * 0.4, -h * 0.52, w * 0.8, 5, 2);
    ctx.fill();

    // Mounted enemies indicator - red glow when enemies are on
    if (this.mountedCount > 0) {
      const pulseAlpha = 0.15 + Math.sin(performance.now() * 0.005) * 0.1;
      ctx.fillStyle = `rgba(255,0,0,${pulseAlpha})`;
      ctx.beginPath();
      ctx.roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 14);
      ctx.fill();
    }

    // Speed glow (when turbo)
    if (this.turboActive) {
      ctx.strokeStyle = 'rgba(255,150,0,0.5)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
