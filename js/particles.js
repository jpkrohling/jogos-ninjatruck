export class Particle {
  constructor(x, y, vx, vy, color, life, size, glow, shape) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.dead = false;
    this.glow = glow || false;
    this.shape = shape || 'circle'; // circle, star, spark
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 10;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 80 * dt; // slight gravity
    this.rotation += this.rotSpeed * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    const s = this.size * (0.5 + alpha * 0.5);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.glow) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = s * 2;
    }

    ctx.fillStyle = this.color;

    if (this.shape === 'star') {
      this.drawStar(ctx, s);
    } else if (this.shape === 'spark') {
      // Elongated spark
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.3, s, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawStar(ctx, s) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i === 0 ? s : s;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](Math.cos(a) * r, Math.sin(a) * r);
      const a2 = a + (2 * Math.PI) / 10;
      ctx.lineTo(Math.cos(a2) * s * 0.4, Math.sin(a2) * s * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, colors, speedMin, speedMax, lifeMin, lifeMax, sizeMin, sizeMax, glow, shape) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = lifeMin + Math.random() * (lifeMax - lifeMin);
      const size = sizeMin + Math.random() * (sizeMax - sizeMin);
      this.particles.push(new Particle(x, y, vx, vy, color, life, size, glow, shape));
    }
  }

  emitShake(x, y) {
    // Big burst with stars and glowing particles
    this.emit(x, y, 10, ['#ffcc00', '#ff6600', '#ffffff'], 150, 350, 0.4, 1.0, 4, 10, true, 'star');
    this.emit(x, y, 8, ['#ff3b30', '#ff8800', '#ffdd44'], 80, 200, 0.3, 0.7, 3, 6, true, 'circle');
    this.emit(x, y, 6, ['#ffffff', '#ffee88'], 200, 400, 0.2, 0.5, 2, 4, false, 'spark');
  }

  emitTurbo(x, y) {
    this.emit(x, y, 4, ['#ff4400', '#ff8800', '#ffcc00'], 30, 120, 0.15, 0.35, 3, 7, true, 'circle');
    this.emit(x, y, 2, ['#ffee44', '#ffffff'], 50, 150, 0.1, 0.25, 1, 3, false, 'spark');
  }

  emitEnemyFlung(x, y, color) {
    this.emit(x, y, 12, [color, '#ffffff', '#ffcc00'], 100, 300, 0.3, 0.8, 3, 8, true, 'star');
    this.emit(x, y, 6, [color, '#ffddaa'], 60, 180, 0.2, 0.5, 2, 5, false, 'spark');
  }

  emitLevelComplete(x, y) {
    const colors = ['#43e97b', '#38f9d7', '#f093fb', '#f5576c', '#ffd700', '#ffffff'];
    this.emit(x, y, 30, colors, 100, 400, 0.5, 1.5, 4, 10, true, 'star');
    this.emit(x, y, 20, colors, 50, 200, 0.8, 2.0, 3, 8, false, 'circle');
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
