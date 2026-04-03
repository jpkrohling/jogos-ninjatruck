import { themes } from './themes.js';
import { getLevel } from './level.js';

export class UI {
  constructor(game) {
    this.game = game;
    this.overlay = document.createElement('div');
    this.overlay.id = 'ui-overlay';
    document.body.appendChild(this.overlay);
  }

  clearOverlay() {
    while (this.overlay.firstChild) {
      this.overlay.removeChild(this.overlay.firstChild);
    }
  }

  show() {
    this.overlay.style.display = 'flex';
  }

  hide() {
    this.overlay.style.display = 'none';
    this.clearOverlay();
  }

  createEl(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  showTitle() {
    this.clearOverlay();
    const screen = this.createEl('div', 'screen title-screen');

    screen.appendChild(this.createEl('h1', 'game-title', 'NinjaTruck'));
    screen.appendChild(this.createEl('p', 'game-subtitle', 'N\u00E3o deixe ningu\u00E9m subir no seu truck!'));

    const grid = this.createEl('div', 'theme-grid');

    for (const [key, theme] of Object.entries(themes)) {
      const btn = this.createEl('button', 'theme-btn');
      btn.dataset.theme = key;
      btn.appendChild(this.createEl('span', 'theme-emoji', theme.emoji));
      btn.appendChild(this.createEl('span', 'theme-name', theme.name));

      btn.addEventListener('click', () => {
        this.game.audio.init();
        this.game.selectedTheme = key;
        this.game.lives = this.game.maxLives;
        this.hide();
        this.game.startLevel(1);
      });

      grid.appendChild(btn);
    }

    screen.appendChild(grid);
    this.overlay.appendChild(screen);
    this.show();
  }

  showLevelComplete() {
    this.clearOverlay();
    const screen = this.createEl('div', 'screen');
    const stats = this.game.levelStats;
    const nextLevel = this.game.currentLevel + 1;
    const nextConfig = getLevel(nextLevel);

    screen.appendChild(this.createEl('h1', null, 'N\u00EDvel ' + this.game.currentLevel + ' completo!'));

    const statsDiv = this.createEl('div', 'stats');
    statsDiv.appendChild(this.createEl('p', null, 'Inimigos que subiram: ' + stats.mounted));
    statsDiv.appendChild(this.createEl('p', null, 'Inimigos sacudidos: ' + stats.shaken));
    screen.appendChild(statsDiv);

    if (nextConfig && nextConfig.unlockMessage) {
      screen.appendChild(this.createEl('p', 'unlock-msg', nextConfig.unlockMessage));
    }

    const btn = this.createEl('button', 'action-btn', 'Pr\u00F3ximo n\u00EDvel');
    btn.addEventListener('click', () => {
      this.hide();
      this.game.startLevel(nextLevel);
    });
    screen.appendChild(btn);

    this.overlay.appendChild(screen);
    this.show();
  }

  showLostLife() {
    this.clearOverlay();
    const screen = this.createEl('div', 'screen');

    screen.appendChild(this.createEl('h1', null, 'Os inimigos pararam o truck!'));

    const livesDiv = this.createEl('div', 'stats');
    const heartsText = '\u2764\uFE0F'.repeat(this.game.lives) + '\u{1F5A4}'.repeat(this.game.maxLives - this.game.lives);
    livesDiv.appendChild(this.createEl('p', 'lives-display', heartsText));
    livesDiv.appendChild(this.createEl('p', null, 'Voc\u00EA ainda tem ' + this.game.lives + (this.game.lives === 1 ? ' chance!' : ' chances!')));
    screen.appendChild(livesDiv);

    const btn = this.createEl('button', 'action-btn', 'Tentar de novo');
    btn.addEventListener('click', () => {
      this.hide();
      this.game.startLevel(this.game.currentLevel);
    });
    screen.appendChild(btn);

    this.overlay.appendChild(screen);
    this.show();
  }

  showGameOver() {
    this.clearOverlay();
    const screen = this.createEl('div', 'screen');

    screen.appendChild(this.createEl('h1', null, 'Acabaram as chances!'));

    const statsDiv = this.createEl('div', 'stats');
    statsDiv.appendChild(this.createEl('p', null, 'Voc\u00EA chegou at\u00E9 o n\u00EDvel ' + this.game.currentLevel));
    statsDiv.appendChild(this.createEl('p', null, 'Inimigos que subiram: ' + this.game.levelStats.mounted));
    statsDiv.appendChild(this.createEl('p', null, 'Inimigos sacudidos: ' + this.game.levelStats.shaken));
    screen.appendChild(statsDiv);

    const btn = this.createEl('button', 'action-btn', 'Jogar de novo');
    btn.addEventListener('click', () => {
      this.hide();
      this.game.lives = this.game.maxLives;
      this.game.startLevel(1);
    });
    screen.appendChild(btn);

    this.overlay.appendChild(screen);
    this.show();
  }

  showVictory() {
    this.clearOverlay();
    const screen = this.createEl('div', 'screen');

    screen.appendChild(this.createEl('h1', null, 'Voc\u00EA escapou de todos!'));
    screen.appendChild(this.createEl('p', 'game-subtitle', 'Parab\u00E9ns! Voc\u00EA completou todos os 5 n\u00EDveis!'));

    const btn = this.createEl('button', 'action-btn', 'Jogar de novo');
    btn.addEventListener('click', () => {
      this.hide();
      this.game.state = 'title';
      this.showTitle();
    });
    screen.appendChild(btn);

    this.overlay.appendChild(screen);
    this.show();
  }
}
