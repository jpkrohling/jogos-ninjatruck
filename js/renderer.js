export function drawHUD(ctx, game) {
  const { truck, levelConfig, levelTimer, currentLevel, canvas } = game;
  if (!truck || !levelConfig) return;

  const padding = 15;
  const barWidth = 200;
  const barHeight = 20;

  // Speed bar (top center)
  const barX = (canvas.width - barWidth) / 2;
  const barY = padding;
  const speedPercent = truck.currentSpeed / truck.baseSpeed;

  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 6);
  ctx.fill();

  if (speedPercent > 0) {
    let barColor;
    if (speedPercent > 0.6) barColor = '#34c759';
    else if (speedPercent > 0.3) barColor = '#ffcc00';
    else barColor = '#ff3b30';

    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * speedPercent, barHeight, 6);
    ctx.fill();
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('VELOCIDADE', canvas.width / 2, barY + barHeight + 14);

  // Level number (top left)
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('N\u00EDvel ' + currentLevel, padding, padding + 16);

  // Timer (top right)
  const timeLeft = Math.max(0, Math.ceil(levelTimer));
  ctx.textAlign = 'right';
  ctx.fillStyle = timeLeft <= 10 ? '#ff3b30' : '#fff';
  ctx.fillText(timeLeft + 's', canvas.width - padding, padding + 16);

  // Ability indicators (bottom center)
  const indicatorY = canvas.height - 50;
  ctx.textAlign = 'center';
  ctx.font = '14px system-ui';

  if (truck.turboAvailable) {
    const turboReady = !truck.turboActive && truck.turboCooldownTimer <= 0;
    const turboX = canvas.width / 2 - 60;
    ctx.fillStyle = turboReady ? '#0a84ff' : '#555';
    ctx.beginPath();
    ctx.roundRect(turboX - 40, indicatorY - 12, 80, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    const turboText = truck.turboActive ? 'TURBO!' : turboReady ? 'TURBO' : Math.ceil(truck.turboCooldownTimer) + 's';
    ctx.fillText(turboText, turboX, indicatorY + 7);
  }

  if (truck.shakeAvailable) {
    const shakeReady = !truck.shakeActive && truck.shakeCooldownTimer <= 0;
    const shakeX = canvas.width / 2 + 60;
    ctx.fillStyle = shakeReady ? '#ff9f0a' : '#555';
    ctx.beginPath();
    ctx.roundRect(shakeX - 40, indicatorY - 12, 80, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    const shakeText = shakeReady ? 'SACUDIR' : Math.ceil(truck.shakeCooldownTimer) + 's';
    ctx.fillText(shakeText, shakeX, indicatorY + 7);
  }
}

export function drawArena(ctx, game) {
  const { arenaX, arenaY, arenaWidth, arenaHeight } = game;

  ctx.fillStyle = '#16213e';
  ctx.fillRect(arenaX, arenaY, arenaWidth, arenaHeight);

  // Grid lines for texture
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = arenaX; x < arenaX + arenaWidth; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, arenaY);
    ctx.lineTo(x, arenaY + arenaHeight);
    ctx.stroke();
  }
  for (let y = arenaY; y < arenaY + arenaHeight; y += 40) {
    ctx.beginPath();
    ctx.moveTo(arenaX, y);
    ctx.lineTo(arenaX + arenaWidth, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#e2e2e2';
  ctx.lineWidth = 3;
  ctx.strokeRect(arenaX, arenaY, arenaWidth, arenaHeight);
}

export function drawPaused(ctx, canvas) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSADO', canvas.width / 2, canvas.height / 2);
  ctx.font = '20px system-ui';
  ctx.fillText('Aperte P pra continuar', canvas.width / 2, canvas.height / 2 + 40);
}
