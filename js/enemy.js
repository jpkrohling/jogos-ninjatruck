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
    }

    ctx.translate(this.x, this.y);

    // Body circle
    ctx.fillStyle = this.variant.bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Accent (headband/feature)
    ctx.fillStyle = this.variant.accentColor;
    ctx.beginPath();
    ctx.arc(0, -2, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -3, 3, 0, Math.PI * 2);
    ctx.arc(4, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-4, -3, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Grabbing indicator - pulsing outline
    if (this.state === EnemyState.GRABBING) {
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 3 + Math.sin(performance.now() * 0.01) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Mounted indicator
    if (this.state === EnemyState.MOUNTED) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
