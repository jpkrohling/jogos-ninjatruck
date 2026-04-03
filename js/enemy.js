import { distance, angle } from './utils.js';

export const EnemyState = {
  APPROACHING: 'approaching',
  GRABBING: 'grabbing',
  MOUNTED: 'mounted',
  FLUNG: 'flung'
};

export class Enemy {
  constructor(x, y, speed, variant) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.speed = speed;
    this.state = EnemyState.APPROACHING;
    this.variant = variant;
    this.grabTimer = 0;
    this.grabDuration = 2;
    this.dead = false;

    // Flung animation
    this.flungVx = 0;
    this.flungVy = 0;
    this.flungTimer = 0;
    this.flungDuration = 0.5;
    this.flungAlpha = 1;

    // Mount offset (position on truck)
    this.mountAngle = Math.random() * Math.PI * 2;
  }

  update(dt, truck) {
    if (this.state === EnemyState.APPROACHING) {
      const a = angle(this.x, this.y, truck.x, truck.y);
      this.x += Math.cos(a) * this.speed * dt;
      this.y += Math.sin(a) * this.speed * dt;

      const dist = distance(this.x, this.y, truck.x, truck.y);
      if (dist < this.radius + Math.max(truck.width, truck.height) / 2) {
        this.state = EnemyState.GRABBING;
        this.grabTimer = 0;
      }
    }

    if (this.state === EnemyState.GRABBING) {
      this.x = truck.x + Math.cos(this.mountAngle) * (truck.width * 0.6);
      this.y = truck.y + Math.sin(this.mountAngle) * (truck.height * 0.6);

      this.grabTimer += dt;
      const grabTime = truck.turboActive ? this.grabDuration * 2 : this.grabDuration;
      if (this.grabTimer >= grabTime) {
        this.state = EnemyState.MOUNTED;
        truck.enemyMounted();
      }
    }

    if (this.state === EnemyState.MOUNTED) {
      this.x = truck.x + Math.cos(this.mountAngle) * (truck.width * 0.4);
      this.y = truck.y + Math.sin(this.mountAngle) * (truck.height * 0.4);
    }

    if (this.state === EnemyState.FLUNG) {
      this.x += this.flungVx * dt;
      this.y += this.flungVy * dt;
      this.flungTimer += dt;
      this.flungAlpha = 1 - (this.flungTimer / this.flungDuration);
      if (this.flungTimer >= this.flungDuration) {
        this.dead = true;
      }
    }
  }

  fling() {
    if (this.state !== EnemyState.GRABBING) return false;
    this.state = EnemyState.FLUNG;
    const flingSpeed = 600;
    this.flungVx = Math.cos(this.mountAngle) * flingSpeed;
    this.flungVy = Math.sin(this.mountAngle) * flingSpeed;
    this.flungTimer = 0;
    return true;
  }

  draw(ctx) {
    ctx.save();

    if (this.state === EnemyState.FLUNG) {
      ctx.globalAlpha = Math.max(0, this.flungAlpha);
      // Spin when flung
      ctx.translate(this.x, this.y);
      ctx.rotate(this.flungTimer * 15);
    } else {
      ctx.translate(this.x, this.y);
    }

    const r = this.radius;
    const t = performance.now();

    // Wobble animation when approaching
    if (this.state === EnemyState.APPROACHING) {
      const wobble = Math.sin(t * 0.008 + this.mountAngle * 10) * 0.1;
      ctx.rotate(wobble);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, r + 2, r * 0.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grabbing glow ring
    if (this.state === EnemyState.GRABBING) {
      const pulseR = r + 5 + Math.sin(t * 0.01) * 3;
      const glow = ctx.createRadialGradient(0, 0, r, 0, 0, pulseR + 4);
      glow.addColorStop(0, 'rgba(255,204,0,0.4)');
      glow.addColorStop(1, 'rgba(255,204,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -t * 0.02;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Mounted danger glow
    if (this.state === EnemyState.MOUNTED) {
      const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r + 6);
      glow.addColorStop(0, 'rgba(255,50,50,0.3)');
      glow.addColorStop(1, 'rgba(255,50,50,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body with gradient
    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    bodyGrad.addColorStop(0, this.variant.accentColor);
    bodyGrad.addColorStop(0.4, this.variant.bodyColor);
    bodyGrad.addColorStop(1, this.variant.bodyColor);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Headband / accent stripe
    ctx.fillStyle = this.variant.accentColor;
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.9, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.lineTo(r * 0.65, -r * 0.05);
    ctx.arc(0, -r * 0.15, r * 0.55, -Math.PI * 0.15, -Math.PI * 0.85, true);
    ctx.closePath();
    ctx.fill();

    // Eyes - white with shine
    const eyeY = -r * 0.15;
    const eyeSpread = r * 0.3;
    for (const ex of [-eyeSpread, eyeSpread]) {
      // White
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 3.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pupil
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(ex + 0.5, eyeY + 0.5, 2, 0, Math.PI * 2);
      ctx.fill();
      // Shine
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex + 1.2, eyeY - 1, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth - angry for approaching, determined for grabbing
    if (this.state === EnemyState.APPROACHING) {
      // Determined grin
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, r * 0.05, r * 0.3, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (this.state === EnemyState.GRABBING) {
      // Mischievous grin
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.25, 0, Math.PI);
      ctx.fill();
    } else if (this.state === EnemyState.MOUNTED) {
      // Victorious smile
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, r * 0.05, r * 0.3, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(0, r * 0.05, r * 0.2, 0, Math.PI);
      ctx.fill();
    }

    // Shine highlight on body
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.35, r * 0.35, r * 0.25, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
