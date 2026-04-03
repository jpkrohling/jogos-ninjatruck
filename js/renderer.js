// Starfield - generated once, drawn every frame
let stars = null;

function ensureStars(canvas) {
  if (stars && stars.canvasW === canvas.width && stars.canvasH === canvas.height) return;
  const count = 80;
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.5,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    });
  }
  stars = { list, canvasW: canvas.width, canvasH: canvas.height };
}

export function drawBackground(ctx, canvas) {
  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#0f0c29');
  bgGrad.addColorStop(0.5, '#1a0a2e');
  bgGrad.addColorStop(1, '#24243e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Twinkling stars
  ensureStars(canvas);
  const t = performance.now() * 0.001;
  for (const s of stars.list) {
    const alpha = 0.3 + Math.sin(t * s.speed + s.phase) * 0.35;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawArena(ctx, game) {
  const { arenaX, arenaY, arenaWidth, arenaHeight } = game;

  // Arena floor with gradient
  const floorGrad = ctx.createRadialGradient(
    arenaX + arenaWidth / 2, arenaY + arenaHeight / 2, 0,
    arenaX + arenaWidth / 2, arenaY + arenaHeight / 2, arenaWidth * 0.7
  );
  floorGrad.addColorStop(0, '#1e2d4a');
  floorGrad.addColorStop(1, '#0f1923');
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.roundRect(arenaX, arenaY, arenaWidth, arenaHeight, 12);
  ctx.fill();

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = arenaX + 40; x < arenaX + arenaWidth; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, arenaY);
    ctx.lineTo(x, arenaY + arenaHeight);
    ctx.stroke();
  }
  for (let y = arenaY + 40; y < arenaY + arenaHeight; y += 40) {
    ctx.beginPath();
    ctx.moveTo(arenaX, y);
    ctx.lineTo(arenaX + arenaWidth, y);
    ctx.stroke();
  }

  // Glowing border
  ctx.shadowColor = '#667eea';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(102,126,234,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(arenaX, arenaY, arenaWidth, arenaHeight, 12);
  ctx.stroke();

  // Inner border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(arenaX + 3, arenaY + 3, arenaWidth - 6, arenaHeight - 6, 10);
  ctx.stroke();

  // Corner decorations
  const cornerSize = 15;
  ctx.strokeStyle = 'rgba(102,126,234,0.4)';
  ctx.lineWidth = 2;
  const corners = [
    [arenaX + 8, arenaY + 8],
    [arenaX + arenaWidth - 8, arenaY + 8],
    [arenaX + 8, arenaY + arenaHeight - 8],
    [arenaX + arenaWidth - 8, arenaY + arenaHeight - 8],
  ];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, cornerSize, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawHUD(ctx, game) {
  const { truck, levelConfig, levelTimer, currentLevel, canvas } = game;
  if (!truck || !levelConfig) return;

  const padding = 18;
  const barWidth = 220;
  const barHeight = 22;

  // HUD background strip
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, 50, 0);
  ctx.fill();

  // Speed bar (top center)
  const barX = (canvas.width - barWidth) / 2;
  const barY = padding - 4;
  const speedPercent = truck.currentSpeed / truck.baseSpeed;

  // Bar background
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 8);
  ctx.fill();

  if (speedPercent > 0) {
    let barGrad;
    if (speedPercent > 0.6) {
      barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      barGrad.addColorStop(0, '#43e97b');
      barGrad.addColorStop(1, '#38f9d7');
    } else if (speedPercent > 0.3) {
      barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      barGrad.addColorStop(0, '#f5af19');
      barGrad.addColorStop(1, '#f12711');
    } else {
      barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
      barGrad.addColorStop(0, '#ff416c');
      barGrad.addColorStop(1, '#ff4b2b');
    }

    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * speedPercent, barHeight, 8);
    ctx.fill();

    // Shine on bar
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, barWidth * speedPercent - 4, barHeight * 0.4, 4);
    ctx.fill();
  }

  // Bar glow when low
  if (speedPercent > 0 && speedPercent <= 0.3) {
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255,68,68,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * speedPercent, barHeight, 8);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = "bold 10px 'Nunito', system-ui";
  ctx.textAlign = 'center';
  ctx.fillText('VELOCIDADE', canvas.width / 2, barY + barHeight + 12);

  // Level number (top left) - styled
  ctx.fillStyle = '#fff';
  ctx.font = "bold 16px 'Fredoka One', cursive";
  ctx.textAlign = 'left';
  ctx.fillText('N\u00EDvel ' + currentLevel, padding, padding + 10);

  // Timer (top right)
  const timeLeft = Math.max(0, Math.ceil(levelTimer));
  ctx.textAlign = 'right';
  ctx.font = "bold 16px 'Fredoka One', cursive";
  if (timeLeft <= 10) {
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 8;
    // Pulsing size
    const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.1;
    ctx.font = `bold ${16 * pulse}px 'Fredoka One', cursive`;
  } else {
    ctx.fillStyle = '#fff';
  }
  ctx.fillText(timeLeft + 's', canvas.width - padding, padding + 10);
  ctx.shadowBlur = 0;

  // Ability indicators (bottom center)
  const indicatorY = canvas.height - 52;
  ctx.textAlign = 'center';
  ctx.font = "bold 13px 'Nunito', system-ui";

  if (truck.turboAvailable) {
    const turboReady = !truck.turboActive && truck.turboCooldownTimer <= 0;
    const turboX = canvas.width / 2 - 65;

    // Button background with glow
    if (turboReady) {
      ctx.shadowColor = '#0a84ff';
      ctx.shadowBlur = 12;
    }
    const tbGrad = ctx.createLinearGradient(turboX - 42, indicatorY - 14, turboX - 42, indicatorY + 22);
    tbGrad.addColorStop(0, turboReady ? 'rgba(10,132,255,0.7)' : 'rgba(80,80,80,0.5)');
    tbGrad.addColorStop(1, turboReady ? 'rgba(10,100,200,0.7)' : 'rgba(50,50,50,0.5)');
    ctx.fillStyle = tbGrad;
    ctx.beginPath();
    ctx.roundRect(turboX - 42, indicatorY - 14, 84, 34, 17);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = turboReady ? 'rgba(10,132,255,0.5)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(turboX - 42, indicatorY - 14, 84, 34, 17);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    const turboText = truck.turboActive ? 'TURBO!' : turboReady ? '\u{1F525} TURBO' : '\u23F3 ' + Math.ceil(truck.turboCooldownTimer) + 's';
    ctx.fillText(turboText, turboX, indicatorY + 7);
  }

  if (truck.shakeAvailable) {
    const shakeReady = !truck.shakeActive && truck.shakeCooldownTimer <= 0;
    const shakeX = canvas.width / 2 + 65;

    if (shakeReady) {
      ctx.shadowColor = '#ff9f0a';
      ctx.shadowBlur = 12;
    }
    const sbGrad = ctx.createLinearGradient(shakeX - 42, indicatorY - 14, shakeX - 42, indicatorY + 22);
    sbGrad.addColorStop(0, shakeReady ? 'rgba(255,159,10,0.7)' : 'rgba(80,80,80,0.5)');
    sbGrad.addColorStop(1, shakeReady ? 'rgba(200,120,10,0.7)' : 'rgba(50,50,50,0.5)');
    ctx.fillStyle = sbGrad;
    ctx.beginPath();
    ctx.roundRect(shakeX - 42, indicatorY - 14, 84, 34, 17);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = shakeReady ? 'rgba(255,159,10,0.5)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(shakeX - 42, indicatorY - 14, 84, 34, 17);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    const shakeText = shakeReady ? '\u{1F4A5} SACUDIR' : '\u23F3 ' + Math.ceil(truck.shakeCooldownTimer) + 's';
    ctx.fillText(shakeText, shakeX, indicatorY + 7);
  }
}

export function drawPaused(ctx, canvas) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Glassmorphism panel
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  const panelW = 280;
  const panelH = 120;
  const px = (canvas.width - panelW) / 2;
  const py = (canvas.height - panelH) / 2;
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, 20);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = "bold 36px 'Fredoka One', cursive";
  ctx.textAlign = 'center';
  ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2 - 5);
  ctx.font = "16px 'Nunito', system-ui";
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Aperte P pra continuar', canvas.width / 2, canvas.height / 2 + 28);
}
