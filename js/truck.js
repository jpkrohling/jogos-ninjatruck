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
    const tireR = 14; // big monster truck tire radius

    // Ground shadow (wide, for lifted truck)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.5 + 8, w * 0.75, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // === TURBO FLAMES ===
    if (this.turboActive) {
      const grd = ctx.createRadialGradient(0, h * 0.5, 0, 0, h * 0.5 + 30, 35);
      grd.addColorStop(0, 'rgba(255,100,0,0.6)');
      grd.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, h * 0.5 + 8, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.moveTo(-w * 0.35, h * 0.45);
      ctx.quadraticCurveTo(-w * 0.1, h * 0.5 + 28 + Math.random() * 12, 0, h * 0.5 + 35 + Math.random() * 15);
      ctx.quadraticCurveTo(w * 0.1, h * 0.5 + 28 + Math.random() * 12, w * 0.35, h * 0.45);
      ctx.fill();

      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.moveTo(-w * 0.25, h * 0.47);
      ctx.quadraticCurveTo(0, h * 0.5 + 20 + Math.random() * 10, w * 0.25, h * 0.47);
      ctx.fill();

      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      ctx.moveTo(-w * 0.12, h * 0.48);
      ctx.quadraticCurveTo(0, h * 0.5 + 14 + Math.random() * 8, w * 0.12, h * 0.48);
      ctx.fill();
    }

    // === MASSIVE MONSTER TRUCK WHEELS ===
    const wheelCenters = [
      [-w * 0.42, -h * 0.25], // front-left
      [w * 0.42, -h * 0.25],  // front-right
      [-w * 0.42, h * 0.25],  // rear-left
      [w * 0.42, h * 0.25],   // rear-right
    ];
    for (const [wx, wy] of wheelCenters) {
      // Tire outer
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(wx, wy, tireR, 0, Math.PI * 2);
      ctx.fill();

      // Tread ridges
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + performance.now() * 0.003;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * (tireR - 4), wy + Math.sin(a) * (tireR - 4));
        ctx.lineTo(wx + Math.cos(a) * tireR, wy + Math.sin(a) * tireR);
        ctx.stroke();
      }

      // Inner tire ring
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, wy, tireR - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Rim
      const rimGrad = ctx.createRadialGradient(wx - 1, wy - 1, 0, wx, wy, tireR * 0.55);
      rimGrad.addColorStop(0, '#ccc');
      rimGrad.addColorStop(0.5, '#999');
      rimGrad.addColorStop(1, '#666');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(wx, wy, tireR * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Rim spokes
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * 2, wy + Math.sin(a) * 2);
        ctx.lineTo(wx + Math.cos(a) * (tireR * 0.45), wy + Math.sin(a) * (tireR * 0.45));
        ctx.stroke();
      }

      // Hub bolt
      ctx.fillStyle = '#aaa';
      ctx.beginPath();
      ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // === SUSPENSION / AXLES (connecting wheels to body) ===
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    // Front axle
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, -h * 0.25);
    ctx.lineTo(w * 0.42, -h * 0.25);
    ctx.stroke();
    // Rear axle
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, h * 0.25);
    ctx.lineTo(w * 0.42, h * 0.25);
    ctx.stroke();
    // Shock absorbers (diagonal lines from body to wheel area)
    ctx.strokeStyle = '#ffa500';
    ctx.lineWidth = 2;
    const shockPairs = [
      [-w * 0.25, -h * 0.15, -w * 0.38, -h * 0.25],
      [w * 0.25, -h * 0.15, w * 0.38, -h * 0.25],
      [-w * 0.25, h * 0.15, -w * 0.38, h * 0.25],
      [w * 0.25, h * 0.15, w * 0.38, h * 0.25],
    ];
    for (const [x1, y1, x2, y2] of shockPairs) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // === BODY (narrower than wheel span = lifted look) ===
    const bw = w * 0.65; // body width (narrower than wheel span)
    const bh = h * 0.75; // body height

    // Body with gradient
    const bodyGrad = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
    bodyGrad.addColorStop(0, '#ff5a5a');
    bodyGrad.addColorStop(0.3, '#e63946');
    bodyGrad.addColorStop(0.7, '#c1121f');
    bodyGrad.addColorStop(1, '#991118');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 8);
    ctx.stroke();

    // Racing stripe (center)
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(-2, -bh / 2, 4, bh);

    // Side stripes (gold)
    ctx.fillStyle = 'rgba(255,200,0,0.3)';
    ctx.fillRect(-bw / 2 + 3, -bh / 2, 3, bh);
    ctx.fillRect(bw / 2 - 6, -bh / 2, 3, bh);

    // Hood scoop (front of body)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(-bw * 0.2, -bh / 2 + 3, bw * 0.4, 8, 3);
    ctx.fill();
    // Scoop intake glow
    ctx.fillStyle = 'rgba(255,100,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(-bw * 0.15, -bh / 2 + 5, bw * 0.3, 4, 2);
    ctx.fill();

    // Cabin / windshield
    const cabGrad = ctx.createLinearGradient(0, -bh * 0.15, 0, bh * 0.15);
    cabGrad.addColorStop(0, '#7ec8e3');
    cabGrad.addColorStop(0.4, '#457b9d');
    cabGrad.addColorStop(1, '#2a5070');
    ctx.fillStyle = cabGrad;
    ctx.beginPath();
    ctx.roundRect(-bw * 0.35, -bh * 0.15, bw * 0.7, bh * 0.3, 4);
    ctx.fill();

    // Windshield shine
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.roundRect(-bw * 0.3, -bh * 0.13, bw * 0.35, bh * 0.1, 3);
    ctx.fill();

    // Headlights (front, on body)
    ctx.fillStyle = '#ffffaa';
    ctx.shadowColor = '#ffffaa';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-bw * 0.35, -bh * 0.42, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bw * 0.35, -bh * 0.42, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Taillights (rear)
    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-bw * 0.35, bh * 0.42, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bw * 0.35, bh * 0.42, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Front bumper / bull bar
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-bw * 0.42, -bh / 2 - 3, bw * 0.84, 6, 3);
    ctx.stroke();

    // Roll cage bars on top (visible through cabin)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.3, -bh * 0.15);
    ctx.lineTo(-bw * 0.3, bh * 0.15);
    ctx.moveTo(bw * 0.3, -bh * 0.15);
    ctx.lineTo(bw * 0.3, bh * 0.15);
    ctx.stroke();

    // === MOUNTED ENEMIES INDICATOR ===
    if (this.mountedCount > 0) {
      const pulseAlpha = 0.15 + Math.sin(performance.now() * 0.005) * 0.1;
      ctx.fillStyle = `rgba(255,0,0,${pulseAlpha})`;
      ctx.beginPath();
      ctx.roundRect(-bw / 2 - 4, -bh / 2 - 4, bw + 8, bh + 8, 12);
      ctx.fill();
    }

    // === TURBO GLOW ===
    if (this.turboActive) {
      ctx.strokeStyle = 'rgba(255,150,0,0.5)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(-bw / 2 - 2, -bh / 2 - 2, bw + 4, bh + 4, 10);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
