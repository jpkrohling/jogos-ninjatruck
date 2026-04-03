export class Particle {
  constructor(x, y, vx, vy, color, life, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, colors, speedMin, speedMax, lifeMin, lifeMax, sizeMin, sizeMax) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = lifeMin + Math.random() * (lifeMax - lifeMin);
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      this.particles.push(new Particle(x, y, vx, vy, color, life, size));
    }
  }

  emitShake(x, y) {
    this.emit(x, y, 15, ['#ffcc00', '#ff6600', '#ff3b30', '#ffffff'], 100, 300, 0.3, 0.8, 3, 8);
  }

  emitTurbo(x, y) {
    this.emit(x, y, 3, ['#ff6600', '#ffcc00', '#ff3b30'], 50, 150, 0.2, 0.4, 2, 5);
  }

  emitEnemyFlung(x, y, color) {
    this.emit(x, y, 8, [color, '#ffffff', '#ffcc00'], 80, 200, 0.3, 0.6, 2, 6);
  }

  update(dt) {
    for (const p of this.particles) {
      p.update(dt);
    }
    this.particles = this.particles.filter(p => !p.dead);
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }
}
