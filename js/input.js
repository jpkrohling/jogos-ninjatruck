export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.moveX = 0;
    this.moveY = 0;
    this.turboPressed = false;
    this.shakePressed = false;
    this.pausePressed = false;

    this.keys = {};
    this.isMobile = 'ontouchstart' in window;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch joystick state
    this.joystickActive = false;
    this.joystickStartX = 0;
    this.joystickStartY = 0;
    this.joystickX = 0;
    this.joystickY = 0;
    this.joystickTouchId = null;
    this.joystickRadius = 50;

    if (this.isMobile) {
      this.createTouchButtons();
      canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
      canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
      canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    }
  }

  createTouchButtons() {
    const container = document.createElement('div');
    container.id = 'touch-buttons';

    const turboBtn = document.createElement('button');
    turboBtn.id = 'btn-turbo';
    turboBtn.className = 'touch-btn touch-btn-turbo';
    turboBtn.textContent = 'TURBO';
    turboBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.turboPressed = true; });
    turboBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.turboPressed = false; });

    const shakeBtn = document.createElement('button');
    shakeBtn.id = 'btn-shake';
    shakeBtn.className = 'touch-btn touch-btn-shake';
    shakeBtn.textContent = 'SACUDIR';
    shakeBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.shakePressed = true; });
    shakeBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.shakePressed = false; });

    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'btn-pause';
    pauseBtn.className = 'touch-btn touch-btn-pause';
    pauseBtn.textContent = 'II';
    pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.pausePressed = true; });

    container.appendChild(turboBtn);
    container.appendChild(shakeBtn);
    document.body.appendChild(container);
    document.body.appendChild(pauseBtn);
  }

  onTouchStart(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.clientX < this.canvas.width / 2 && this.joystickTouchId === null) {
        this.joystickTouchId = touch.identifier;
        this.joystickActive = true;
        this.joystickStartX = touch.clientX;
        this.joystickStartY = touch.clientY;
        this.joystickX = 0;
        this.joystickY = 0;
      }
    }
  }

  onTouchMove(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.joystickTouchId) {
        const dx = touch.clientX - this.joystickStartX;
        const dy = touch.clientY - this.joystickStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this.joystickRadius;
        if (dist > maxDist) {
          this.joystickX = (dx / dist) * maxDist;
          this.joystickY = (dy / dist) * maxDist;
        } else {
          this.joystickX = dx;
          this.joystickY = dy;
        }
      }
    }
  }

  onTouchEnd(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.joystickTouchId) {
        this.joystickTouchId = null;
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
      }
    }
  }

  update() {
    this.moveX = 0;
    this.moveY = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.moveX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.moveX += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) this.moveY -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) this.moveY += 1;

    if (this.keys['Space']) this.turboPressed = true;
    if (this.keys['KeyE'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) this.shakePressed = true;
    if (this.keys['KeyP']) {
      this.keys['KeyP'] = false;
      this.pausePressed = true;
    }

    if (this.joystickActive) {
      this.moveX = this.joystickX / this.joystickRadius;
      this.moveY = this.joystickY / this.joystickRadius;
    }
  }

  consumeTurbo() {
    const v = this.turboPressed;
    this.turboPressed = false;
    if (this.keys['Space']) this.keys['Space'] = false;
    return v;
  }

  consumeShake() {
    const v = this.shakePressed;
    this.shakePressed = false;
    if (this.keys['KeyE']) this.keys['KeyE'] = false;
    if (this.keys['ShiftLeft']) this.keys['ShiftLeft'] = false;
    if (this.keys['ShiftRight']) this.keys['ShiftRight'] = false;
    return v;
  }

  consumePause() {
    const v = this.pausePressed;
    this.pausePressed = false;
    return v;
  }

  showButtons(turbo, shake) {
    if (!this.isMobile) return;
    const turboBtn = document.getElementById('btn-turbo');
    const shakeBtn = document.getElementById('btn-shake');
    if (turboBtn) turboBtn.style.display = turbo ? 'flex' : 'none';
    if (shakeBtn) shakeBtn.style.display = shake ? 'flex' : 'none';
  }

  drawJoystick(ctx) {
    if (!this.joystickActive) return;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(this.joystickStartX, this.joystickStartY, this.joystickRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(this.joystickStartX + this.joystickX, this.joystickStartY + this.joystickY, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}
